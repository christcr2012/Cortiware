import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

function ensureProviderCookie(jar: Awaited<ReturnType<typeof cookies>>) {
  return jar.get('rs_provider') || jar.get('provider-session') || jar.get('ws_provider');
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const active = url.searchParams.get('active');
  const where: any = {};
  if (active === 'true') where.active = true;
  if (active === 'false') where.active = false;
  const items = await prisma.offer.findMany({ where, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const jar = await cookies();
  if (!ensureProviderCookie(jar)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const item = await prisma.offer.create({ data: body });
  return NextResponse.json({ ok: true, item }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const jar = await cookies();
  if (!ensureProviderCookie(jar)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { id, ...rest } = body || {};
  if (!id) return NextResponse.json({ ok: false, error: 'missing_id' }, { status: 400 });
  const item = await prisma.offer.update({ where: { id }, data: rest });
  return NextResponse.json({ ok: true, item });
}

