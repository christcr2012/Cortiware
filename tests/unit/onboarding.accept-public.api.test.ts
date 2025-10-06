import { prisma } from '@/lib/prisma';
import { POST } from '@/app/api/onboarding/accept-public/route';

export async function run() {
  const name = 'onboarding.accept-public.api';
  let passed = 0, failed = 0, total = 0;

  // Happy path: public onboarding enabled
  total++;
  try {
    (prisma as any).globalMonetizationConfig = {
      findFirst: async () => ({ publicOnboarding: true, defaultPlanId: 'planX', defaultPriceId: 'priceX', defaultTrialDays: 14 }),
    };
    const saved: any = {};
    (prisma as any).$transaction = async (fn: any) => {
      const tx = {
        org: { create: async ({ data }: any) => ({ id: 'org-1', ...data }) },
        user: { create: async ({ data }: any) => ({ id: 'user-1', ...data }) },
        subscription: { create: async ({ data }: any) => { saved.sub = data; return { id: 'sub-1', ...data }; } },
      };
      return fn(tx);
    };
    // Stripe branch is guarded by isStripeConfigured(); remains false in test env
    const body = { companyName: 'Acme Co', ownerName: 'Alice', ownerEmail: 'alice@example.com', password: 'Secret123!' };
    const req: any = {
      method: 'POST',
      url: 'http://localhost/api/onboarding/accept-public',
      headers: { get: (k: string) => (k.toLowerCase()==='idempotency-key' ? 'test-key-1' : (k.toLowerCase()==='x-forwarded-for' ? '127.0.0.1' : undefined)) },
      json: async () => body,
      clone: () => ({ text: async () => JSON.stringify(body) }),
    };
    const res: Response = await (POST as any)(req);
    const resBody = await res.json();
    console.log('accept-public happy', res.status, resBody);
    if (res.status === 200 && resBody.ok && resBody.orgId && resBody.ownerUserId) passed++; else throw new Error('expected ok 200');
  } catch (e) { failed++; console.error('accept-public happy failed', e); }

  // Disabled: publicOnboarding=false
  total++;
  try {
    (prisma as any).globalMonetizationConfig = {
      findFirst: async () => ({ publicOnboarding: false, defaultPlanId: null, defaultPriceId: null, defaultTrialDays: 0 }),
    };
    const body2 = { companyName: 'x', ownerName: 'y', ownerEmail: 'z@example.com', password: 'pw' };
    const req: any = {
      method: 'POST',
      url: 'http://localhost/api/onboarding/accept-public',
      headers: { get: (k: string) => (k.toLowerCase()==='idempotency-key' ? 'test-key-2' : (k.toLowerCase()==='x-forwarded-for' ? '127.0.0.1' : undefined)) },
      json: async () => body2,
      clone: () => ({ text: async () => JSON.stringify(body2) }),
    };
    const res: Response = await (POST as any)(req);
    const resBody2 = await res.json();
    console.log('accept-public disabled', res.status, resBody2);
    if (res.status === 403 && resBody2.ok === false && resBody2.error === 'public_onboarding_disabled') passed++; else throw new Error('expected 403');
  } catch (e) { failed++; console.error('accept-public disabled failed', e); }

  return { name, passed, failed, total };
}

