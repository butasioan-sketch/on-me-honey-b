import { NextResponse } from "next/server";
import { MAX_SHOP_QUANTITY, totalQuantity } from "@/lib/order-limits";
import { getPaymentMethod } from "../../../../data/payments";
import { getProviderMode } from "../../../../lib/paymentProviders";
import {
  calcUnitPriceForProduct,
  calcMerchandiseTotal,
  isBundleEligible,
  PRICE_BUNDLE_ESSENTIAL,
  EXTRA_IMAGE_PRICE,
  INCLUDED_IMAGES,
  type MerchandiseItem,
} from "../../../../lib/pricing";
import { checkRateLimit, clientIp } from "../../../../lib/rate-limit";
import {
  SHIPPING_OPTIONS,
  DEFAULT_SHIPPING_ID,
  type Country,
} from "../../../../lib/shipping";
import { PRODUCTS_133 } from "../../../../lib/products-all-133";
import { getProduct } from "../../../../lib/products";
import { testPrintDone } from "../../../../lib/catalog/test-prints";

type CheckoutItem = {
  productId?: string; // '1' Tee | '2' Shorts — default '1' fuer alte Aufrufer
  name: string;
  size?: string;
  color?: string;
  price?: number; // Client-Wert — wird serverseitig IGNORIERT
  quantity: number;
  designId?: string;
};

type PricedItem = CheckoutItem & {
  productId: string;
  unitPrice: number;
  pages: number;
  qty: number;
};

// Bundle-Preis auf zwei Stripe-Line-Haelften aufteilen, die exakt auf PRICE_BUNDLE_ESSENTIAL summieren.
function splitBundleHalves(): { tee: number; shorts: number } {
  const teeHalf = Math.floor((PRICE_BUNDLE_ESSENTIAL * 100) / 2) / 100;
  const shortsHalf = +(PRICE_BUNDLE_ESSENTIAL - teeHalf).toFixed(2);
  return { tee: teeHalf, shorts: shortsHalf };
}

type Loc = "de" | "ro" | "en";
const LINE_TXT: Record<
  Loc,
  {
    size: string;
    motifs: (n: number) => string;
    setShare: string;
    shipping: string;
  }
> = {
  de: {
    size: "Größe",
    motifs: (n) => `${n} Motiv${n > 1 ? "e" : ""}`,
    setShare: "Set-Anteil",
    shipping: "Versand",
  },
  ro: {
    size: "Mărime",
    motifs: (n) => (n > 1 ? `${n} motive` : `${n} motiv`),
    setShare: "parte din set",
    shipping: "Livrare",
  },
  en: {
    size: "Size",
    motifs: (n) => `${n} design${n > 1 ? "s" : ""}`,
    setShare: "set share",
    shipping: "Shipping",
  },
};

function itemLabel(p: PricedItem, loc: Loc, suffix = ""): string {
  return `${p.name}${p.color ? ` · ${p.color}` : ""}${p.size ? ` · ${LINE_TXT[loc].size} ${p.size}` : ""}${suffix}`;
}

/**
 * Baut Stripe-Line-Items. Bei Bundle: je 1x Tee + 1x Shorts bilden ein Paar, dessen
 * Preis auf zwei Line-Haelften aufgeteilt wird, die zusammen exakt PRICE_BUNDLE_ESSENTIAL
 * ergeben (+ Extra-Bild-Aufpreis pro Teil oben drauf). Ueberzaehlige Einheiten (qty ueber
 * den verfuegbaren Paaren hinaus) laufen zum normalen Flat-Preis. Summe der Lines ==
 * calcMerchandiseTotal(...) exakt, da dieselbe Paar-Logik verwendet wird.
 */
