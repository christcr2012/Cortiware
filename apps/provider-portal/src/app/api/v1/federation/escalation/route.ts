import { NextRequest } from 'next/server';
import { verifyFederationRequest } from '@/lib/federation/verify';
import { readOrCreateIdempotent, saveIdempotent, bodyHash } from '@/lib/federation/idempotency';
import { dispatchEvent } from '@/lib/federation/webhooks';
import { jsonOk, jsonError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Verify federation request
  const verifyError = await verifyFederationRequest(req);
  if (verifyError) return verifyError;

  // Extract headers
  const idempotencyKey = req.headers.get('Idempotency-Key');
  const orgId = req.headers.get('X-Provider-Org')!;

  if (!idempotencyKey) {
    return jsonError(400, 'missing_idempotency_key', 'Idempotency-Key header required');
  }

  // Read body
  const bodyText = await req.text();
  const hash = bodyHash(Buffer.from(bodyText));
  const url = new URL(req.url);
  const path = url.pathname;

  // Check idempotency
  const existing = await readOrCreateIdempotent(idempotencyKey, 'POST', path, hash, orgId);
  if (existing) {
    return jsonOk(existing);
  }

  // Parse body
  let body: any;
  try {
    body = JSON.parse(bodyText);
  } catch {
    return jsonError(400, 'invalid_json', 'Request body must be valid JSON');
  }

  // Validate required fields
  const { escalationId, tenantId, incident, client } = body;
  if (!escalationId || !tenantId || !incident || !client) {
    return jsonError(400, 'missing_fields', 'Required fields: escalationId, tenantId, incident, client');
  }

  if (!incident.type || !incident.severity || !incident.description) {
    return jsonError(400, 'invalid_incident', 'Incident must have type, severity, description');
  }

  if (!client.orgId) {
    return jsonError(400, 'invalid_client', 'Client must have orgId');
  }

  // Check for duplicate escalationId
  const existingTicket = await prisma.escalationTicket.findUnique({
    where: { escalationId },
  });

  if (existingTicket) {
    const response = {
      success: true,
      providerTicketId: existingTicket.id,
      acknowledgment: 'received',
      note: 'Duplicate escalationId - returning existing ticket',
    };
    await saveIdempotent(idempotencyKey, 'POST', path, hash, orgId, response);
    return jsonOk(response);
  }

  // Create escalation ticket
  const ticket = await prisma.escalationTicket.create({
    data: {
      escalationId,
      tenantId,
      orgId: client.orgId,
      type: incident.type,
      severity: incident.severity,
      description: incident.description,
      state: 'received',
    },
  });

  // Write audit event
  await prisma.auditEvent.create({
    data: {
      actorType: 'system',
      orgId: client.orgId,
      action: 'create',
      entityType: 'escalation_ticket',
      entityId: ticket.id,
      result: 'success',
      metadata: { escalationId, severity: incident.severity },
    },
  }).catch(() => {}); // Non-fatal

  // Dispatch webhook (non-blocking)
  dispatchEvent(client.orgId, 'escalation.acknowledged', { ticketId: ticket.id }).catch(() => {});

  const response = {
    success: true,
    providerTicketId: ticket.id,
    acknowledgment: 'received',
  };

  // Save idempotent response
  await saveIdempotent(idempotencyKey, 'POST', path, hash, orgId, response);

  return jsonOk(response);
}

