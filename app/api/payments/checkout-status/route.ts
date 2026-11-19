import { NextResponse } from "next/server";
import Stripe from "stripe";
import { hasOrderForStripeSession } from "@/lib/db";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const rl = checkRateLimit(`cs:${clientIp(request)}`, 40, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "rate" }, { status: 429 });
  const id = new URL(request.url).searchParams.get("session_id") ?? "";
  if (!/^cs_(test|live)_[A-Za-z0-9_]{1,160}$/.test(id)) {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Checkout unavailable" },
      { status: 503 },
    );
  }

  try {
    const session = await new Stripe(key).checkout.sessions.retrieve(id);
    const paid =
      session.status === "complete" &&
      (session.payment_status === "paid" ||
        session.payment_status === "no_payment_required");
    // Stripe can report paid before the webhook has stored the shop order.
    const orderSaved = paid
      ? await hasOrderForStripeSession(id).catch(() => false)
      : false;
    // Lastschrift/Klarna: Checkout abgeschlossen, Bank bestätigt erst später
    const paymentProcessing = session.status === "complete" && session.payment_status === "unpaid";
    return NextResponse.json(
      { paid, orderSaved, paymentProcessing, amount: paid ? (session.amount_total ?? 0) / 100 : 0 },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    const missing =
      error instanceof Stripe.errors.StripeInvalidRequestError &&
      error.code === "resource_missing";
    return NextResponse.json(
      { error: "Status unavailable" },
      { status: missing ? 404 : 502 },
    );
  }
}
