import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { jsonError, jsonOk } from '@/lib/api/response';

// Organizations collection (tenant audience)
// Acceptance (Sonnet):
// - GET: return the user's org (MVP: single org)

export async function GET(_req: NextRequest) {
  const jar = await cookies();
  const email = jar.get('rs_user')?.value || jar.get('mv_user')?.value;
  if (!email) return jsonError(401, 'Unauthorized', 'Sign in required');

  // TODO(sonnet): fetch current user's org via Prisma
  return jsonOk({ items: [] });
}

