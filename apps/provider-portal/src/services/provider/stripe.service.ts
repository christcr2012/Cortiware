import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export function isStripeConfigured() {
  return !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_WEBHOOK_SECRET;
}

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("Stripe not configured");
  return stripe;
}

export async function ensureStripeCustomerForOrg(orgId: string) {
  const org = await prisma.org.findUnique({ where: { id: orgId }, select: { id: true, name: true, stripeCustomerId: true } });
  if (!org) throw new Error("Org not found");
  if (org.stripeCustomerId) return org.stripeCustomerId;
  const customer = await stripe.customers.create({
    name: org.name,
    metadata: { orgId },
  });
  await prisma.org.update({ where: { id: orgId }, data: { stripeCustomerId: customer.id } });
  await prisma.activity.create({ data: { orgId, actorType: "system", entityType: "billing", entityId: orgId, action: "stripe_customer.created", meta: { stripeCustomerId: customer.id } } });
  return customer.id;
}

export async function createCheckoutSessionForAddon(params: { orgId: string; sku: string; amountCents: number; successUrl: string; cancelUrl: string; }) {
  const { orgId, sku, amountCents, successUrl, cancelUrl } = params;
  const customerId = await ensureStripeCustomerForOrg(orgId);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [
      { price_data: { currency: "usd", product_data: { name: sku }, unit_amount: amountCents }, quantity: 1 },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { orgId, sku },
  });
  return { url: session.url };
}

export type StripeWebhookEvent = Stripe.Event;

export async function handleStripeWebhookEvent(event: StripeWebhookEvent) {
  const type = event.type;
  const obj: any = (event.data?.object ?? {}) as any;
  try {
    switch (type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const orgId = await resolveOrgIdFromStripeObj(obj);
        if (!orgId) break;
        await upsertSubscriptionFromStripe(orgId, obj);
        await prisma.activity.create({ data: { orgId, actorType: "machine", entityType: "subscription", entityId: obj.id ?? "unknown", action: type, meta: { stripe: true } } });
        break;
      }
      case "invoice.payment_succeeded": {
        const orgId = await resolveOrgIdFromStripeObj(obj);
        if (!orgId) break;
        await prisma.payment.create({ data: { orgId, invoiceId: null, amount: (obj.amount_paid ?? 0) / 100 as any, method: "stripe", status: "succeeded", reference: obj.id ?? undefined, stripePaymentIntentId: obj.payment_intent ?? undefined } });
        await prisma.activity.create({ data: { orgId, actorType: "machine", entityType: "payment", entityId: obj.id ?? "unknown", action: type, meta: { stripe: true } } });
        break;
      }
      case "invoice.payment_failed": {
        const orgId = await resolveOrgIdFromStripeObj(obj);
        if (!orgId) break;
        await prisma.activity.create({ data: { orgId, actorType: "machine", entityType: "payment", entityId: obj.id ?? "unknown", action: type, meta: { stripe: true } } });
        break;
      }
      case "charge.refunded": {
        const orgId = await resolveOrgIdFromStripeObj(obj);
        if (!orgId) break;
        await prisma.activity.create({ data: { orgId, actorType: "machine", entityType: "payment", entityId: obj.id ?? "unknown", action: type, meta: { stripe: true } } });
        break;
      }
      default:
        break;
    }
  } catch (err) {
    // Swallow to keep webhook 2xx; route will log error separately
  }
}

async function resolveOrgIdFromStripeObj(obj: any): Promise<string | null> {
  const orgId = obj?.metadata?.orgId ?? obj?.customer_details?.metadata?.orgId ?? null;
  return orgId;
}

async function upsertSubscriptionFromStripe(orgId: string, sub: any) {
  const plan = sub?.items?.data?.[0]?.price?.nickname ?? sub?.plan?.id ?? "unknown";
  const status = sub?.status ?? "active";
  const startedAt = sub?.start_date ? new Date(sub.start_date * 1000) : new Date();
  const renewsAt = sub?.current_period_end ? new Date(sub.current_period_end * 1000) : null;
  const priceCents = typeof sub?.items?.data?.[0]?.price?.unit_amount === "number" ? sub.items.data[0].price.unit_amount : 0;

  await prisma.subscription.upsert({
    where: { id: sub?.id ?? `${orgId}-${plan}` },
    update: { plan, status, renewsAt, priceCents },
    create: { id: sub?.id ?? undefined, orgId, plan, status, startedAt, renewsAt, priceCents },
  });
}

