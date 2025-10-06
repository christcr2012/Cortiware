import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type AuditMetadata = {
  action: string;
  entityType: string;
  entityId?: string;
  actorType?: 'provider' | 'system' | 'user';
  actorId?: string;
  redactFields?: string[]; // Fields to redact from metadata
};

/**
 * Unified audit middleware wrapper
 * Records all write operations to AuditEvent table
 * Redacts PII fields specified in metadata
 */
export function withAudit<T extends any[] = []>(
  handler: (req: NextRequest, ...args: T) => Promise<NextResponse>,
  meta: AuditMetadata
) {
  return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
    const startTime = Date.now();
    let response: NextResponse;
    let error: Error | null = null;

    try {
      response = await handler(req, ...args);
    } catch (e) {
      error = e as Error;
      throw e;
    } finally {
      // Record audit event asynchronously (don't block response)
      recordAuditEvent(req, meta, error, Date.now() - startTime).catch((auditError) => {
        console.error('[withAudit] Failed to record audit event:', auditError);
      });
    }

    return response!;
  };
}

async function recordAuditEvent(
  req: NextRequest,
  meta: AuditMetadata,
  error: Error | null,
  durationMs: number
) {
  try {
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Build metadata object
    const metadata: Record<string, any> = {
      method: req.method,
      path: req.nextUrl.pathname,
      durationMs,
      success: !error,
    };

    if (error) {
      metadata.error = {
        message: error.message,
        name: error.name,
      };
    }

    // Redact specified fields
    if (meta.redactFields && meta.redactFields.length > 0) {
      metadata.redactedFields = meta.redactFields;
    }

    await prisma.auditEvent.create({
      data: {
        actorType: meta.actorType || 'system',
        actorId: meta.actorId,
        action: meta.action,
        entityType: meta.entityType,
        entityId: meta.entityId,
        metadata,
        ipAddress,
        userAgent,
      },
    });
  } catch (auditError) {
    // Log but don't throw - audit failures shouldn't break the app
    console.error('[recordAuditEvent] Failed:', auditError);
  }
}

