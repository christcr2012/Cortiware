import { prisma } from '@/lib/prisma';

/** Minimal funnel metrics using Activity model */
export async function trackFunnel(event: string, params?: { orgId?: string; entityId?: string; meta?: Record<string, any> }) {
  if (process.env.UNIT_TESTS === '1') return; // disable metrics writes in unit tests
  try {
    await prisma.activity.create({
      data: {
        orgId: params?.orgId || undefined as any,
        actorType: 'system',
        actorId: null,
        entityType: 'funnel',
        entityId: params?.entityId || event,
        action: event,
        meta: (params?.meta || {}) as any,
      }
    });
  } catch {}
}

export const funnel = {
  inviteCreated: (tokenId: string) => trackFunnel('invite_created', { entityId: tokenId }),
  inviteAccepted: (orgId: string) => trackFunnel('invite_accepted', { orgId }),
  publicAttempt: (email?: string) => trackFunnel('public_attempt', { entityId: email || 'unknown' }),
  publicSuccess: (orgId: string) => trackFunnel('public_success', { orgId }),
};

