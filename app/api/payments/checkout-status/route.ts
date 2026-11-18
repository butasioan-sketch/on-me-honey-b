import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET(request: Request) {
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
    return NextResponse.json(
      { paid, amount: paid ? (session.amount_total ?? 0) / 100 : 0 },
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
