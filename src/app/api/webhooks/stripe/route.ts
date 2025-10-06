import { NextRequest, NextResponse } from "next/server";
import { getStripe, handleStripeWebhookEvent, isStripeConfigured } from "@/services/provider/stripe.service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ ok: false, error: "Stripe not configured" }, { status: 501 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ ok: false, error: "Missing Stripe signature" }, { status: 400 });
  }

  const stripe = getStripe();
  const rawBody = await req.text();
  try {
    const event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
    await handleStripeWebhookEvent(event);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? "Invalid signature" }, { status: 400 });
  }
}

