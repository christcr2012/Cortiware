import { prisma } from '@/lib/prisma';

export type AuditEntity = 'onboarding' | 'pricing' | 'coupon' | 'offer' | 'override' | 'config' | 'metrics';

export async function logOnboardingEvent(params: {
  orgId?: string;
  actorUserId?: string | null;
  entityId?: string | null;
  action: 'verify' | 'accepted' | 'failed' | 'public_attempt' | 'public_success';
  reason?: string | null;
  data?: Record<string, any>;
}) {
  if (process.env.UNIT_TESTS === '1') return; // disable audit writes in unit tests
  if (!params.orgId) return; // skip when org not yet created (e.g., public_attempt)
  try {
    await prisma.auditLog.create({
      data: {
        orgId: params.orgId || undefined as any,
        actorUserId: params.actorUserId || null,
        entity: 'onboarding',
        entityId: params.entityId || null,
        field: params.action,
        newValue: params.data ? params.data as any : undefined,
        reason: params.reason || undefined,
      }
    });
  } catch {}
}

export async function logMonetizationChange(params: {
  entity: Exclude<AuditEntity, 'onboarding' | 'metrics'>;
  orgId?: string;
  actorUserId?: string | null;
  id?: string | null; // entity id
  action: 'create' | 'update' | 'delete';
  oldValue?: Record<string, any> | null;
  newValue?: Record<string, any> | null;
  reason?: string | null;
}) {
  // Monetization changes are provider-scope; allow null orgId
  try {
    await prisma.auditLog.create({
      data: {
        orgId: params.orgId || undefined as any,
        actorUserId: params.actorUserId || null,
        entity: params.entity,
        entityId: params.id || null,
        field: params.action,
        oldValue: params.oldValue ? params.oldValue as any : undefined,
        newValue: params.newValue ? params.newValue as any : undefined,
        reason: params.reason || undefined,
      }
    });
  } catch {}
}

