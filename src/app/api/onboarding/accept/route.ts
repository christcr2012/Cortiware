import { NextRequest, NextResponse } from 'next/server';
import { acceptOnboarding } from '@/server/services/onboarding.service';
import { compose, withRateLimit, withIdempotencyRequired } from '@/lib/api/middleware';

export const dynamic = 'force-dynamic';

const guard = compose(withRateLimit('auth'), withIdempotencyRequired());
export const POST = guard(async (req: NextRequest) => {
  const body = await req.json().catch(() => ({}));
  const token = (body?.token as string) || '';
  const companyName = (body?.companyName as string) || '';
  const ownerName = (body?.ownerName as string) || '';
  const ownerEmail = (body?.ownerEmail as string) || '';
  const password = (body?.password as string) || '';

  if (!token || !companyName || !ownerName || !ownerEmail || !password) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 });
  }

  const res = await acceptOnboarding({ token, companyName, ownerName, ownerEmail, password });
  if (!(res as any).ok) return NextResponse.json(res, { status: 400 });
  try {
    const { logOnboardingEvent } = await import('@/services/audit-log.service');
    const { funnel } = await import('@/services/metrics.service');
    await logOnboardingEvent({ action: 'accepted', orgId: (res as any).orgId, data: { method: 'invite' } });
    await funnel.inviteAccepted((res as any).orgId);
  } catch {}
  return NextResponse.json(res);
});