function buildLineItems(
  priced: PricedItem[],
  applyBundle: boolean,
  loc: Loc = "de",
) {
  const halves = splitBundleHalves();
  let teeBudget = applyBundle
    ? Math.min(
        priced
          .filter((p) => p.productId === "1")
          .reduce((s, p) => s + p.qty, 0),
        priced
          .filter((p) => p.productId === "2")
          .reduce((s, p) => s + p.qty, 0),
      )
    : 0;
  let shortsBudget = teeBudget;

  const lines: Array<{
    quantity: number;
    price_data: {
      currency: string;
      unit_amount: number;
      product_data: { name: string; description: string };
    };
  }> = [];

  for (const p of priced) {
    const extraPerUnit =
      Math.max(0, p.pages - INCLUDED_IMAGES) * EXTRA_IMAGE_PRICE;

    if (p.productId !== "1" && p.productId !== "2") {
      lines.push({
        quantity: p.qty,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(p.unitPrice * 100),
          product_data: {
            name: itemLabel(p, loc),
            description: LINE_TXT[loc].motifs(p.pages),
          },
        },
      });
      continue;
    }

    const isTee = p.productId === "1";
    const budget = isTee ? teeBudget : shortsBudget;
    const pairedQty = Math.min(p.qty, budget);
    const leftoverQty = p.qty - pairedQty;
    if (isTee) teeBudget -= pairedQty;
    else shortsBudget -= pairedQty;

    if (pairedQty > 0) {
      const half = isTee ? halves.tee : halves.shorts;
      lines.push({
        quantity: pairedQty,
        price_data: {
          currency: "eur",
          unit_amount: Math.round((half + extraPerUnit) * 100),
          product_data: {
            name: itemLabel(p, loc, " (Essential Set)"),
            description: `${LINE_TXT[loc].motifs(p.pages)} · ${LINE_TXT[loc].setShare}`,
          },
        },
      });
    }
    if (leftoverQty > 0) {
      lines.push({
        quantity: leftoverQty,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(p.unitPrice * 100),
          product_data: {
            name: itemLabel(p, loc),
            description: LINE_TXT[loc].motifs(p.pages),
          },
        },
      });
    }
  }
  return lines;
}

async function getSql() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) return null;
  const { neon } = await import("@neondatabase/serverless");
  return neon(url);
}

function looksLikeStripeSecret(value: string | undefined) {
  return Boolean(
    value && (value.startsWith("sk_test_") || value.startsWith("sk_live_")),
  );
}

function demoCheckout(
  body: { reference?: string },
  method: NonNullable<ReturnType<typeof getPaymentMethod>>,
  status: string,
  amount: number,
) {
  return NextResponse.json({
    ok: true,
    provider: method.provider,
    methodId: method.id,
    methodLabel: method.label,
    mode: getProviderMode(method.provider),
    status,
    amount,
    currency: "EUR",
    reference: body.reference || "",
    redirectUrl: "/?payment=success&mode=demo",
    createdAt: new Date().toISOString(),
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "create-checkout",
    method: "POST",
    status: "ready",
  });
}

