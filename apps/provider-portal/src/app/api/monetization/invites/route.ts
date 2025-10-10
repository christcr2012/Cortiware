import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { compose, withProviderAuth, withRateLimit } from '@/lib/api/middleware';
import { withAudit } from '@/lib/api/audit-middleware';
import crypto from 'node:crypto';

export const dynamic = 'force-dynamic';

function signToken(payload: object) {
  const secret = process.env.ONBOARDING_TOKEN_SECRET || 'dev-onboarding-secret';
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

const getHandler = async (req: NextRequest) => {
  const url = new URL(req.url);
  const email = url.searchParams.get('email') || undefined;
  const where = email ? { email } : {};
  const items = await prisma.onboardingInvite.findMany({ where, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ items });
};

const postHandler = async (req: NextRequest) => {
  const body = await req.json().catch(() => ({}));
  const { email, planId, priceId, offerId, couponId, trialDays, expiresInMinutes, note } = body || {};
  const exp = new Date(Date.now() + Math.max(5, parseInt(expiresInMinutes || '60', 10)) * 60_000);
  const unsigned = { email, planId, priceId, offerId, couponId, trialDays, exp: exp.toISOString() };
  const token = signToken(unsigned);
  const invite = await prisma.onboardingInvite.create({ data: { email, planId, priceId, offerId, couponId, trialDays, expiresAt: exp, note: note || null, token } as any });
  return NextResponse.json({ ok: true, item: invite }, { status: 201 });
};

export const GET = compose(withProviderAuth(), withRateLimit('api'))(getHandler);

export const POST = compose(withProviderAuth(), withRateLimit('api'))(
  withAudit(postHandler, {
    action: 'create',
    entityType: 'onboarding_invite',
    actorType: 'provider',
    redactFields: ['token'],
  })
);

