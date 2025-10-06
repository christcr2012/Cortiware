import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

function ensureProviderCookie(jar: Awaited<ReturnType<typeof cookies>>) {
  return jar.get('rs_provider') || jar.get('provider-session') || jar.get('ws_provider');
}

export async function GET() {
  const items = await prisma.pricePlan.findMany({
    include: { prices: true },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const jar = await cookies();
  if (!ensureProviderCookie(jar)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { key, name, description, prices } = body || {};
  if (!key || !name) return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 });

  const created = await prisma.pricePlan.create({ data: { key, name, description: description || null } });

  if (Array.isArray(prices)) {
    for (const p of prices) {
      if (typeof p?.unitAmountCents === 'number' && (p.cadence === 'MONTHLY' || p.cadence === 'YEARLY')) {
        await prisma.planPrice.create({
          data: { planId: created.id, unitAmountCents: p.unitAmountCents, currency: p.currency || 'usd', cadence: p.cadence, trialDays: p.trialDays ?? 0, active: p.active ?? true, stripePriceId: p.stripePriceId || null },
        });
      }
    }
  }

  const full = await prisma.pricePlan.findUnique({ where: { id: created.id }, include: { prices: true } });
  return NextResponse.json({ ok: true, item: full }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const jar = await cookies();
  if (!ensureProviderCookie(jar)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { id, name, description, active } = body || {};
  if (!id) return NextResponse.json({ ok: false, error: 'missing_id' }, { status: 400 });
  const updated = await prisma.pricePlan.update({ where: { id }, data: { name, description, active } });
  return NextResponse.json({ ok: true, item: updated });
}

