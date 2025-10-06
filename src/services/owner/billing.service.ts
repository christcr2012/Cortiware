import { prisma } from "@/lib/prisma";
import { ensureStripeCustomerForOrg, getStripe, isStripeConfigured } from "@/services/provider/stripe.service";

export async function createPayNowCheckoutSession(orgId: string, invoiceId: string, successUrl: string, cancelUrl: string) {
  if (!isStripeConfigured()) throw new Error("Stripe not configured");
  const stripe = getStripe();
  const invoice = await prisma.invoice.findFirst({ where: { id: invoiceId, orgId }, select: { id: true, amount: true, status: true } });
  if (!invoice) throw new Error("invoice_not_found");
  const amountCents = Math.round(parseFloat(invoice.amount.toString()) * 100);
  if (amountCents <= 0) throw new Error("invalid_amount");
  const customerId = await ensureStripeCustomerForOrg(orgId);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "usd",
        product_data: { name: `Invoice ${invoice.id}` },
        unit_amount: amountCents,
      },
    }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { orgId, invoiceId },
  });
  return { url: session.url! };
}

export async function createSetupIntentForOrg(orgId: string) {
  if (!isStripeConfigured()) throw new Error("Stripe not configured");
  const stripe = getStripe();
  const customerId = await ensureStripeCustomerForOrg(orgId);
  const si = await stripe.setupIntents.create({ customer: customerId, usage: "off_session" });
  return { client_secret: si.client_secret! };
}

