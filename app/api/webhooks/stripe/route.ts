import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  notifyAdminWebhookError,
  notifyAdminOrderIssue,
} from "@/lib/admin-alert";
import {
  createOrder,
  getDesignById,
  freezeDesign,
  updateOrderPrintJob,
  updateOrderStatus,
} from "@/lib/db";
import { buildPrintJobPayload } from "@/lib/print-job";

export async function POST(request: NextRequest) {
  const key = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!key?.startsWith("sk_")) {
    return NextResponse.json({ received: true, warning: "no stripe key" });
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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "https://on-me-honey-b.vercel.app";
      const parsedItems = (() => {
        try {
          const raw = JSON.parse(session.metadata?.items || "[]");
          if (!Array.isArray(raw)) return [];
          // Unterstützt altes Format {name,size,...} und neues abgekürztes Format {n,s,...}
          return raw.map((i: Record<string, unknown>) => ({
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

      // Direct order creation (no self-HTTP)
      const orderId = `OMHB-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const order = await createOrder({
        id: orderId,
        stripeSessionId: session.id,
        customerEmail: customerEmail || "",
        amountTotal: (session.amount_total || 0) / 100,
        currency: session.currency?.toUpperCase() || "EUR",
        status: "paid",
        items: parsedItems,
        locale: session.metadata?.locale || "de",
        shippingCountry: session.metadata?.shippingCountry || "DE",
        shippingMethod: session.metadata?.shippingMethod || null,
        designId: session.metadata?.designId || null,
        createdAt: new Date().toISOString(),
      });

      console.log("Order erstellt direkt:", order.id);

      // Druckauftrag einfrieren: Designs laden, fehlendes Motiv -> on_hold, Snapshot speichern.
      // Darf die Bestellung nie kaputtmachen — rein additiv, Fehler nur loggen.
      try {
        const designIds = Array.from(
          new Set(
            [
              ...parsedItems.map((i) => i.designId),
              session.metadata?.designId,
            ].filter((v): v is string => Boolean(v)),
          ),
        );
        const designs = (
          await Promise.all(designIds.map((id) => getDesignById(id)))
        ).filter((d): d is NonNullable<typeof d> => d !== null);

        const anyMissingImage =
          designIds.length === 0 ||
          designs.length < designIds.length ||
          designs.some((d) => !d.frontImage && !d.backImage);

        if (anyMissingImage && order.status !== "on_hold") {
          await updateOrderStatus(orderId, "on_hold");
          await notifyAdminOrderIssue(
            { ...order, status: "on_hold" },
            "missing_design",
          ).catch(() => {});
        }

        await Promise.all(designs.map((d) => freezeDesign(d.id)));

        if (designs.length > 0) {
          const printJob = buildPrintJobPayload(orderId, designs);
          await updateOrderPrintJob(orderId, printJob);
        }
      } catch (freezeErr) {
        console.error(
          "Druckauftrag-Freeze fehlgeschlagen (Bestellung bleibt gültig):",
          freezeErr,
        );
      }

      // Bestätigungs-E-Mail senden (fehlertolerant - darf Bestellung nie kaputtmachen)
      try {
        if (customerEmail) {
          await fetch(`${siteUrl}/api/email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId,
              email: customerEmail,
              total: (session.amount_total || 0) / 100,
              items: parsedItems,
              locale: session.metadata?.locale || "de",
              designId: session.metadata?.designId || null,
              designIds: session.metadata?.designIds || "",
            }),
          });
          console.log("Bestätigungs-E-Mail ausgelöst für:", customerEmail);
        }
      } catch (mailErr) {
        console.error(
          "E-Mail-Versand fehlgeschlagen (Bestellung bleibt gültig):",
          mailErr,
        );
      }
    } catch (err) {
      console.error("Order Erstellung fehlgeschlagen:", err);
      await notifyAdminWebhookError(session.id, err).catch(() => {});
    }
  }

  if (event.type === "checkout.session.expired") {
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

        await fetch(`${siteUrl}/api/email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "abandoned",
            email: customerEmail,
            orderId: session.id,
            total,
            locale,
            items: [],
          }),
        });
        console.log("Abandoned cart email sent to:", customerEmail);
      } catch (err) {
        console.error("Abandoned cart email failed:", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
