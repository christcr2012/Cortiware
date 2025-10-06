import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

function ensureProviderCookie(jar: Awaited<ReturnType<typeof cookies>>) {
  return jar.get('rs_provider') || jar.get('provider-session') || jar.get('ws_provider');
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const planId = url.searchParams.get('planId') || undefined;
  const where = planId ? { planId } : {};
  const items = await prisma.planPrice.findMany({ where, orderBy: [{ planId: 'asc' }, { cadence: 'asc' }, { unitAmountCents: 'asc' }] });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const jar = await cookies();
  if (!ensureProviderCookie(jar)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { planId, unitAmountCents, cadence, currency, trialDays, active, stripePriceId } = body || {};
  if (!planId || typeof unitAmountCents !== 'number' || !(cadence === 'MONTHLY' || cadence === 'YEARLY')) {
    return NextResponse.json({ ok: false, error: 'invalid_fields' }, { status: 400 });
  }
  const item = await prisma.planPrice.create({ data: { planId, unitAmountCents, cadence, currency: currency || 'usd', trialDays: trialDays ?? 0, active: active ?? true, stripePriceId: stripePriceId || null } });
  return NextResponse.json({ ok: true, item }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const jar = await cookies();
  if (!ensureProviderCookie(jar)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { id, unitAmountCents, cadence, currency, trialDays, active, stripePriceId } = body || {};
  if (!id) return NextResponse.json({ ok: false, error: 'missing_id' }, { status: 400 });
  const item = await prisma.planPrice.update({ where: { id }, data: { unitAmountCents, cadence, currency, trialDays, active, stripePriceId } });
  return NextResponse.json({ ok: true, item });
}

