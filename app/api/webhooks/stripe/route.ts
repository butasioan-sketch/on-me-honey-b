import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  notifyAdminWebhookError,
  notifyAdminOrderIssue,
} from "@/lib/admin-alert";
import {
  claimConfirmationEmail,
  createOrder,
  freezeDesign,
  releaseConfirmationEmail,
} from "@/lib/db";
import type { Order } from "@/lib/types";
import { buildPrintJobPayload } from "@/lib/print-job";
import { readEmailDelivery } from "@/lib/email-delivery";
import { randomUUID } from "node:crypto";

export async function POST(request: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!key?.startsWith("sk_")) {
    console.error("[stripe-webhook] STRIPE_SECRET_KEY fehlt oder ist ungültig");
    return NextResponse.json({ received: false }, { status: 503 });
  }

  const stripe = new Stripe(key);
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") || "";

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET fehlt - Webhook abgelehnt");
    return NextResponse.json(
      { error: "Webhook secret missing" },
      { status: 500 },
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object;
    if (
      session.payment_status !== "paid" &&
      session.payment_status !== "no_payment_required"
    ) {
      return NextResponse.json({ received: true });
    }

    try {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://on-me-honey-b.vercel.app";
      const parsedItems = (() => {
        try {
          const meta = session.metadata || {};
          const raw: unknown[] = JSON.parse(meta.items || "[]");
          if (!Array.isArray(raw)) return [];
          // Weitere Positionen aus items_1, items_2 … (siehe create-checkout)
          for (let k = 1; meta[`items_${k}`]; k++) {
            const more = JSON.parse(meta[`items_${k}`]);
            if (Array.isArray(more)) raw.push(...more);
          }
          // Unterstützt altes Format {name,size,...} und neues abgekürztes Format {n,s,...}
          return (raw as Record<string, unknown>[]).map((i) => ({
            productId: String(i.productId ?? i.pid ?? ""), // pid from checkout metadata, no Tee fallback
            name: String(i.name ?? i.n ?? "AirFit Pro"),
            size: String(i.size ?? i.s ?? ""),
            color: String(i.color ?? i.c ?? ""),
            quantity: Number(i.quantity ?? i.q ?? 1),
            price: Number(i.price ?? i.pr ?? 0), // Server-side pricing is authoritative
            pages: Number(i.pages ?? i.pg ?? 1),
            designId: String(i.designId ?? i.d ?? ""),
          }));
        } catch {
          return [];
        }
      })();
      const customerEmail =
        session.customer_details?.email ?? session.customer_email;

      const shipping = session.collected_information?.shipping_details;
      const address = shipping?.address;
      const shippingAddress =
        shipping?.name &&
        address?.line1 &&
        address.postal_code &&
        address.city &&
        address.country === "DE"
          ? {
              name: shipping.name,
              line1: address.line1,
              line2: address.line2 || undefined,
              postalCode: address.postal_code,
              city: address.city,
            }
          : undefined;

      const designIds = [
        ...new Set(parsedItems.map((item) => item.designId).filter(Boolean)),
      ].sort();
      const designs = [];
      for (const designId of designIds) {
        const design = await freezeDesign(designId);
        if (design) designs.push(design);
      }
      const missingDesign =
        parsedItems.length === 0 ||
        parsedItems.some((item) => !item.designId) ||
        designs.length < designIds.length ||
        designs.some((design) => !design.frontImage && !design.backImage);

      const orderId = `OMHB-${Date.now()}-${randomUUID().replace(/-/g, "").slice(0, 8)}`;
      const order: Order = {
        id: orderId,
        stripeSessionId: session.id,
        customerEmail: customerEmail || "",
        amountTotal: (session.amount_total || 0) / 100,
        currency: session.currency?.toUpperCase() || "EUR",
        status: missingDesign || !shippingAddress ? "on_hold" : "paid",
        items: parsedItems,
        locale: session.metadata?.locale || "de",
        shippingCountry:
          address?.country || session.metadata?.shippingCountry || "DE",
        shippingMethod: session.metadata?.shippingMethod || undefined,
        shippingAddress,
        designId: session.metadata?.designId || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      // Ein nicht druckbares Design (z. B. ohne Produktzuordnung) darf die bezahlte Bestellung nicht
      // blockieren: dann ohne Druckauftrag als on_hold speichern, statt dauerhaft 500 zu liefern.
      let printJob: ReturnType<typeof buildPrintJobPayload> | undefined;
      if (!missingDesign) {
        try {
          printJob = buildPrintJobPayload(orderId, designs);
        } catch (jobErr) {
          console.error("[stripe-webhook] Druckauftrag nicht erstellbar, Bestellung on_hold:", {
            orderId,
            error: jobErr instanceof Error ? jobErr.message : "unknown",
          });
          order.status = "on_hold";
        }
      }

      // Store the snapshot with the order so a retry cannot observe a paid order without its print job.
      const created = await createOrder(order, printJob);
      if (created && order.status === "on_hold") {
        await notifyAdminOrderIssue(
          order,
          missingDesign ? "missing_design" : "on_hold",
        ).catch(() => {});
      }

      // Bestätigungs-E-Mail senden (fehlertolerant - darf Bestellung nie kaputtmachen).
      // Die Reservierung in der DB sorgt dafür, dass ein Stripe-Retry eine gescheiterte
      // E-Mail nachholt und parallele Zustellungen nicht doppelt senden.
      let claimedOrderId: string | null = null;
      try {
        const claim = customerEmail
          ? await claimConfirmationEmail(session.id)
          : null;
        // Ohne Datenbank (lokale Entwicklung) gibt es keine Reservierung: nur beim ersten Anlegen senden.
        const mailOrderId = claim?.id ?? (created ? orderId : null);
        claimedOrderId = claim?.id ?? null;
        if (customerEmail && mailOrderId) {
          const response = await fetch(`${siteUrl}/api/email`, {
            method: "POST",
            redirect: "manual",
            headers: {
              "Content-Type": "application/json",
              "x-internal-key": process.env.INTERNAL_API_KEY || "",
            },
            body: JSON.stringify({
              orderId: mailOrderId,
              email: customerEmail,
              total: (session.amount_total || 0) / 100,
              items: parsedItems,
              locale: session.metadata?.locale || "de",
              designId: session.metadata?.designId || null,
              designIds: session.metadata?.designIds || "",
            }),
          });
          const delivery = await readEmailDelivery(response);
          if (!delivery.accepted) {
            if (claimedOrderId)
              await releaseConfirmationEmail(claimedOrderId).catch(() => {});
            console.error(
              "[stripe-webhook] Bestätigungs-E-Mail nicht versendet (Bestellung bleibt gültig):",
              { orderId: mailOrderId, reason: delivery.reason, status: delivery.status },
            );
          }
        }
      } catch (mailErr) {
        if (claimedOrderId)
          await releaseConfirmationEmail(claimedOrderId).catch(() => {});
        console.error(
          "[stripe-webhook] Bestätigungs-E-Mail nicht versendet (Bestellung bleibt gültig):",
          {
            orderId,
            reason: "fetch_error",
            error: mailErr instanceof Error ? mailErr.name : "unknown",
          },
        );
      }
    } catch (err) {
      console.error("Order Erstellung fehlgeschlagen:", err);
      await notifyAdminWebhookError(session.id, err).catch(() => {});
      return NextResponse.json({ received: false }, { status: 500 });
    }
  }

  if (event.type === "checkout.session.async_payment_failed") {
    // Lastschrift/Klarna später abgelehnt: Es wurde keine Bestellung angelegt (payment_status war
    // nicht "paid"). Kunde bekommt einen klaren Hinweis statt Funkstille.
    const session = event.data.object as Stripe.Checkout.Session;
    const customerEmail =
      session.customer_details?.email ?? session.customer_email;
    console.warn("[stripe-webhook] Asynchrone Zahlung fehlgeschlagen:", {
      eventId: event.id,
      sessionId: session.id,
    });
    if (customerEmail) {
      try {
        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL ||
          "https://on-me-honey-b.vercel.app";
        const response = await fetch(`${siteUrl}/api/email`, {
          method: "POST",
          redirect: "manual",
          headers: {
            "Content-Type": "application/json",
            "x-internal-key": process.env.INTERNAL_API_KEY || "",
          },
          body: JSON.stringify({
            type: "payment_failed",
            email: customerEmail,
            orderId: session.id.slice(-12),
            total: (session.amount_total || 0) / 100,
            locale: session.metadata?.locale || "de",
            items: [],
          }),
        });
        const delivery = await readEmailDelivery(response);
        if (!delivery.accepted)
          console.error("[stripe-webhook] Zahlungsfehler-E-Mail nicht versendet:", {
            eventId: event.id,
            reason: delivery.reason,
            status: delivery.status,
          });
      } catch (err) {
        console.error("[stripe-webhook] Zahlungsfehler-E-Mail nicht versendet:", {
          eventId: event.id,
          reason: "fetch_error",
          error: err instanceof Error ? err.name : "unknown",
        });
      }
    }
  }

  // Erinnerungsmail bei abgebrochenem Kauf ist Werbung (UWG § 7): nur mit ausdrücklichem Schalter
  if (event.type === "checkout.session.expired" && process.env.ABANDONED_CART_EMAILS === "on") {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerEmail =
      session.customer_details?.email ?? session.customer_email;

    if (customerEmail) {
      try {
        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL ||
          "https://on-me-honey-b.vercel.app";
        const locale = session.metadata?.locale || "de";
        const total = (session.amount_total || 0) / 100;

        const response = await fetch(`${siteUrl}/api/email`, {
          method: "POST",
          redirect: "manual",
          headers: {
            "Content-Type": "application/json",
            "x-internal-key": process.env.INTERNAL_API_KEY || "",
          },
          body: JSON.stringify({
            type: "abandoned",
            email: customerEmail,
            orderId: session.id,
            total,
            locale,
            items: [],
          }),
        });
        const delivery = await readEmailDelivery(response);
        if (!delivery.accepted)
          console.error("[stripe-webhook] Abandoned-Cart-E-Mail nicht versendet:", {
            eventId: event.id,
            reason: delivery.reason,
            status: delivery.status,
          });
      } catch (err) {
        console.error("[stripe-webhook] Abandoned-Cart-E-Mail nicht versendet:", {
          eventId: event.id,
          reason: "fetch_error",
          error: err instanceof Error ? err.name : "unknown",
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
