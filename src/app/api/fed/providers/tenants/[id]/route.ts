import { NextRequest } from 'next/server';
import { jsonError, jsonOk } from '@/lib/api/response';
import { compose, withRateLimit, withProviderAuth } from '@/lib/api/middleware';
import { providerFederationService } from '@/services/federation/providers.service';
import type { FederationRole } from '@/lib/entitlements';

const guard = compose(withRateLimit('api'), withProviderAuth());

export const GET = guard(async (req: NextRequest, ctx: { params: { id: string } }) => {
  const id = ctx?.params?.id ?? 'unknown';
  try {
    const actor = req.headers.get('x-federation-actor') || 'unknown';
    const role = (req.headers.get('x-federation-role') || 'provider-viewer') as FederationRole;

    const item = await providerFederationService.getTenant(id, actor, role);
    if (!item) return jsonError(404, 'NotFound', 'Tenant not found');
    return jsonOk(item);
  } catch (e) {
    const error = e as Error;
    if (error.message.includes('Forbidden')) {
      return jsonError(403, 'Forbidden', error.message);
    }
    return jsonError(500, 'InternalError', 'Failed to get tenant');
  }
});

