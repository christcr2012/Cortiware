import { NextRequest, NextResponse } from 'next/server';
import { jsonError, jsonOk } from '@/lib/api/response';
import { validateOpportunityCreate } from '@/lib/validation/opportunities';
import { compose, withTenantAuth, withIdempotencyRequired, withRateLimit } from '@/lib/api/middleware';
import { opportunityService } from '@/services/opportunities.service';

// Opportunities collection (tenant audience)
// Guardrails:
// - Rate limit: preset `api`
// - Idempotency: require `Idempotency-Key` for POST
// - Auth: require rs_user, injects x-org-id and x-user-id headers

const guardGet = compose(withRateLimit('api'), withTenantAuth());
export const GET = guardGet(async (req: NextRequest) => {
  const orgId = req.headers.get('x-org-id');
  if (!orgId) return jsonError(401, 'Unauthorized', 'Missing org context');

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || undefined;
  const stage = searchParams.get('stage') || undefined;
  const customerId = searchParams.get('customerId') || undefined;
  const cursor = searchParams.get('cursor') || undefined;
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  const result = await opportunityService.list(orgId, { q, stage, customerId, cursor, limit });

  return jsonOk(result);
});

const guardPost = compose(withRateLimit('api'), withIdempotencyRequired(), withTenantAuth());
export const POST = guardPost(async (req: NextRequest) => {
  const orgId = req.headers.get('x-org-id');
  const userId = req.headers.get('x-user-id');
  if (!orgId || !userId) return jsonError(401, 'Unauthorized', 'Missing auth context');

  const body = await req.json().catch(() => ({} as any));
  const v = validateOpportunityCreate(body);
  if (!v.ok) return jsonError(400, 'ValidationError', v.message);

  try {
    const result = await opportunityService.create(orgId, userId, body);

    return new NextResponse(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return jsonError(400, 'BadRequest', error.message);
  }
});

