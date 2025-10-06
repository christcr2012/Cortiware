import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/passwords';
import { ensureStripeCustomerForOrg, getStripe, isStripeConfigured } from '@/services/provider/stripe.service';
import { compose, withRateLimit, withIdempotencyRequired } from '@/lib/api/middleware';

export const dynamic = 'force-dynamic';

const guard = compose(withRateLimit('auth'), withIdempotencyRequired());
export const POST = guard(async (req: NextRequest) => {
  const body = await req.json().catch(() => ({}));
  const { companyName, ownerName, ownerEmail, password, couponCode } = body || {};
  if (!companyName || !ownerName || !ownerEmail || !password) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 });
  }

  // Optional coupon lookup
  let coupon: any = null;
  if (couponCode && typeof couponCode === 'string') {
    try {
      const c = await prisma.coupon.findUnique({ where: { code: couponCode } });
      const now = new Date();
      if (c && c.active !== false && (!c.startsAt || c.startsAt <= now) && (!c.endsAt || c.endsAt >= now)) {
        coupon = c;
      }
    } catch {}
  }

  // Check global config for public onboarding
  const cfg = await prisma.globalMonetizationConfig.findFirst();
  if (!cfg?.publicOnboarding) {
    return NextResponse.json({ ok: false, error: 'public_onboarding_disabled' }, { status: 403 });
  }

  // Track attempt
  try { const { logOnboardingEvent } = await import('@/services/audit-log.service'); const { funnel } = await import('@/services/metrics.service');
    await logOnboardingEvent({ action: 'public_attempt', data: { ownerEmail } }); await funnel.publicAttempt(ownerEmail);
  } catch {}

  // Create tenant with default plan/price from global config
  const result = await prisma.$transaction(async (tx) => {
    const org = await tx.org.create({ data: { name: companyName, featureFlags: { planIdHint: cfg.defaultPlanId || null, priceIdHint: cfg.defaultPriceId || null } as any } });
    const passwordHash = await hashPassword(password);
    const user = await tx.user.create({ data: { email: ownerEmail, name: ownerName, role: 'OWNER', orgId: org.id, passwordHash, mustChangePassword: false } as any });

    // Placeholder sub for non-Stripe environments
    if (cfg.defaultPriceId) {
      const price = await prisma.planPrice.findUnique({ where: { id: cfg.defaultPriceId }, select: { unitAmountCents: true, planId: true } });
      const baseCents = Number(price?.unitAmountCents ?? 0);
      let discount = 0;
      if (coupon) {
        if (typeof coupon.percentOff === 'number' && coupon.percentOff > 0) {
          discount = Math.floor((baseCents * coupon.percentOff) / 100);
        }
        if (typeof coupon.amountOffCents === 'number' && coupon.amountOffCents > 0) {
          discount = Math.max(discount, Math.min(coupon.amountOffCents, baseCents));
        }
      }
      const effectiveCents = Math.max(0, baseCents - discount);
      await tx.subscription.create({
        data: {
          orgId: org.id,
          plan: price?.planId || cfg.defaultPlanId || 'default',
          status: (cfg.defaultTrialDays && cfg.defaultTrialDays > 0) ? 'trialing' : 'active',
          startedAt: new Date(),
          renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          priceCents: effectiveCents,
          meta: { priceId: cfg.defaultPriceId, trialDays: cfg.defaultTrialDays ?? 0, baseCents, appliedDiscountCents: discount, couponId: coupon?.id || null },
        } as any,
      });
    }

    return { org, user };
  });

  // Optionally create a real Stripe subscription when configured and stripePriceId is known
  try {
    if (isStripeConfigured() && cfg.defaultPriceId) {
      const price = await prisma.planPrice.findUnique({ where: { id: cfg.defaultPriceId }, select: { stripePriceId: true, planId: true, trialDays: true } });
      if (price?.stripePriceId) {
        const stripe = getStripe();
        const customerId = await ensureStripeCustomerForOrg(result.org.id);
        const sub = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: price.stripePriceId, quantity: 1 }],
          trial_period_days: (cfg.defaultTrialDays ?? price.trialDays ?? 0) || undefined,
          metadata: { orgId: result.org.id },
        });
        await prisma.subscription.upsert({
          where: { id: sub.id },
          update: {
            plan: price.planId || 'default',
            status: sub.status as any,
            renewsAt: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
            priceCents: typeof sub.items?.data?.[0]?.price?.unit_amount === 'number' ? sub.items.data[0].price.unit_amount! : 0,
          },
          create: {
            id: sub.id,
            orgId: result.org.id,
            plan: price.planId || 'default',
            status: sub.status as any,
            startedAt: sub.start_date ? new Date(sub.start_date * 1000) : new Date(),
            renewsAt: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
            priceCents: typeof sub.items?.data?.[0]?.price?.unit_amount === 'number' ? sub.items.data[0].price.unit_amount! : 0,
          } as any,
        });
      }
    }
  } catch (_) {
    // non-fatal; webhooks will reconcile
  }

  try {
    const { logOnboardingEvent } = await import('@/services/audit-log.service');
    const { funnel } = await import('@/services/metrics.service');
    await logOnboardingEvent({ action: 'public_success', orgId: result.org.id, data: { couponApplied: !!coupon } });
    await funnel.publicSuccess(result.org.id);
  } catch {}
  return NextResponse.json({ ok: true, orgId: result.org.id, ownerUserId: result.user.id });
});

