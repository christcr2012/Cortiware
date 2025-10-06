/**
 * POST /api/federation/events — Generic Event Ingestion
 * 
 * Accepts events from federated systems and maps them to domain writes.
 * 
 * Requirements:
 * - HMAC auth required
 * - Idempotency-Key required
 * - Rate limiting: API preset (60s/100)
 * - Audit logging with correlation ID
 * - Maps event types to Activity records
 */

import { NextRequest, NextResponse } from 'next/server';
import { compose, withRateLimit, withHmacAuth, withAuditLog } from '@/lib/api/middleware';
import { checkIdempotency, recordIdempotency, getIdempotencyKey } from '@/lib/idempotency-store';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

// Event types
const EVENT_TYPES = [
  'lead.created',
  'lead.updated',
  'lead.converted',
  'invoice.created',
  'invoice.paid',
  'invoice.failed',
  'subscription.created',
  'subscription.updated',
  'subscription.canceled',
  'usage.recorded',
  'addon.purchased',
  'addon.refunded',
  'incident.created',
  'incident.resolved',
] as const;

type EventType = typeof EVENT_TYPES[number];

interface FederationEvent {
  eventType: EventType;
  orgId: string;
  entityType: string;
  entityId: string;
  actorType?: 'system' | 'user' | 'machine';
  actorId?: string;
  action: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

interface EventResponse {
  eventId: string;
  activityId: string;
  processed: boolean;
  timestamp: string;
}

/**
 * Validate event request
 */
function validateRequest(body: any): { valid: true; data: FederationEvent } | { valid: false; errors: string[] } {
  const errors: string[] = [];

  if (!body.eventType || !EVENT_TYPES.includes(body.eventType)) {
    errors.push(`eventType: required, must be one of ${EVENT_TYPES.join(', ')}`);
  }
  if (!body.orgId || typeof body.orgId !== 'string') {
    errors.push('orgId: required string');
  }
  if (!body.entityType || typeof body.entityType !== 'string') {
    errors.push('entityType: required string');
  }
  if (!body.entityId || typeof body.entityId !== 'string') {
    errors.push('entityId: required string');
  }
  if (!body.action || typeof body.action !== 'string') {
    errors.push('action: required string');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      eventType: body.eventType,
      orgId: body.orgId,
      entityType: body.entityType,
      entityId: body.entityId,
      actorType: body.actorType || 'system',
      actorId: body.actorId,
      action: body.action,
      metadata: body.metadata || {},
      timestamp: body.timestamp || new Date().toISOString(),
    },
  };
}

/**
 * Process event and create Activity record
 */
async function processEvent(event: FederationEvent): Promise<{ activityId: string }> {
  // Verify org exists
  const org = await prisma.org.findUnique({
    where: { id: event.orgId },
    select: { id: true },
  });

  if (!org) {
    throw new Error(`Organization ${event.orgId} not found`);
  }

  // Create Activity record
  const activity = await prisma.activity.create({
    data: {
      orgId: event.orgId,
      actorType: event.actorType || 'system',
      actorId: event.actorId,
      entityType: event.entityType,
      entityId: event.entityId,
      action: event.action,
      meta: event.metadata || {},
      createdAt: event.timestamp ? new Date(event.timestamp) : new Date(),
    },
  });

  return { activityId: activity.id };
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
    const route = '/api/federation/events';

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

    // Process event
    const result = await processEvent(validation.data);

    const response: EventResponse = {
      eventId: uuidv4(),
      activityId: result.activityId,
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
    console.error('[Federation Events] Error:', error);
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

