import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

function ensureProviderCookie(jar: Awaited<ReturnType<typeof cookies>>) {
  return jar.get('rs_provider') || jar.get('provider-session') || jar.get('ws_provider');
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const orgId = url.searchParams.get('orgId') || undefined;
  const where = orgId ? { orgId } : {};
  const items = await prisma.tenantPriceOverride.findMany({ where, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const jar = await cookies();
  if (!ensureProviderCookie(jar)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { orgId, planId, priceId, type, percentOff, amountOffCents, priceCents, startsAt, endsAt, reason } = body || {};
  if (!orgId) return NextResponse.json({ ok: false, error: 'missing_org' }, { status: 400 });
  const item = await prisma.tenantPriceOverride.create({ data: { orgId, planId, priceId, type, percentOff, amountOffCents, priceCents, startsAt, endsAt, reason } });
  return NextResponse.json({ ok: true, item }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const jar = await cookies();
  if (!ensureProviderCookie(jar)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ ok: false, error: 'missing_id' }, { status: 400 });
  await prisma.tenantPriceOverride.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

