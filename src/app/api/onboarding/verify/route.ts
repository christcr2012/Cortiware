import { NextRequest, NextResponse } from 'next/server';
import { verifyInviteToken } from '@/server/services/onboarding.service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const t = url.searchParams.get('t') || '';
  if (!t) return NextResponse.json({ ok: false, error: 'token_required' }, { status: 400 });

  const v = await verifyInviteToken(t);
  if (!v.ok) return NextResponse.json({ ok: false, error: v.error }, { status: 400 });

  // Expose display helpers while keeping raw ids
  const invite = (v as any).invite;
  return NextResponse.json({
    ok: true,
    token: t,
    payload: v.payload,
    invite: {
      email: invite.email,
      planId: invite.planId,
      priceId: invite.priceId,
      offerId: invite.offerId,
      couponId: invite.couponId,
      trialDays: invite.trialDays ?? 0,
      expiresAt: invite.expiresAt,
      planName: invite.plan?.name ?? null,
      priceCadence: invite.price?.cadence ?? null,
      priceAmountCents: invite.price?.unitAmountCents ?? null,
    },
  });
}

