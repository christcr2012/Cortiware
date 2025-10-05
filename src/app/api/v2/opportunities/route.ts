import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { jsonError, jsonOk } from '@/lib/api/response';

// Opportunities collection (tenant audience)
// Guardrails:
// - Rate limit: preset `api`
// - Idempotency: require `Idempotency-Key` for POST

export async function GET(_req: NextRequest) {
  const jar = await cookies();
  const email = jar.get('rs_user')?.value || jar.get('mv_user')?.value;
  if (!email) return jsonError(401, 'Unauthorized', 'Sign in required');

  // TODO(sonnet): query Prisma for opportunities by orgId; support cursor+limit
  return jsonOk({ items: [], nextCursor: null });
}

export async function POST(req: NextRequest) {
  const jar = await cookies();
  const email = jar.get('rs_user')?.value || jar.get('mv_user')?.value;
  if (!email) return jsonError(401, 'Unauthorized', 'Sign in required');

  const idem = req.headers.get('idempotency-key');
  if (!idem) return jsonError(400, 'ValidationError', 'Idempotency-Key header required');

  const body = await req.json().catch(() => ({} as any));
  // TODO(sonnet): validate body (stage enum, amount number)
  // TODO(sonnet): persist, return 201 with id

  return jsonError(501, 'NotImplemented', 'Opportunities creation not implemented yet');
}

