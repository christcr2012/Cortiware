import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compose, withProviderAuth, withRateLimit } from '@/lib/api/middleware';
import { withAudit } from '@/lib/api/audit-middleware';

export const dynamic = 'force-dynamic';

const getHandler = async () => {
  const cfg = await prisma.globalMonetizationConfig.findFirst({ include: { defaultPlan: true, defaultPrice: true } });
  return NextResponse.json({ item: cfg });
};

const patchHandler = async (req: NextRequest) => {
  const body = await req.json().catch(() => ({}));
  const { defaultPlanId, defaultPriceId, defaultTrialDays, publicOnboarding } = body || {};
  const first = await prisma.globalMonetizationConfig.findFirst();
  const data: any = { defaultPlanId, defaultPriceId, defaultTrialDays, publicOnboarding };
  let item;
  if (first) {
    item = await prisma.globalMonetizationConfig.update({ where: { id: first.id }, data });
  } else {
    item = await prisma.globalMonetizationConfig.create({ data });
  }
  return NextResponse.json({ ok: true, item });
};

export const GET = compose(withProviderAuth(), withRateLimit('api'))(getHandler);

export const PATCH = compose(withProviderAuth(), withRateLimit('api'))(
  withAudit(patchHandler, {
    action: 'update',
    entityType: 'global_monetization_config',
    actorType: 'provider',
    redactFields: [],
  })
);

