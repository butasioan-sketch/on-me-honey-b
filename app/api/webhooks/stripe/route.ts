import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  notifyAdminWebhookError,
  notifyAdminOrderIssue,
} from "@/lib/admin-alert";
import { createOrder, freezeDesign } from "@/lib/db";
import type { Order } from "@/lib/types";
import { buildPrintJobPayload } from "@/lib/print-job";

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

      const orderId = `OMHB-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
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
      const printJob = missingDesign
        ? undefined
        : buildPrintJobPayload(orderId, designs);

      // Store the snapshot with the order so a retry cannot observe a paid order without its print job.
      if (!(await createOrder(order, printJob))) {
        return NextResponse.json({ received: true });
      }
      if (order.status === "on_hold") {
        await notifyAdminOrderIssue(
          order,
          missingDesign ? "missing_design" : "on_hold",
        ).catch(() => {});
      }

      // Bestätigungs-E-Mail senden (fehlertolerant - darf Bestellung nie kaputtmachen)
      try {
        if (customerEmail) {
          const response = await fetch(`${siteUrl}/api/email`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-internal-key": process.env.INTERNAL_API_KEY || "",
            },
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
          if (!response.ok)
            console.error(
              "Bestätigungs-E-Mail fehlgeschlagen:",
              response.status,
            );
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
      return NextResponse.json({ received: false }, { status: 500 });
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
        console.log("Abandoned cart email sent to:", customerEmail);
      } catch (err) {
        console.error("Abandoned cart email failed:", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
