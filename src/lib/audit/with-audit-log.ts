/**
 * Audit Logging Middleware Wrapper
 * 
 * Automatically logs audit events for all requests passing through middleware.
 * Captures correlation ID, actor, route, outcome, latency, and errors.
 */

import type { NextRequest } from 'next/server';
import type { Handler, Wrapper } from '@/lib/api/middleware';
import { 
  generateCorrelationId, 
  hashKeyId, 
  auditLog,
  type AuditActor,
  type AuditEventOutcome,
} from './audit-event';

/**
 * Extract actor information from request
 */
function extractActor(req: NextRequest): AuditActor {
  // Check for HMAC auth (machine actor)
  const keyId = req.headers.get('x-provider-keyid');
  if (keyId) {
    return {
      type: 'machine',
      keyIdHash: hashKeyId(keyId),
    };
  }

  // Check for user auth (from cookies or headers)
  const userEmail = req.headers.get('x-user-email');
  const userId = req.headers.get('x-user-id');

  if (userEmail || userId) {
    return {
      type: 'user',
      userId: userId || undefined,
      email: userEmail || undefined,
    };
  }

  // Default to system actor
  return {
    type: 'system',
  };
}

/**
 * Extract IP address from request
 */
function extractIp(req: NextRequest): string | undefined {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0] ||
    req.headers.get('x-real-ip') ||
    undefined
  );
}

/**
 * Audit Logging Wrapper
 * 
 * Wraps a handler to automatically log audit events.
 * Adds X-Correlation-Id header to response.
 * 
 * @returns Wrapper function
 */
export function withAuditLog(): Wrapper {
  return (handler) => async (req, ...args) => {
    const startTime = Date.now();
    const correlationId = generateCorrelationId();
    const route = new URL(req.url).pathname;
    const method = req.method;
    const actor = extractActor(req);
    const ip = extractIp(req);

    try {
      // Execute handler
      const response = await handler(req, ...args);
      const latencyMs = Date.now() - startTime;

      // Log successful audit event
      auditLog({
        correlationId,
        actor,
        route,
        outcome: 'SUCCESS',
        http: {
          method,
          status: response.status,
          latencyMs,
        },
        ip,
      });

      // Add correlation ID to response headers
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers),
      });
      newResponse.headers.set('X-Correlation-Id', correlationId);

      return newResponse;
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      const errorCode = error instanceof Error ? error.name : 'UNKNOWN_ERROR';

      // Log failure audit event
      auditLog({
        correlationId,
        actor,
        route,
        outcome: 'FAILURE',
        http: {
          method,
          status: 500,
          latencyMs,
        },
        errorCode,
        details: {
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
        ip,
      });

      // Re-throw error to be handled by error boundary
      throw error;
    }
  };
}

