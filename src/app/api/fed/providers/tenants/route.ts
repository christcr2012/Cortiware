import { NextRequest } from 'next/server';
import { jsonError, jsonOk } from '@/lib/api/response';
import { compose, withRateLimit, withProviderAuth } from '@/lib/api/middleware';
import { providerFederationService } from '@/services/federation/providers.service';

const guard = compose(withRateLimit('api'), withProviderAuth());

export const GET = guard(async (_req: NextRequest) => {
  try {
    const res = await providerFederationService.listTenants({});
    return jsonOk(res);
  } catch (e) {
    return jsonError(501, 'NotImplemented', 'Provider tenants listing not implemented');
  }
});

