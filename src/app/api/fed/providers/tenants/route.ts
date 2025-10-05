import { NextRequest } from 'next/server';
import { jsonOk } from '@/lib/api/response';
import { compose, withRateLimit, withProviderAuth } from '@/lib/api/middleware';

const guard = compose(withRateLimit('api'), withProviderAuth());

export const GET = guard(async (_req: NextRequest) => {
  // Placeholder provider view of tenants
  return jsonOk({ items: [{ id: 't_001', name: 'Acme Homes' }], nextCursor: null });
});

