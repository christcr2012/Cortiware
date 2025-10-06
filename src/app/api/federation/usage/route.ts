/**
 * POST /api/federation/usage — Usage Data Ingestion
 * 
 * Accepts usage data from federated systems and creates UsageMeter records.
 * 
 * Requirements:
 * - HMAC auth required
 * - Idempotency-Key required
 * - Rate limiting: API preset (60s/100)
 * - Audit logging with correlation ID
 * - Creates UsageMeter records for billing
 */

import { NextRequest, NextResponse } from 'next/server';
import { compose, withRateLimit, withHmacAuth, withAuditLog } from '@/lib/api/middleware';
import { checkIdempotency, recordIdempotency, getIdempotencyKey } from '@/lib/idempotency-store';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

interface UsageDataRequest {
  orgId: string;
  meter: string;
  quantity: number;
  windowStart: string;
  windowEnd: string;
  metadata?: Record<string, any>;
}

interface UsageDataResponse {
  usageId: string;
  meterId: string;
  processed: boolean;
  timestamp: string;
}

/**
 * Validate usage data request
 */
function validateRequest(body: any): { valid: true; data: UsageDataRequest } | { valid: false; errors: string[] } {
  const errors: string[] = [];

  if (!body.orgId || typeof body.orgId !== 'string') {
    errors.push('orgId: required string');
  }
  if (!body.meter || typeof body.meter !== 'string') {
    errors.push('meter: required string (e.g., "api_calls", "storage_gb")');
  }
  if (typeof body.quantity !== 'number' || body.quantity < 0) {
    errors.push('quantity: required non-negative number');
  }
  if (!body.windowStart || typeof body.windowStart !== 'string') {
    errors.push('windowStart: required ISO 8601 timestamp');
  }
  if (!body.windowEnd || typeof body.windowEnd !== 'string') {
    errors.push('windowEnd: required ISO 8601 timestamp');
  }

  // Validate timestamps
  if (body.windowStart && body.windowEnd) {
    const start = new Date(body.windowStart);
    const end = new Date(body.windowEnd);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      errors.push('windowStart and windowEnd must be valid ISO 8601 timestamps');
    } else if (start >= end) {
      errors.push('windowStart must be before windowEnd');
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      orgId: body.orgId,
      meter: body.meter,
      quantity: body.quantity,
      windowStart: body.windowStart,
      windowEnd: body.windowEnd,
      metadata: body.metadata || {},
    },
  };
}

/**
 * Process usage data and create UsageMeter record
 */
async function processUsageData(data: UsageDataRequest): Promise<{ meterId: string }> {
  // Verify org exists
  const org = await prisma.org.findUnique({
    where: { id: data.orgId },
    select: { id: true },
  });

  if (!org) {
    throw new Error(`Organization ${data.orgId} not found`);
  }

  // Create UsageMeter record
  const meter = await prisma.usageMeter.create({
    data: {
      orgId: data.orgId,
      meter: data.meter,
      quantity: data.quantity,
      windowStart: new Date(data.windowStart),
      windowEnd: new Date(data.windowEnd),
    },
  });

  // Create Activity record for tracking
  await prisma.activity.create({
    data: {
      orgId: data.orgId,
      actorType: 'system',
      actorId: 'federation',
      entityType: 'usage_meter',
      entityId: meter.id,
      action: 'recorded',
      meta: {
        meter: data.meter,
        quantity: data.quantity,
        windowStart: data.windowStart,
        windowEnd: data.windowEnd,
        ...data.metadata,
      },
    },
  });

  return { meterId: meter.id };
}

/**
 * POST handler with middleware composition
 */
async function handlePOST(req: NextRequest): Promise<NextResponse> {
  try {
    // Get idempotency key from header
    const idempotencyKey = req.headers.get('idempotency-key');
    if (!idempotencyKey) {
      return NextResponse.json(
        { error: 'Idempotency-Key header required' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await req.json();

    // Get keyId from HMAC auth (set by withHmacAuth middleware)
    const keyId = req.headers.get('x-provider-keyid') || 'unknown';
    const route = '/api/federation/usage';

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
      return NextResponse.json(
        { error: 'Idempotency key conflict: same key, different body' },
        { status: 409 }
      );
    }

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 422 }
      );
    }

    // Process usage data
    const result = await processUsageData(validation.data);

    const response: UsageDataResponse = {
      usageId: uuidv4(),
      meterId: result.meterId,
      processed: true,
      timestamp: new Date().toISOString(),
    };

    // Record idempotency
    await recordIdempotency(idemKey, requestBody, {
      status: 201,
      body: response,
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('[Federation Usage] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

// Apply middleware composition
export const POST = compose(
  withRateLimit('api'),
  withHmacAuth(),
  withAuditLog(),
)(handlePOST);

