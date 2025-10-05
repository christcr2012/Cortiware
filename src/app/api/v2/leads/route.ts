import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { jsonError, jsonOk } from '@/lib/api/response';
import { validateLeadCreate } from '@/lib/validation/leads';
import { compose, withTenantAuth, withIdempotencyRequired, withRateLimit } from '@/lib/api/middleware';



// Leads collection route (tenant audience)
// Guardrails:
// - Rate limit: preset `api`
// - Idempotency: require `Idempotency-Key` for POST
// - Auth: require rs_user (accept legacy mv_user)
// Acceptance (Sonnet):
// - GET: return org-scoped list with pagination
// - POST: validate body, enforce dedupe per (orgId, email/phone), store idempotency

const guardGet = compose(withRateLimit('api'), withTenantAuth());
export const GET = guardGet(async (_req: NextRequest) => {
  // TODO(sonnet): query Prisma for leads by orgId; support cursor+limit
  return jsonOk({ items: [], nextCursor: null });
});

const guardPost = compose(withRateLimit('api'), withIdempotencyRequired(), withTenantAuth());
export const POST = guardPost(async (req: NextRequest) => {
  const body = await req.json().catch(() => ({} as any));
  const v = validateLeadCreate(body);
  if (!v.ok) return jsonError(400, 'ValidationError', v.message);
  // TODO(sonnet): call leadService.create(orgId, userId, body)
  // TODO(sonnet): upsert by (orgId, normalizedEmail?) when dedupe is desired
  // TODO(sonnet): persist idempotency key

  return jsonError(501, 'NotImplemented', 'Leads creation not implemented yet');
});

