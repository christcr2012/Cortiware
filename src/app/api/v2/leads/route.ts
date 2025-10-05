import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { jsonError, jsonOk } from '@/lib/api/response';

// Leads collection route (tenant audience)
// Guardrails:
// - Rate limit: preset `api`
// - Idempotency: require `Idempotency-Key` for POST
// - Auth: require rs_user (accept legacy mv_user)
// Acceptance (Sonnet):
// - GET: return org-scoped list with pagination
// - POST: validate body, enforce dedupe per (orgId, email/phone), store idempotency

export async function GET(_req: NextRequest) {
  const jar = await cookies();
  const email = jar.get('rs_user')?.value || jar.get('mv_user')?.value;
  if (!email) return jsonError(401, 'Unauthorized', 'Sign in required');

  // TODO(sonnet): query Prisma for leads by orgId; support cursor+limit
  return jsonOk({ items: [], nextCursor: null });
}

export async function POST(req: NextRequest) {
  const jar = await cookies();
  const email = jar.get('rs_user')?.value || jar.get('mv_user')?.value;
  if (!email) return jsonError(401, 'Unauthorized', 'Sign in required');

  const idem = req.headers.get('idempotency-key');
  if (!idem) return jsonError(400, 'ValidationError', 'Idempotency-Key header required');

  const body = await req.json().catch(() => ({} as any));
  // TODO(sonnet): validate body (name required; contact optional)
  // TODO(sonnet): upsert by (orgId, normalizedEmail?) when dedupe is desired
  // TODO(sonnet): persist idempotency key

  return jsonError(501, 'NotImplemented', 'Leads creation not implemented yet');
}

