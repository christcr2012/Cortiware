import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compose, withProviderAuth, withRateLimit } from '@/lib/api/middleware';
import { withAudit } from '@/lib/api/audit-middleware';

export const dynamic = 'force-dynamic';

const getHandler = async (req: NextRequest) => {
  const url = new URL(req.url);
  const planId = url.searchParams.get('planId') || undefined;
  const where = planId ? { planId } : {};
  const items = await prisma.planPrice.findMany({ where, orderBy: [{ planId: 'asc' }, { cadence: 'asc' }, { unitAmountCents: 'asc' }] });
  return NextResponse.json({ items });
};

const postHandler = async (req: NextRequest) => {
  const body = await req.json().catch(() => ({}));
  const { planId, unitAmountCents, cadence, currency, trialDays, active, stripePriceId } = body || {};
  if (!planId || typeof unitAmountCents !== 'number' || !(cadence === 'MONTHLY' || cadence === 'YEARLY')) {
    return NextResponse.json({ ok: false, error: 'invalid_fields' }, { status: 400 });
  }
  const item = await prisma.planPrice.create({ data: { planId, unitAmountCents, cadence, currency: currency || 'usd', trialDays: trialDays ?? 0, active: active ?? true, stripePriceId: stripePriceId || null } });
  return NextResponse.json({ ok: true, item }, { status: 201 });
};

const patchHandler = async (req: NextRequest) => {
  const body = await req.json().catch(() => ({}));
  const { id, unitAmountCents, cadence, currency, trialDays, active, stripePriceId } = body || {};
  if (!id) return NextResponse.json({ ok: false, error: 'missing_id' }, { status: 400 });
  const item = await prisma.planPrice.update({ where: { id }, data: { unitAmountCents, cadence, currency, trialDays, active, stripePriceId } });
  return NextResponse.json({ ok: true, item });
};

export const GET = compose(withProviderAuth(), withRateLimit('api'))(getHandler);

export const POST = compose(withProviderAuth(), withRateLimit('api'))(
  withAudit(postHandler, {
    action: 'create',
    entityType: 'plan_price',
    actorType: 'provider',
    redactFields: [],
  })
);

export const PATCH = compose(withProviderAuth(), withRateLimit('api'))(
  withAudit(patchHandler, {
    action: 'update',
    entityType: 'plan_price',
    actorType: 'provider',
    redactFields: [],
  })
);

