import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

function ensureProviderCookie(jar: Awaited<ReturnType<typeof cookies>>) {
  return jar.get('rs_provider') || jar.get('provider-session') || jar.get('ws_provider');
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code') || undefined;
  const active = url.searchParams.get('active');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10), 0);
  const where: any = {};
  if (code) where.code = code;
  if (active === 'true') where.active = true;
  if (active === 'false') where.active = false;
  const [items, total] = await Promise.all([
    prisma.coupon.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit, skip: offset }),
    prisma.coupon.count({ where }),
  ]);
  return NextResponse.json({ items, page: { total, limit, offset } });
}

export async function POST(req: NextRequest) {
  const jar = await cookies();
  if (!ensureProviderCookie(jar)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const item = await prisma.coupon.create({ data: body });
  try { const { logMonetizationChange } = await import('@/services/audit-log.service'); await logMonetizationChange({ entity:'coupon', action:'create', id:item.id, newValue:item as any }); } catch {}
  return NextResponse.json({ ok: true, item }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const jar = await cookies();
  if (!ensureProviderCookie(jar)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { id, ...rest } = body || {};
  if (!id) return NextResponse.json({ ok: false, error: 'missing_id' }, { status: 400 });
  const before = await prisma.coupon.findUnique({ where: { id } });
  const item = await prisma.coupon.update({ where: { id }, data: rest });
  try { const { logMonetizationChange } = await import('@/services/audit-log.service'); await logMonetizationChange({ entity:'coupon', action:'update', id:item.id, oldValue:before as any, newValue:item as any }); } catch {}
  return NextResponse.json({ ok: true, item });
}

export async function DELETE(req: NextRequest) {
  const jar = await cookies();
  if (!ensureProviderCookie(jar)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ ok: false, error: 'missing_id' }, { status: 400 });
  const before = await prisma.coupon.findUnique({ where: { id } });
  await prisma.coupon.delete({ where: { id } });
  try { const { logMonetizationChange } = await import('@/services/audit-log.service'); await logMonetizationChange({ entity:'coupon', action:'delete', id:id, oldValue:before as any }); } catch {}
  return NextResponse.json({ ok: true });
}

