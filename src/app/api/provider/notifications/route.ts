import { NextRequest, NextResponse } from 'next/server';
import { listNotifications, markNotificationRead } from '@/services/provider/notifications.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const audience = url.searchParams.get('audience') || 'provider';
  const orgId = url.searchParams.get('orgId');
  const limit = parseInt(url.searchParams.get('limit') || '10', 10);
  const items = await listNotifications({ audience, orgId, limit });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });
  await markNotificationRead(body.id);
  return NextResponse.json({ ok: true });
}

