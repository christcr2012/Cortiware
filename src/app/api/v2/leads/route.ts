import { NextRequest, NextResponse } from 'next/server';
import { jsonError, jsonOk } from '@/lib/api/response';
import { validateLeadCreate } from '@/lib/validation/leads';
import { compose, withTenantAuth, withIdempotencyRequired, withRateLimit } from '@/lib/api/middleware';
import { leadService } from '@/services/leads.service';

// Leads collection route (tenant audience)
// Guardrails:
// - Rate limit: preset `api`
// - Idempotency: require `Idempotency-Key` for POST
// - Auth: require rs_user (accept legacy mv_user), injects x-org-id and x-user-id headers
// Implementation:
// - GET: return org-scoped list with pagination, search, and filters
// - POST: validate body, enforce dedupe per (orgId, email/phone), audit log

const guardGet = compose(withRateLimit('api'), withTenantAuth());
export const GET = guardGet(async (req: NextRequest) => {
  // Extract context from headers (injected by withTenantAuth)
  const orgId = req.headers.get('x-org-id');
  if (!orgId) return jsonError(401, 'Unauthorized', 'Missing org context');

  // Parse query params
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || undefined;
  const status = searchParams.get('status') || undefined;
  const sourceType = searchParams.get('sourceType') || undefined;
  const cursor = searchParams.get('cursor') || undefined;
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  // Call service
  const result = await leadService.list(orgId, { q, status, sourceType, cursor, limit });

  return jsonOk(result);
});

const guardPost = compose(withRateLimit('api'), withIdempotencyRequired(), withTenantAuth());
export const POST = guardPost(async (req: NextRequest) => {
  // Extract context from headers
  const orgId = req.headers.get('x-org-id');
  const userId = req.headers.get('x-user-id');
  if (!orgId || !userId) return jsonError(401, 'Unauthorized', 'Missing auth context');

  // Parse and validate body
  const body = await req.json().catch(() => ({} as any));
  const v = validateLeadCreate(body);
  if (!v.ok) return jsonError(400, 'ValidationError', v.message);

  // Call service (handles deduplication and audit logging)
  const result = await leadService.create(orgId, userId, body);

  // Return 201 Created
  return new NextResponse(JSON.stringify(result), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
});

