// src/server/services/onboarding.service.ts
import { prisma } from '@/lib/prisma';
import { verifyOnboardingToken } from '@/lib/onboardingToken';
import { hashPassword } from '@/lib/passwords';
import { ensureStripeCustomerForOrg, getStripe, isStripeConfigured } from '@/services/provider/stripe.service';

export type AcceptOnboardingInput = {
  token: string;
  companyName: string;
  ownerName: string;
  ownerEmail: string;
  password: string;
};

export type VerifyInviteOk = { ok: true; payload: ReturnType<typeof verifyOnboardingToken> extends { payload: infer P } ? P : any; invite: any };
export type VerifyInviteRes = { ok: false; error: string } | VerifyInviteOk;

export async function verifyInviteToken(token: string): Promise<VerifyInviteRes> {
  const v = verifyOnboardingToken(token);
  if (!v.ok) return { ok: false, error: v.error || 'invalid_token' };
  const invite = await prisma.onboardingInvite.findUnique({ where: { token }, include: { plan: true, price: true, offer: true, coupon: true } });
  if (!invite) return { ok: false as const, error: 'not_found' };
  if (invite.usedAt) return { ok: false as const, error: 'already_used' };
  return { ok: true as const, payload: v.payload!, invite };
}

export async function acceptOnboarding(input: AcceptOnboardingInput) {
  const { token, companyName, ownerEmail, ownerName, password } = input;
  // 1) Verify token + load invite
  const v = await verifyInviteToken(token);
  if (!v.ok) return v;
  const inv = (v as any).invite;

  // 2) Create tenant org + owner user in a transaction
  // 2) Create tenant org + owner user in a transaction
  const res = await prisma.$transaction(async (tx) => {
    const org = await tx.org.create({ data: { name: companyName, featureFlags: { planIdHint: inv.planId || null, priceIdHint: inv.priceId || null } as any } });

    const passwordHash = await hashPassword(password);
    const user = await tx.user.create({
      data: {
        email: ownerEmail,
        name: ownerName,
        role: 'OWNER',
        orgId: org.id,
        passwordHash,
        mustChangePassword: false,
      } as any,
    });

    // Placeholder subscription (kept for non-Stripe paths)
    if (inv.priceId) {
      const baseCents = Number(inv?.price?.unitAmountCents ?? 0);
      let discount = 0;
      let source: 'coupon' | 'offer' | null = null;
      const c = inv?.coupon as any;
      if (c) {
        let d = 0;
        if (typeof c.percentOff === 'number' && c.percentOff > 0) {
          d = Math.floor((baseCents * c.percentOff) / 100);
        }
        if (typeof c.amountOffCents === 'number' && c.amountOffCents > 0) {
          d = Math.max(d, Math.min(c.amountOffCents, baseCents));
        }
        if (d > discount) { discount = d; source = 'coupon'; }
      }
      const o = inv?.offer as any;
      if (o && (!o.appliesToPlanId || o.appliesToPlanId === inv.planId)) {
        let d = 0;
        if (typeof o.percentOff === 'number' && o.percentOff > 0) {
          d = Math.floor((baseCents * o.percentOff) / 100);
        }
        if (typeof o.amountOffCents === 'number' && o.amountOffCents > 0) {
          d = Math.max(d, Math.min(o.amountOffCents, baseCents));
        }
        if (d > discount) { discount = d; source = 'offer'; }
      }
      const effectiveCents = Math.max(0, baseCents - discount);
      await tx.subscription.create({
        data: {
          orgId: org.id,
          plan: inv.planId || 'custom',
          status: (inv.trialDays && inv.trialDays > 0) ? 'trialing' : 'active',
          startedAt: new Date(),
          renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          priceCents: effectiveCents,
          meta: { priceId: inv.priceId, offerId: inv.offerId, couponId: inv.couponId, trialDays: inv.trialDays ?? 0, baseCents, appliedDiscountCents: discount, appliedDiscountSource: source },
        } as any,
      });
    }

    await tx.onboardingInvite.update({ where: { id: inv.id }, data: { usedAt: new Date() } });

    return { org, user };
  });

  // 3) Optional Stripe: if configured and price has stripePriceId, create real Stripe subscription
  try {
    if (isStripeConfigured() && (v as any).invite?.price?.stripePriceId) {
      const stripePriceId = (v as any).invite.price.stripePriceId as string;
      const trialDays = (v as any).invite.trialDays ?? 0;
      const stripe = getStripe();
      const customerId = await ensureStripeCustomerForOrg(res.org.id);
      const sub = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: stripePriceId, quantity: 1 }],
        trial_period_days: trialDays > 0 ? trialDays : undefined,
        metadata: { orgId: res.org.id },
      });
      await prisma.subscription.upsert({
        where: { id: sub.id },
        update: {
          plan: (v as any).invite.planId || 'custom',
          status: sub.status as any,
          renewsAt: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
          priceCents: typeof sub.items?.data?.[0]?.price?.unit_amount === 'number' ? sub.items.data[0].price.unit_amount! : 0,
        },
        create: {
          id: sub.id,
          orgId: res.org.id,
          plan: (v as any).invite.planId || 'custom',
          status: sub.status as any,
          startedAt: sub.start_date ? new Date(sub.start_date * 1000) : new Date(),
          renewsAt: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
          priceCents: typeof sub.items?.data?.[0]?.price?.unit_amount === 'number' ? sub.items.data[0].price.unit_amount! : 0,
        } as any,
      });
    }
  } catch (_) {
    // non-fatal; webhook will reconcile later
  }

  return { ok: true as const, orgId: res.org.id, ownerUserId: res.user.id };
}

