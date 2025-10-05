import { NextRequest } from 'next/server';
import { jsonOk } from '@/lib/api/response';
import { compose, withRateLimit, withProviderAuth } from '@/lib/api/middleware';

const guard = compose(withRateLimit('api'), withProviderAuth());

export const GET = guard(async (_req: NextRequest, ctx: { params: { id: string } }) => {
  // Placeholder details for a tenant
  const id = ctx?.params?.id ?? 'unknown';
  return jsonOk({ id, name: id === 't_001' ? 'Acme Homes' : 'Tenant ' + id, orgs: [] });
});

