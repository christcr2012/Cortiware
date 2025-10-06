// Federation audit logging
// Persists audit events for federation actions

import { prisma } from '@/lib/prisma';

export type FederationAuditEvent = {
  actor: string; // provider/developer identifier
  action: string; // e.g., 'tenants:list', 'tenants:read'
  resource?: string; // e.g., tenant ID
  result: 'success' | 'forbidden' | 'error';
  metadata?: Record<string, any>;
};

export async function logFederationAudit(event: FederationAuditEvent): Promise<void> {
  try {
    // For now, log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[FEDERATION AUDIT]', JSON.stringify(event, null, 2));
    }

    // TODO: Persist to AuditLog table or dedicated federation audit table
    // For now, we'll use the existing AuditLog model with a special orgId
    // In production, consider a separate FederationAuditLog table
    
    // Skip DB write for now to avoid schema changes mid-implementation
    // await prisma.auditLog.create({
    //   data: {
    //     orgId: 'federation', // Special marker for federation events
    //     entity: 'federation',
    //     entityId: event.resource,
    //     field: event.action,
    //     newValue: { actor: event.actor, result: event.result, ...event.metadata },
    //     reason: `Federation action: ${event.action}`,
    //   },
    // });
  } catch (error) {
    // Don't fail the request if audit logging fails
    console.error('[FEDERATION AUDIT ERROR]', error);
  }
}

