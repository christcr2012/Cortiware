import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { jsonError, jsonOk } from '@/lib/api/response';
import { validateOpportunityCreate } from '@/lib/validation/opportunities';
import { compose, withTenantAuth, withIdempotencyRequired, withRateLimit } from '@/lib/api/middleware';



// Opportunities collection (tenant audience)
// Guardrails:
// - Rate limit: preset `api`
// - Idempotency: require `Idempotency-Key` for POST

const guardGet = compose(withRateLimit('api'), withTenantAuth());
export const GET = guardGet(async (_req: NextRequest) => {
  // TODO(sonnet): query Prisma for opportunities by orgId; support cursor+limit
  return jsonOk({ items: [], nextCursor: null });
});

const guardPost = compose(withRateLimit('api'), withIdempotencyRequired(), withTenantAuth());
export const POST = guardPost(async (req: NextRequest) => {
  const body = await req.json().catch(() => ({} as any));
  const v = validateOpportunityCreate(body);
  if (!v.ok) return jsonError(400, 'ValidationError', v.message);
  // TODO(sonnet): call opportunityService.create(orgId, userId, body)
  // TODO(sonnet): persist, return 201 with id

  return jsonError(501, 'NotImplemented', 'Opportunities creation not implemented yet');
});

