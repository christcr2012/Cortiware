import crypto from 'node:crypto';
import { verifyOnboardingToken } from '@/lib/onboardingToken';

function signToken(payload: object) {
  const secret = process.env.ONBOARDING_TOKEN_SECRET || 'dev-onboarding-secret';
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export async function run() {
  const name = 'onboarding.token';
  let passed = 0, failed = 0, total = 0;

  // valid token
  total++;
  try {
    const exp = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const t = signToken({ email: 'test@example.com', exp });
    const v = verifyOnboardingToken(t);
    if (v.ok && v.payload?.email === 'test@example.com') passed++; else throw new Error('expected ok');
  } catch (e) { failed++; }

  // bad signature
  total++;
  try {
    const exp = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const t = signToken({ email: 'x', exp }) + 'x';
    const v = verifyOnboardingToken(t);
    if (!v.ok) passed++; else throw new Error('expected failure');
  } catch (e) { failed++; }

  // expired
  total++;
  try {
    const exp = new Date(Date.now() - 60 * 1000).toISOString();
    const t = signToken({ email: 'x', exp });
    const v = verifyOnboardingToken(t);
    if (!v.ok) passed++; else throw new Error('expected expired');
  } catch (e) { failed++; }

  return { name, passed, failed, total };
}

