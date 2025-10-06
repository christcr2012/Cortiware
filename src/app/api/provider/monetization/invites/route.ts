import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import crypto from 'node:crypto';

export const dynamic = 'force-dynamic';

function ensureProviderCookie(jar: Awaited<ReturnType<typeof cookies>>) {
  return jar.get('rs_provider') || jar.get('provider-session') || jar.get('ws_provider');
}

function signToken(payload: object) {
  const secret = process.env.ONBOARDING_TOKEN_SECRET || 'dev-onboarding-secret';
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const email = url.searchParams.get('email') || undefined;
  const where = email ? { email } : {};
  const items = await prisma.onboardingInvite.findMany({ where, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const jar = await cookies();
  if (!ensureProviderCookie(jar)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { email, planId, priceId, offerId, couponId, trialDays, expiresInMinutes, note } = body || {};
  const exp = new Date(Date.now() + Math.max(5, parseInt(expiresInMinutes || '60', 10)) * 60_000);
  const unsigned = { email, planId, priceId, offerId, couponId, trialDays, exp: exp.toISOString() };
  const token = signToken(unsigned);
  const invite = await prisma.onboardingInvite.create({ data: { email, planId, priceId, offerId, couponId, trialDays, expiresAt: exp, note: note || null, token } as any });
  return NextResponse.json({ ok: true, item: invite }, { status: 201 });
}

