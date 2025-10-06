import { prisma } from "@/lib/prisma";
import { ensureStripeCustomerForOrg, getStripe, isStripeConfigured } from "@/services/provider/stripe.service";

export async function getTenantSubscription(orgId: string) {
  const sub = await prisma.subscription.findFirst({ where: { orgId }, orderBy: { createdAt: "desc" } as any });
  return sub ? {
    plan: sub.plan,
    status: sub.status,
    renewsAt: sub.renewsAt?.toISOString() ?? null,
    priceCents: sub.priceCents,
  } : null;
}

export async function openCustomerPortal(orgId: string, returnUrl: string) {
  if (!isStripeConfigured()) throw new Error("Stripe not configured");
  const stripe = getStripe();
  const customerId = await ensureStripeCustomerForOrg(orgId);
  const session = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
  return { url: session.url! };
}

export async function changePlanCheckout(orgId: string, priceId: string, successUrl: string, cancelUrl: string) {
  if (!isStripeConfigured()) throw new Error("Stripe not configured");
  const stripe = getStripe();
  const customerId = await ensureStripeCustomerForOrg(orgId);
  const sess = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { orgId },
  });
  return { url: sess.url! };
}

