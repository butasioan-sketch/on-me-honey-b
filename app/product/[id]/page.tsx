"use client";

import {
  getShipping,
  DEFAULT_SHIPPING_ID,
  DEFAULT_COUNTRY,
} from "@/lib/shipping";
import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import dynamic from "next/dynamic";
import SiteHeader from "@/app/components/SiteHeader";
import { useLocale } from "@/app/components/LocaleProvider";
import { PRINT_SPEC, getGarmentProfile } from "@/lib/print-spec";
import { getProduct, getProductName, SHIRT_COLORS } from "@/lib/products";
import { getProductById } from "@/lib/catalog/families";
import CatalogProductView from "@/app/components/CatalogProductView";

const GlbStudio = dynamic(() => import("@/app/components/GlbStudio"), {
  ssr: false,
  loading: () => <div className="glb-studio-viewer" role="status" aria-label="3D-Modell lädt" />,
});
import type { DesignState } from "@/lib/design-types";
import { calcUnitPriceForProduct } from "@/lib/pricing";
import { renderPrintSheetMulti } from "@/lib/print-export";
import { renderCustomerViewCompositeMulti } from "@/lib/print-customer-view";
import { defaultPrintTransform } from "@/lib/print-position";
import { trackAddToCart, trackProductView } from "@/lib/analytics";
import { formatEuro } from "@/lib/format-price";
import { MAX_SHOP_QUANTITY, totalQuantity } from "@/lib/order-limits";

/** Sicherheitsabstand zur 4,5-MB-Grenze von Vercel-Funktionen. */
const MAX_DESIGN_PAYLOAD = 4_200_000;

