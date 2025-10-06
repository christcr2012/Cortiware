import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

function ensureProviderCookie(jar: Awaited<ReturnType<typeof cookies>>) {
  return jar.get('rs_provider') || jar.get('provider-session') || jar.get('ws_provider');
}

export async function GET() {
  const cfg = await prisma.globalMonetizationConfig.findFirst({ include: { defaultPlan: true, defaultPrice: true } });
  return NextResponse.json({ item: cfg });
}

export async function PATCH(req: NextRequest) {
  const jar = await cookies();
  if (!ensureProviderCookie(jar)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
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
}

