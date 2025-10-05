import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { jsonError, jsonOk } from '@/lib/api/response';

import { compose, withTenantAuth, withRateLimit } from '@/lib/api/middleware';

// Organizations collection (tenant audience)
// Acceptance (Sonnet):
// - GET: return the user's org (MVP: single org)

const guardGet = compose(withRateLimit('api'), withTenantAuth());
export const GET = guardGet(async (_req: NextRequest) => {
  // TODO(sonnet): fetch current user's org via Prisma
  return jsonOk({ items: [] });
});

