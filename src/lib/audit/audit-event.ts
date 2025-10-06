/**
 * Audit Event System
 * 
 * Per AUDIT_EVENT_MODEL.md:
 * - Standardized immutable audit events
 * - Correlation IDs (UUIDv4)
 * - Redaction rules (never log raw bodies/secrets)
 * - Structured logging with route, keyId (hashed), ip, outcome, latencyMs
 */

import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export type AuditEventOutcome = 'SUCCESS' | 'FAILURE';

export type AuditActorType = 'machine' | 'user' | 'system';

export interface AuditActor {
  type: AuditActorType;
  keyIdHash?: string; // SHA-256 hash of keyId for machine actors
  userId?: string; // For user actors
  email?: string; // For user actors
}

export interface AuditHttpContext {
  method: string;
  status: number;
  latencyMs: number;
}

export interface AuditEvent {
  id: string; // UUIDv4
  time: string; // ISO 8601
  correlationId: string; // UUIDv4
  actor: AuditActor;
  route: string;
  scope?: string;
  outcome: AuditEventOutcome;
  http: AuditHttpContext;
  redactions: string[];
  details?: Record<string, any>;
  errorCode?: string;
  ip?: string;
}

/**
 * Hash a key ID using SHA-256
 */
export function hashKeyId(keyId: string): string {
  return crypto.createHash('sha256').update(keyId, 'utf8').digest('hex');
}

/**
 * Generate a correlation ID
 */
export function generateCorrelationId(): string {
  return uuidv4();
}

/**
 * Redact sensitive fields from an object
 * 
 * Per AUDIT_EVENT_MODEL.md:
 * - Never log raw bodies or secrets
 * - Redact free-text fields (description, notes, etc.)
 * - Bucket monetary amounts
 * - Remove or tokenize PII
 */
export function redactSensitiveFields(obj: any, redactions: string[] = []): any {
  if (!obj || typeof obj !== 'object') return obj;

  const redacted = { ...obj };
  const sensitiveFields = [
    'password',
    'secret',
    'token',
    'apiKey',
    'authorization',
    'description',
    'notes',
    'body',
    'rawBody',
    ...redactions,
  ];

  for (const key of Object.keys(redacted)) {
    if (sensitiveFields.includes(key.toLowerCase())) {
      redacted[key] = '[REDACTED]';
    } else if (key.toLowerCase().includes('amount') && typeof redacted[key] === 'number') {
      // Bucket monetary amounts
      redacted[key] = bucketAmount(redacted[key]);
    } else if (typeof redacted[key] === 'object') {
      redacted[key] = redactSensitiveFields(redacted[key], redactions);
    }
  }

  return redacted;
}

/**
 * Bucket monetary amounts for privacy
 */
function bucketAmount(amount: number): string {
  if (amount < 10) return '<$10';
  if (amount < 100) return '$10-$100';
  if (amount < 1000) return '$100-$1K';
  if (amount < 10000) return '$1K-$10K';
  if (amount < 100000) return '$10K-$100K';
  return '>$100K';
}

/**
 * Create an audit event
 */
export function createAuditEvent(params: {
  correlationId: string;
  actor: AuditActor;
  route: string;
  scope?: string;
  outcome: AuditEventOutcome;
  http: AuditHttpContext;
  details?: Record<string, any>;
  errorCode?: string;
  ip?: string;
  additionalRedactions?: string[];
}): AuditEvent {
  const redactions = ['body', 'rawBody', 'description', 'notes', ...(params.additionalRedactions || [])];
  
  return {
    id: uuidv4(),
    time: new Date().toISOString(),
    correlationId: params.correlationId,
    actor: params.actor,
    route: params.route,
    scope: params.scope,
    outcome: params.outcome,
    http: params.http,
    redactions,
    details: params.details ? redactSensitiveFields(params.details, redactions) : undefined,
    errorCode: params.errorCode,
    ip: params.ip,
  };
}

/**
 * Log an audit event
 * 
 * Current: Console logging (structured JSON)
 * Production: Send to logging service (Datadog, CloudWatch, etc.)
 */
export function logAuditEvent(event: AuditEvent): void {
  // Structured logging for production log aggregation
  console.log(JSON.stringify({
    type: 'AUDIT_EVENT',
    ...event,
  }));
}

/**
 * Create and log an audit event in one call
 */
export function auditLog(params: Parameters<typeof createAuditEvent>[0]): void {
  const event = createAuditEvent(params);
  logAuditEvent(event);
}