export default function ProductPage() {
  const { t, locale } = useLocale();
  const params = useParams();
  const urlId = params?.id as string;

  // WAVE 4: shopId (1, 2) oder SKU (001–133). Kauf nur über die Shop-ID.
  const catalogProduct = getProductById(urlId);
  const product =
    catalogProduct?.shop_live && catalogProduct.shopId
      ? getProduct(catalogProduct.shopId)
      : undefined;
  const id = product?.id;

  // All hooks must be called before any conditional returns
  const [size, setSize] = useState("");
  // Alle Rohlinge sind weiß; Farbauswahl entfällt (Jonny 21.11.2026: nur GLB + Upload).
  const colorKey = "weiss";
  const activeColor =
    SHIRT_COLORS.find((c) => c.key === colorKey) || SHIRT_COLORS[0];
  const [loading, setLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");
  const [design, setDesign] = useState<DesignState>({
    frontLayers: [],
    backLayers: [],
  });
  const [editHint, setEditHint] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const preSize = searchParams.get("size");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (preSize) setSize(preSize);


    if (searchParams.has("edit")) setEditHint(true);
  }, []);

  useEffect(() => {
    if (id && product) {
      trackProductView(id, product.name?.de ?? id, product.price);
    }
  }, [id, product]);

  // Conditional returns after all hooks
  if (!catalogProduct) return notFound();

  if (!catalogProduct.shop_live) {
    return <CatalogProductView product={catalogProduct} />;
  }

  if (!product || !id) return notFound();

  const totalLayers = design.frontLayers.length + design.backLayers.length;
  const unitPrice = calcUnitPriceForProduct(id, totalLayers);
  const productName = getProductName(product, locale);
  const colorLabel = activeColor.label[locale] || activeColor.label.de;

  const saveDesign = async (): Promise<string | null> => {
    if (!design.frontLayers.length && !design.backLayers.length) return null;
    try {
      const hasFront = design.frontLayers.length > 0;
      const hasBack = design.backLayers.length > 0;
      // Vercel nimmt höchstens 4,5 MB pro Anfrage an. Beidseitige A4-Druckblätter (300 dpi)
      // werden deshalb bei Bedarf stufenweise stärker komprimiert, statt mit 413 zu scheitern.
      const buildPayload = async (quality: number) => {
        const [front, back, frontPreview, backPreview] = await Promise.all([
          hasFront
            ? renderPrintSheetMulti(
                "front",
                design.frontLayers.map((l) => ({
                  src: l.src,
                  transform: l.transform,
                })),
                id,
                { format: "jpeg", quality },
              )
            : Promise.resolve(null),
          hasBack
            ? renderPrintSheetMulti(
                "back",
                design.backLayers.map((l) => ({
                  src: l.src,
                  transform: l.transform,
                })),
                id,
                { format: "jpeg", quality },
              )
            : Promise.resolve(null),
          hasFront
            ? renderCustomerViewCompositeMulti(
                "front",
                design.frontLayers.map((l) => ({
                  src: l.src,
                  transform: l.transform,
                })),
                id,
              ).catch(() => null)
            : Promise.resolve(null),
          hasBack
            ? renderCustomerViewCompositeMulti(
                "back",
                design.backLayers.map((l) => ({
                  src: l.src,
                  transform: l.transform,
                })),
                id,
              ).catch(() => null)
            : Promise.resolve(null),
        ]);
        // Ganzes A4-Blatt wird als EINE Einheit auf den Blank gepresst (Sublimation) —
        // die einzelnen Ebenen haben zwar eigene Positionen INNERHALB des Blatts (siehe
        // renderPrintSheetMulti), aber das Blatt selbst sitzt an der Standardposition der
        // Placement-Zone. Deshalb hier immer der Default-Transform fuer die PDF-
        // Platzierungsseite (Ebene 2), unabhaengig von den Ebenen-eigenen Positionen.
        const standardTransform = defaultPrintTransform();
        const payload = JSON.stringify({
          front,
          back,
          productId: id,
          frontTransform: hasFront ? standardTransform : null,
          backTransform: hasBack ? standardTransform : null,
          frontPreview,
          backPreview,
          meta: {
            dpi: PRINT_SPEC.dpi,
            widthPx: PRINT_SPEC.widthPx,
            heightPx: PRINT_SPEC.heightPx,
            blank: getGarmentProfile(id).blank,
            method: PRINT_SPEC.method,
            // Anzahl Ebenen je Seite — Grundlage der serverseitigen Preisberechnung
            // (Extra-Motiv-Aufpreis ab dem 3. Bild, siehe lib/pricing.ts + create-checkout).
            frontLayerCount: design.frontLayers.length,
            backLayerCount: design.backLayers.length,
            // Rohe Ebenen-Info (nicht nur das gerenderte Bild) — QA im Druckblatt-PDF und
            // Grundlage fuer den spaeteren Plotter-SVG-Export (Phase 2, Text als Vektor).
            frontLayers: design.frontLayers.map((l) => ({
              kind: l.kind,
              text: l.text || null,
              color: l.color || null,
            })),
            backLayers: design.backLayers.map((l) => ({
              kind: l.kind,
              text: l.text || null,
              color: l.color || null,
            })),
          },
        });
        return payload;
      };
      let payload = "";
      for (const quality of [0.92, 0.85, 0.78, 0.7]) {
        payload = await buildPayload(quality);
        if (payload.length <= MAX_DESIGN_PAYLOAD) break;
      }
      if (payload.length > MAX_DESIGN_PAYLOAD) {
        throw new Error(`Motiv zu groß (${(payload.length / 1024 / 1024).toFixed(1)} MB)`);
      }
      const res = await fetch("/api/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => `HTTP ${res.status}`);
        throw new Error(`/api/designs ${res.status}: ${errText}`);
      }
      const data = await res.json();
      if (!data.id) throw new Error("Kein Design-ID erhalten");
      return data.id;
    } catch (err) {
      console.error("[saveDesign]", err);
      return null;
    }
  };

  const addToCart = async () => {
    if (!size) {
      setError(t.product.selectSize);
      return;
    }
    if (!design.frontLayers.length && !design.backLayers.length) {
      setError(t.shop.needDesign);
      return;
    }
    setError("");
    setAddLoading(true);
    try {
      const designId = await saveDesign();
      if (!designId) {
        setError(t.errors.saveDesign);
        return;
      }
      const pages = totalLayers;
      const cart = JSON.parse(
        localStorage.getItem("on_me_honey_b_cart") || "[]",
      );
      if (totalQuantity(cart) >= MAX_SHOP_QUANTITY) {
        setError(
          locale === "de"
            ? `Mehr als ${MAX_SHOP_QUANTITY} Stück bitte über das Anfrageformular (/grossbestellung).`
            : locale === "ro"
              ? `Peste ${MAX_SHOP_QUANTITY} de bucăți: formular de cerere (/grossbestellung).`
              : `More than ${MAX_SHOP_QUANTITY} pieces: please use the request form (/grossbestellung).`,
        );
        return;
      }
      cart.push({
        id,
        name: productName,
        price: unitPrice,
        size,
        fit: t.product.unisex,
        color: colorLabel,
        quantity: 1,
        designId,
        pages,
      });
      localStorage.setItem("on_me_honey_b_cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cart-updated"));
      trackAddToCart(id, productName, unitPrice);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      setError(t.errors.addCart);
    } finally {
      setAddLoading(false);
    }
  };

  const buyNow = async () => {
    if (!size) {
      setError(t.product.selectSize);
      return;
    }
    if (!design.frontLayers.length && !design.backLayers.length) {
      setError(t.shop.needDesign);
      return;
    }
    setError("");
    setLoading(true);
    let redirecting = false;
    try {
      const designId = await saveDesign();
      if (!designId) {
        setError(t.errors.saveDesign);
        return;
      }
      const res = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: "card",
          locale,
          shippingId: DEFAULT_SHIPPING_ID,
          reference: `PROD-${id}-${size}`,
          shipping: getShipping(DEFAULT_SHIPPING_ID, DEFAULT_COUNTRY),
          total: unitPrice + getShipping(DEFAULT_SHIPPING_ID, DEFAULT_COUNTRY),
          country: DEFAULT_COUNTRY,
          shippingMethod: "DHL",
          items: [
            {
              productId: id,
              name: productName,
              size,
              color: colorLabel,
              price: unitPrice,
              quantity: 1,
              designId,
            },
          ],
        }),
      });
      const data = await res.json();
      if (data.redirectUrl) {
        redirecting = true; // Button bleibt gesperrt, kein zweiter Checkout per Doppelklick
        // eslint-disable-next-line react-hooks/immutability
        window.location.href = data.redirectUrl;
      } else {
        setError(t.errors.checkout);
      }
    } catch {
      setError(t.errors.connection);
    } finally {
      if (!redirecting) setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1000px 500px at 50% -10%, rgba(226,0,26,0.08), transparent 60%), linear-gradient(180deg, #0c0c0d 0%, #0a0a0a 100%)",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <SiteHeader />

      <main className="glb-product">
        <GlbStudio
          profileId={id}
          productName={productName}
          onDesignChange={setDesign}
        />

        <div className="glb-product-buy">
          <h1
            style={{
              fontSize: "1.9rem",
              fontWeight: 900,
              margin: 0,
              color: "#fff",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            {productName}
          </h1>
          <div>
            <p style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0, color: "#fff" }}>
              {formatEuro(unitPrice, locale)}
            </p>
            {/* PAngV: Endpreis, Steuerhinweis und Versandkosten direkt beim Preis */}
            <p style={{ fontSize: "0.78rem", color: "#a0a0a0", margin: "0.25rem 0 0" }}>
              {t.product.priceNote} (<a href="/versand">{locale === "de" ? "Versandkosten" : locale === "ro" ? "costuri de livrare" : "shipping costs"}</a>)
            </p>
          </div>

          <div>
            <p className="plt-label" style={{ marginBottom: "0.6rem" }}>
              {t.product.size}
            </p>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={size === s}
                  onClick={() => setSize(s)}
                  className={`plt-size-btn${size === s ? " plt-size-btn-active" : ""}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {editHint && (
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#fca5a5", lineHeight: 1.5 }}>
              {locale === "de"
                ? "Größe vorausgewählt. Lade dein Motiv erneut hoch."
                : locale === "ro"
                  ? "Mărimea este preselectată. Încarcă din nou motivul."
                  : "Size preselected. Please upload your design again."}
            </p>
          )}

          <div
            className="plt-design-status"
            data-testid="design-status"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.65rem 0.9rem",
              borderRadius: "10px",
              background: totalLayers > 0 ? "rgba(74,222,128,0.08)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${totalLayers > 0 ? "rgba(74,222,128,0.25)" : "rgba(255,255,255,0.08)"}`,
              fontSize: "0.8rem",
              fontWeight: 600,
              color: totalLayers > 0 ? "#4ade80" : "#a0a0a0",
            }}
          >
            <span aria-hidden="true">{totalLayers > 0 ? "✓" : "⬆"}</span>
            <span>
              {design.frontLayers.length && design.backLayers.length
                ? `${t.studio.front} & ${t.studio.back} — ${t.studio.twoSides}`
                : design.frontLayers.length
                  ? `${t.studio.front} — ${t.studio.oneSide}`
                  : design.backLayers.length
                    ? `${t.studio.back} — ${t.studio.oneSide}`
                    : t.shop.uploadFront}
            </span>
          </div>

          {error && (
            <p role="alert" style={{ color: "#f87171", fontSize: "0.875rem", margin: 0 }}>
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={buyNow}
            disabled={loading}
            className="plt-btn-primary"
            style={{ width: "100%", fontSize: "1rem", padding: "1rem" }}
          >
            {loading
              ? t.cart.redirecting
              : `${t.product.buyNow} — ${formatEuro(unitPrice, locale)}`}
          </button>
          <button
            type="button"
            onClick={addToCart}
            disabled={addLoading}
            className={`plt-btn-secondary${added ? " plt-btn-cart-added" : ""}`}
            style={{ width: "100%", padding: "0.9rem", color: added ? "#4ade80" : "#fff" }}
          >
            {addLoading ? "..." : added ? `✓ ${t.product.added}` : `+ ${t.product.addCart}`}
          </button>
          <p style={{ color: "#a0a0a0", fontSize: "0.72rem", textAlign: "center", margin: 0, lineHeight: 1.5 }}>
            {t.shop.legal}
          </p>
          <a href="/so-gehts#video-gestalten" style={{ color: "#D4AF37", fontSize: "0.85rem", textAlign: "center" }}>
            {locale === "de" ? "▶ So bestellst du – Video (1 Min.)" : locale === "ro" ? "▶ Cum comanzi – video" : "▶ How to order – video"}
          </a>
        </div>
      </main>

      {/* Mobile Sticky Buy Bar */}
      <div
        className="mobile-sticky-cta"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: "rgba(10,10,10,0.96)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          padding: "0.85rem 1.25rem",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div>
          <p style={{ fontSize: "0.7rem", color: "#a0a0a0", margin: 0 }}>{productName}</p>
          <p style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff", margin: 0 }}>
            {formatEuro(unitPrice, locale)}
          </p>
        </div>
        <button
          type="button"
          onClick={buyNow}
          disabled={loading}
          className="plt-btn-primary"
          style={{ padding: "0.75rem 1.5rem", fontSize: "0.9rem", flexShrink: 0 }}
        >
          {loading ? t.cart.redirecting : t.product.buyNow}
        </button>
      </div>
    </div>
  );
}
