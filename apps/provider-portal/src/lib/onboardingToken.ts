// src/lib/onboardingToken.ts
import crypto from 'node:crypto';

export type OnboardingUnsignedPayload = {
  email?: string;
  planId?: string;
  priceId?: string;
  offerId?: string;
  couponId?: string;
  trialDays?: number;
  exp: string; // ISO timestamp
};

function getSecret() {
  return process.env.ONBOARDING_TOKEN_SECRET || 'dev-onboarding-secret';
}

export function verifyOnboardingToken(token: string): { ok: boolean; payload?: OnboardingUnsignedPayload; error?: string } {
  try {
    if (!token || !token.includes('.')) return { ok: false, error: 'invalid_token' };
    const [body, sig] = token.split('.', 2);
    const expected = crypto.createHmac('sha256', getSecret()).update(body).digest('base64url');
    if (sig !== expected) return { ok: false, error: 'bad_signature' };
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as OnboardingUnsignedPayload;
    const exp = new Date(payload.exp);
    if (!isFinite(exp.getTime())) return { ok: false, error: 'bad_exp' };
    if (Date.now() > exp.getTime()) return { ok: false, error: 'expired' };
    return { ok: true, payload };
  } catch (e:any) {
    return { ok: false, error: 'invalid_token' };
  }
}

