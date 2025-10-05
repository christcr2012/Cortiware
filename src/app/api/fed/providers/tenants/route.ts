import { NextRequest } from 'next/server';
import { jsonError, jsonOk } from '@/lib/api/response';
import { compose, withRateLimit, withProviderAuth } from '@/lib/api/middleware';
import { providerFederationService } from '@/services/federation/providers.service';
import type { FederationRole } from '@/lib/entitlements';

const guard = compose(withRateLimit('api'), withProviderAuth());

export const GET = guard(async (req: NextRequest) => {
  try {
    const actor = req.headers.get('x-federation-actor') || 'unknown';
    const role = (req.headers.get('x-federation-role') || 'provider-viewer') as FederationRole;

    const url = new URL(req.url);
    const cursor = url.searchParams.get('cursor') || undefined;
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!, 10) : undefined;

    const res = await providerFederationService.listTenants({ cursor, limit, actor, role });
    return jsonOk(res);
  } catch (e) {
    const error = e as Error;
    if (error.message.includes('Forbidden')) {
      return jsonError(403, 'Forbidden', error.message);
    }
    return jsonError(500, 'InternalError', 'Failed to list tenants');
  }
});

