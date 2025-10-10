import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compose, withProviderAuth, withRateLimit } from '@/lib/api/middleware';
import { withAudit } from '@/lib/api/audit-middleware';

export const dynamic = 'force-dynamic';

const getHandler = async (req: NextRequest) => {
  const url = new URL(req.url);
  const orgId = url.searchParams.get('orgId') || undefined;
  const where = orgId ? { orgId } : {};
  const items = await prisma.tenantPriceOverride.findMany({ where, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ items });
};

const postHandler = async (req: NextRequest) => {
  const body = await req.json().catch(() => ({}));
  const { orgId, planId, priceId, type, percentOff, amountOffCents, priceCents, startsAt, endsAt, reason } = body || {};
  if (!orgId) return NextResponse.json({ ok: false, error: 'missing_org' }, { status: 400 });
  const item = await prisma.tenantPriceOverride.create({ data: { orgId, planId, priceId, type, percentOff, amountOffCents, priceCents, startsAt, endsAt, reason } });
  return NextResponse.json({ ok: true, item }, { status: 201 });
};

const deleteHandler = async (req: NextRequest) => {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ ok: false, error: 'missing_id' }, { status: 400 });
  await prisma.tenantPriceOverride.delete({ where: { id } });
  return NextResponse.json({ ok: true });
};

export const GET = compose(withProviderAuth(), withRateLimit('api'))(getHandler);

export const POST = compose(withProviderAuth(), withRateLimit('api'))(
  withAudit(postHandler, {
    action: 'create',
    entityType: 'tenant_price_override',
    actorType: 'provider',
    redactFields: [],
  })
);

export const DELETE = compose(withProviderAuth(), withRateLimit('api'))(
  withAudit(deleteHandler, {
    action: 'delete',
    entityType: 'tenant_price_override',
    actorType: 'provider',
    redactFields: [],
  })
);

