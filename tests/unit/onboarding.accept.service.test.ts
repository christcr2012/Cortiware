import crypto from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { acceptOnboarding } from '@/server/services/onboarding.service';

function signToken(payload: object) {
  const secret = process.env.ONBOARDING_TOKEN_SECRET || 'dev-onboarding-secret';
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export async function run() {
  const name = 'onboarding.accept.service';
  let passed = 0, failed = 0, total = 0;

  // Happy path with valid invite and price
  total++;
  try {
    const token = signToken({ email: 'owner@example.com', exp: new Date(Date.now() + 5 * 60 * 1000).toISOString() });
    (prisma as any).onboardingInvite = {
      findUnique: async ({ where }: any) => ({
        id: 'inv-1', token: where.token, planId: 'planX', priceId: 'priceX', trialDays: 7, offerId: null, couponId: null, usedAt: null,
        plan: { id: 'planX', name: 'Pro' }, price: { id: 'priceX', cadence: 'MONTHLY', unitAmountCents: 5000 }, offer: null, coupon: null,
      }),
    };
    const created: any = {};
    (prisma as any).$transaction = async (fn: any) => {
      const tx = {
        org: { create: async ({ data }: any) => (created.org = { id: 'org-1', ...data }) },
        user: { create: async ({ data }: any) => (created.user = { id: 'user-1', ...data }) },
        subscription: { create: async ({ data }: any) => (created.sub = { id: 'sub-local-1', ...data }) },
        onboardingInvite: { update: async () => ({ id: 'inv-1', usedAt: new Date() }) },
      };
      return fn(tx);
    };

    const res = await acceptOnboarding({ token, companyName: 'Acme', ownerName: 'Alice', ownerEmail: 'alice@example.com', password: 'Secret123!' });
    if ((res as any).ok && created.org && created.user) passed++; else throw new Error('expected ok + created');
  } catch (e) { failed++; }

  return { name, passed, failed, total };
}