export async function POST(request: Request) {
  try {
    const rl = checkRateLimit(`checkout:${clientIp(request)}`, 8, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { ok: false, error: "Too many checkout attempts. Please wait." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
      );
    }

    const body = await request.json();
    const paymentMethod = body.paymentMethod || "card";
    const method = getPaymentMethod(paymentMethod);

    if (!method) {
      return NextResponse.json(
        { ok: false, error: "Payment method not supported", paymentMethod },
        { status: 400 },
      );
    }

    const items: CheckoutItem[] = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No checkout items provided" },
        { status: 400 },
      );
    }

    const missingDesign = items.some((item) => !item.designId);
    if (missingDesign) {
      return NextResponse.json(
        { ok: false, error: "Jeder Artikel benötigt ein Design (designId)." },
        { status: 400 },
      );
    }

    // SECURITY: All items must have a productId
    const missingProductId = items.find((item) => !item.productId);
    if (missingProductId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Jeder Artikel benötigt eine Produkt-ID (productId).",
        },
        { status: 400 },
      );
    }

    // SECURITY: Quantity must be between 1 and 9
    const invalidQty = items.find((item) => {
      const qty = Math.round(Number(item.quantity || 0));
      return qty < 1 || qty > 9;
    });
    if (invalidQty) {
      const qty = Math.round(Number(invalidQty.quantity || 0));
      return NextResponse.json(
        {
          ok: false,
          error: `Ungültige Menge: ${qty}. Bitte wählen Sie zwischen 1 und 9 Artikeln.`,
          quantity: qty,
        },
        { status: 400 },
      );
    }

    // Ab 21 Stück insgesamt nur per Anfrage (Handfertigung, individuelles Angebot)
    const qtyTotal = totalQuantity(
      items.map((i) => ({ quantity: Math.round(Number(i.quantity || 0)) })),
    );
    if (qtyTotal > MAX_SHOP_QUANTITY) {
      return NextResponse.json(
        {
          ok: false,
          error: `Bestellungen über ${MAX_SHOP_QUANTITY} Stück bitte über das Anfrageformular (/grossbestellung).`,
          code: "bulk_inquiry_required",
          quantity: qtyTotal,
        },
        { status: 400 },
      );
    }

    // WAVE 6.4: Gate check for productId='3' (pillow) - requires Jonny approval
    const hasPillow = items.find((item) => item.productId === "3");
    if (hasPillow) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Kissenbezüge sind noch nicht verfügbar. Das Produkt befindet sich in der Vorbereitung.",
          productId: "3",
          status: "pilot",
        },
        { status: 400 },
      );
    }

    // SECURITY: Only allow shop_live products to be purchased
    const notShopLive = items.find((item) => {
      const product = PRODUCTS_133.find((p) => p.id === item.productId);
      return !product || product.status !== "shop_live";
    });
    if (notShopLive) {
      const product = PRODUCTS_133.find((p) => p.id === notShopLive.productId);
      return NextResponse.json(
        {
          ok: false,
          error: `Produkt "${product?.name?.de || notShopLive.productId}" ist noch nicht verfügbar. Nur Live-Produkte können gekauft werden.`,
          productId: notShopLive.productId,
          status: product?.status || "unknown",
        },
        { status: 400 },
      );
    }

    // Kaufsperre bis zum Testdruck (lib/catalog/release-gate.ts testPrintDone)
    const untested = items.find((item) => !testPrintDone(item.productId!));
    if (untested) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Dieses Produkt ist bald bestellbar. Wir drucken gerade die letzten Testmuster.",
          code: "testdruck_ausstehend",
          productId: untested.productId,
        },
        { status: 400 },
      );
    }

    // === SERVERSEITIGE PREISBERECHNUNG — Client-Beträge werden ignoriert ===
    const country: Country = "DE"; // Nur Deutschland aktiv
    const wantedId = String(body.shippingId || "").toLowerCase();
    const wantedCarrier = String(body.shippingMethod || "").toLowerCase();
    const shipOpt =
      SHIPPING_OPTIONS.find((o) => o.id === wantedId) ||
      SHIPPING_OPTIONS.find((o) => o.carrier.toLowerCase() === wantedCarrier) ||
      SHIPPING_OPTIONS.find((o) => o.id === DEFAULT_SHIPPING_ID)!;
    const shippingCost = shipOpt.price[country];

    const sql = await getSql();
    if (!sql) {
      return NextResponse.json(
        {
          ok: false,
          error: "Database connection failed. Please try again later.",
        },
        { status: 500 },
      );
    }

    // SECURITY: All designs must exist in database
    const designIds = items.map((item) => item.designId).filter(Boolean);
    if (designIds.length > 0) {
      const placeholders = designIds.map((_, i) => `$${i + 1}`).join(",");
      const designRows = (await sql.query(
        `SELECT id FROM designs WHERE id IN (${placeholders})`,
        designIds,
      )) as Record<string, unknown>[];
      const foundIds = new Set(designRows.map((row) => row.id as string));
      const missingDesignId = designIds.find((id) => !foundIds.has(id!));
      if (missingDesignId) {
        return NextResponse.json(
          {
            ok: false,
            error: `Design "${missingDesignId}" nicht gefunden. Bitte erstellen Sie zuerst ein Design.`,
            designId: missingDesignId,
          },
          { status: 400 },
        );
      }
    }
    const locale = (["de", "ro", "en"] as const).includes(body.locale)
      ? (body.locale as "de" | "ro" | "en")
      : "de";
    const priced: PricedItem[] = [];
    for (const item of items) {
      const productId = item.productId!; // Already validated above
      // Name, Größe und Farbe nie ungeprüft vom Client übernehmen (Stripe, Bestellung, PDF, Mail)
      const product = getProduct(productId);
      if (!product) {
        return NextResponse.json(
          { ok: false, error: "Artikel nicht verfügbar." },
          { status: 400 },
        );
      }
      if (!item.size || !product.sizes.includes(item.size)) {
        return NextResponse.json(
          { ok: false, error: "Bitte eine gültige Größe wählen." },
          { status: 400 },
        );
      }
      const safeName = product.name[locale] || product.name.de;
      // Farbe nur aus der Liste des Produkts (Schlüssel oder Bezeichnung), sonst die erste
      const wanted = String(item.color ?? "")
        .trim()
        .toLowerCase();
      const matched = product.colors.find(
        (c) =>
          c.key === wanted ||
          Object.values(c.label).some((l) => l.toLowerCase() === wanted),
      );
      if (wanted && !matched) {
        return NextResponse.json(
          { ok: false, error: "Diese Farbe gibt es für das Produkt nicht." },
          { status: 400 },
        );
      }
      const colorObj = matched ?? product.colors[0];
      const safeColor = colorObj?.label[locale] || colorObj?.label.de || "";
      let front: string | null = null;
      let back: string | null = null;
      let pages = 0;
      if (item.designId) {
        // Design existence already validated above
        const rows = (await sql.query(
          `SELECT front_image, back_image, meta, product_id FROM designs WHERE id=$1`,
          [item.designId],
        )) as Record<string, unknown>[];
        // rows.length guaranteed to be > 0 due to validation
        if (rows.length && String(rows[0].product_id ?? "") !== productId) {
          // Motiv eines anderen Artikels (oder ohne Zuordnung) würde falsch gedruckt bzw. abgerechnet
          return NextResponse.json(
            {
              ok: false,
              error:
                "Das Motiv gehört zu einem anderen Artikel. Bitte neu gestalten.",
              designId: item.designId,
            },
            { status: 400 },
          );
        }
        if (rows.length) {
          front = (rows[0].front_image as string) || null;
          back = (rows[0].back_image as string) || null;
          const meta = rows[0].meta as Record<string, unknown> | null;
          // Multi-Layer-Atelier: Preis basiert auf der tatsaechlichen Ebenen-Anzahl je
          // Seite (meta.front/backLayerCount, serverseitig aus der DB gelesen — nie vom
          // Client vertraut). Legacy-Designs ohne diese Felder: alte 0/1-pro-Seite-Regel.
          const frontCount =
            typeof meta?.frontLayerCount === "number"
              ? meta.frontLayerCount
              : front
                ? 1
                : 0;
          const backCount =
            typeof meta?.backLayerCount === "number"
              ? meta.backLayerCount
              : back
                ? 1
                : 0;
          // Untergrenze: gespeicherte Ebenenliste bzw. mindestens 1 je Seite mit Bild
          const listLen = (v: unknown) => (Array.isArray(v) ? v.length : 0);
          const fCount = Math.max(
            frontCount,
            listLen(meta?.frontLayers),
            front ? 1 : 0,
          );
          const bCount = Math.max(
            backCount,
            listLen(meta?.backLayers),
            back ? 1 : 0,
          );
          pages =
            Math.max(0, Math.min(12, Math.round(fCount))) +
            Math.max(0, Math.min(12, Math.round(bCount)));
        }
      }
      const qty = Math.round(Number(item.quantity || 1)); // Already validated 1-9
      priced.push({
        ...item,
        name: safeName,
        size: item.size,
        color: safeColor,
        productId,
        pages,
        qty,
        unitPrice: calcUnitPriceForProduct(productId, pages),
      });
    }

    // Bundle: automatisch sobald >=1 Tee (id '1') und >=1 Shorts (id '2') vorhanden sind.
    const merchItems: MerchandiseItem[] = priced.map((p) => ({
      productId: p.productId,
      pages: p.pages,
      qty: p.qty,
    }));
    const applyBundle =
      body.applyBundle !== false && isBundleEligible(merchItems);
    const merchandiseTotal = calcMerchandiseTotal(merchItems, applyBundle);
    const serverTotal =
      Math.round((merchandiseTotal + shippingCost) * 100) / 100;

    if (method.provider !== "stripe") {
      return demoCheckout(
        body,
        method,
        "non_stripe_demo_checkout_created",
        serverTotal,
      );
    }
    if (!looksLikeStripeSecret(process.env.STRIPE_SECRET_KEY)) {
      return demoCheckout(
        body,
        method,
        "stripe_secret_key_invalid_or_missing_demo",
        serverTotal,
      );
    }

    const StripeModule = await import("stripe");
    const Stripe = StripeModule.default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://on-me-honey-b.vercel.app";

    // Serialisiert Items mit abgekürzten Keys (~87 Zeichen/Item statt ~130).
    // Stripe-Limit: 500 Zeichen pro Metadata-Value. .slice() würde JSON brechen.
    const itemsAbbrev = priced.map((p) => ({
      n: p.name.slice(0, 20),
      s: p.size ?? "",
      c: p.color ?? "",
      q: p.qty,
      pr: p.unitPrice,
      pg: p.pages,
      d: p.designId ?? "",
      pid: p.productId,
    }));
    // Stripe: max. 500 Zeichen je Metadata-Wert, max. 50 Schlüssel. Die Positionen werden
    // daher auf items, items_1, items_2 … verteilt (Webhook setzt sie wieder zusammen).
    const itemChunks: string[] = [];
    let chunk: typeof itemsAbbrev = [];
    for (const it of itemsAbbrev) {
      const next = JSON.stringify([...chunk, it]);
      if (next.length > 500 && chunk.length) {
        itemChunks.push(JSON.stringify(chunk));
        chunk = [it];
      } else {
        chunk.push(it);
      }
    }
    if (chunk.length) itemChunks.push(JSON.stringify(chunk));
    if (itemChunks.some((c) => c.length > 500) || itemChunks.length > 30) {
      return NextResponse.json(
        {
          ok: false,
          code: "cart_too_large",
          error: "Bitte teile die Bestellung auf.",
        },
        { status: 422 },
      );
    }
    const itemsMeta = itemChunks[0] ?? "[]";
    const extraItemMeta = Object.fromEntries(
      itemChunks.slice(1).map((c, i) => [`items_${i + 1}`, c]),
    );

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      allow_promotion_codes: true,
      payment_method_types: ["card", "paypal", "klarna", "sepa_debit", "link"],
      line_items: buildLineItems(priced, applyBundle, locale),
      shipping_address_collection: { allowed_countries: [country] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: Math.round(shippingCost * 100),
              currency: "eur",
            },
            display_name: `${LINE_TXT[locale].shipping} · ${shipOpt.carrier}`,
          },
        },
      ],
      custom_text: {
        submit: {
          message: {
            de: `Handgefertigt nach deinem Motiv: 3–5 Werktage Produktion + Versand, Lieferung spätestens 10 Werktage nach Zahlungseingang. Kein Widerrufsrecht (§ 312g Abs. 2 Nr. 1 BGB); bei Produkt- oder Druckfehlern gilt die Gewährleistung, Rücksendekosten tragen wir. Es gelten unsere [AGB](${siteUrl}/agb).`,
            ro: `Realizat manual după motivul tău: 3–5 zile lucrătoare producție + livrare, max. 10 zile lucrătoare de la plată. Fără drept de retragere (§ 312g alin. 2 nr. 1 BGB); pentru defecte se aplică garanția, costurile de retur le suportăm noi. Se aplică [termenii](${siteUrl}/agb).`,
            en: `Handmade from your design: 3–5 working days production + shipping, delivered within 10 working days after payment. No right of withdrawal (§ 312g (2) no. 1 BGB); for product or print defects the warranty applies and we cover return costs. Our [terms](${siteUrl}/agb) apply.`,
          }[locale],
        },
      },
      success_url: `${siteUrl}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cart?payment=cancel`,
      metadata: {
        reference: body.reference || "",
        paymentMethod,
        items: itemsMeta,
        ...extraItemMeta,
        designId: priced.find((p) => p.designId)?.designId || "",
        designIds: priced
          .map((p) => p.designId)
          .filter(Boolean)
          .join(",")
          .slice(0, 490),
        shippingCountry: country,
        shippingMethod: shipOpt.carrier,
        locale,
      },
    });

    return NextResponse.json({
      ok: true,
      provider: "stripe",
      methodId: method.id,
      methodLabel: method.label,
      status: "stripe_checkout_created",
      amount: serverTotal,
      currency: "EUR",
      reference: body.reference || "",
      redirectUrl: session.url,
      sessionId: session.id,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { ok: false, error: "Payment checkout failed", message },
      { status: 500 },
    );
  }
}
