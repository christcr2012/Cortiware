import { NextRequest } from 'next/server';
import { verifyFederationRequest } from '@/lib/federation/verify';
import { readOrCreateIdempotent, saveIdempotent, bodyHash } from '@/lib/federation/idempotency';
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
  const { clientOrgId, leadId, conversionType, amountCents, metadata } = body;
  if (!clientOrgId || !leadId || !conversionType || typeof amountCents !== 'number') {
    return jsonError(400, 'missing_fields', 'Required fields: clientOrgId, leadId, conversionType, amountCents');
  }

  // Create invoice record
  const invoice = await prisma.federationInvoice.create({
    data: {
      clientOrgId,
      leadId,
      conversionType,
      amountCents,
      metadataJson: metadata || {},
      status: 'received',
    },
  });

  // Attempt Stripe processing
  let stripeSuccess = false;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (stripeSecretKey) {
    try {
      // TODO: Implement actual Stripe API call
      // For now, just mark as accepted
      stripeSuccess = true;
    } catch (error) {
      console.error('Stripe processing failed:', error);
    }
  }

  // Update invoice status
  const finalStatus = stripeSuccess ? 'accepted' : 'failed';
  await prisma.federationInvoice.update({
    where: { id: invoice.id },
    data: { status: finalStatus },
  });

  // Write audit event
  await prisma.auditEvent.create({
    data: {
      actorType: 'system',
      orgId: clientOrgId,
      action: 'create',
      entityType: 'federation_invoice',
      entityId: invoice.id,
      result: stripeSuccess ? 'success' : 'failure',
      metadata: { leadId, conversionType, amountCents },
    },
  }).catch(() => {}); // Non-fatal

  const response = {
    success: stripeSuccess,
    providerInvoiceId: invoice.id,
    status: finalStatus,
  };

  // Save idempotent response
  await saveIdempotent(idempotencyKey, 'POST', path, hash, orgId, response);

  return jsonOk(response);
}

