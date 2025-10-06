/**
 * POST /api/federation/escalation — Create Escalation
 * 
 * Per escalation.md:
 * - HMAC auth required
 * - Idempotency-Key required
 * - Rate limiting: API preset (60s/100)
 * - Audit logging with correlation ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { compose, withRateLimit, withHmacAuth, withAuditLog } from '@/lib/api/middleware';
import { checkIdempotency, recordIdempotency, getIdempotencyKey } from '@/lib/idempotency-store';
import { v4 as uuidv4 } from 'uuid';

// Validation schemas
const SEVERITY_VALUES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
const STATUS_VALUES = ['OPEN', 'ACK', 'IN_PROGRESS', 'RESOLVED'] as const;

type Severity = typeof SEVERITY_VALUES[number];
type Status = typeof STATUS_VALUES[number];

interface EscalationRequest {
  orgId: string;
  incidentId: string;
  severity: Severity;
  summary: string;
  description: string;
  sourceSystem: string;
  createdAt: string;
  attachments?: Array<{ url: string; name?: string }>;
  metadata?: Record<string, any>;
}

interface EscalationResponse {
  escalationId: string;
  status: Status;
  createdAt: string;
}

/**
 * Validate escalation request
 */
function validateRequest(body: any): { valid: true; data: EscalationRequest } | { valid: false; errors: string[] } {
  const errors: string[] = [];

  if (!body.orgId || typeof body.orgId !== 'string' || body.orgId.length > 64) {
    errors.push('orgId: required string <= 64 chars');
  }
  if (!body.incidentId || typeof body.incidentId !== 'string' || body.incidentId.length > 64) {
    errors.push('incidentId: required string <= 64 chars');
  }
  if (!body.severity || !SEVERITY_VALUES.includes(body.severity)) {
    errors.push(`severity: required, must be one of ${SEVERITY_VALUES.join(', ')}`);
  }
  if (!body.summary || typeof body.summary !== 'string' || body.summary.length < 1 || body.summary.length > 200) {
    errors.push('summary: required string 1-200 chars');
  }
  if (!body.description || typeof body.description !== 'string' || body.description.length < 1 || body.description.length > 5000) {
    errors.push('description: required string 1-5000 chars');
  }
  if (!body.sourceSystem || typeof body.sourceSystem !== 'string' || body.sourceSystem.length > 64) {
    errors.push('sourceSystem: required string <= 64 chars');
  }
  if (!body.createdAt || typeof body.createdAt !== 'string') {
    errors.push('createdAt: required ISO8601 string');
  } else {
    // Validate ISO8601 format
    const date = new Date(body.createdAt);
    if (isNaN(date.getTime())) {
      errors.push('createdAt: invalid ISO8601 format');
    }
  }

  // Validate attachments if present
  if (body.attachments !== undefined) {
    if (!Array.isArray(body.attachments) || body.attachments.length > 10) {
      errors.push('attachments: optional array <= 10 items');
    } else {
      body.attachments.forEach((att: any, idx: number) => {
        if (!att.url || typeof att.url !== 'string' || !att.url.startsWith('https://')) {
          errors.push(`attachments[${idx}].url: required https URL`);
        }
        if (att.name !== undefined && (typeof att.name !== 'string' || att.name.length > 120)) {
          errors.push(`attachments[${idx}].name: optional string <= 120 chars`);
        }
      });
    }
  }

  // Validate metadata if present
  if (body.metadata !== undefined) {
    if (typeof body.metadata !== 'object' || Array.isArray(body.metadata)) {
      errors.push('metadata: optional flat object');
    } else if (Object.keys(body.metadata).length > 50) {
      errors.push('metadata: max 50 keys');
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, data: body as EscalationRequest };
}

/**
 * Handler for POST /api/federation/escalation
 */
async function handler(req: NextRequest) {
  try {
    // Check for Idempotency-Key header
    const idempotencyKey = req.headers.get('idempotency-key');
    if (!idempotencyKey) {
      return NextResponse.json(
        { error: 'Idempotency-Key header required' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await req.json();
    
    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 422 }
      );
    }

    // Get keyId from HMAC auth (set by withHmacAuth middleware)
    const keyId = req.headers.get('x-provider-keyid') || 'unknown';
    const route = '/api/federation/escalation';
    
    // Check idempotency
    const requestBody = JSON.stringify(body);
    const idemKey = getIdempotencyKey(route, keyId, idempotencyKey);
    const idemCheck = await checkIdempotency(idemKey, requestBody);

    if ('replay' in idemCheck && idemCheck.replay) {
      // Return stored response
      return NextResponse.json(idemCheck.response.body, {
        status: idemCheck.response.status,
        headers: idemCheck.response.headers,
      });
    }

    if ('conflict' in idemCheck && idemCheck.conflict) {
      // Same key, different body = conflict
      return NextResponse.json(
        { error: 'Idempotency key conflict: same key with different request body' },
        { status: 409 }
      );
    }

    // Process escalation (TODO: Replace with real database logic)
    const escalationId = `esc_${uuidv4().substring(0, 8)}`;
    const responseBody: EscalationResponse = {
      escalationId,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };

    // Record idempotency
    await recordIdempotency(idemKey, requestBody, {
      status: 201,
      body: responseBody,
    });

    // Return success response
    return NextResponse.json(responseBody, { status: 201 });
  } catch (error) {
    console.error('Escalation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Export POST handler with middleware composition
 *
 * Per WRAPPERS_SPEC.md:
 * Order: withAuditLog → withRateLimit → withHmacAuth → handler
 */
export const POST = compose(
  withAuditLog(),
  withRateLimit('api'),
  withHmacAuth()
)(handler);

