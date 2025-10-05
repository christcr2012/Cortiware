import { NextRequest } from 'next/server';
import { jsonError, jsonOk } from '@/lib/api/response';
import { compose, withRateLimit, withProviderAuth } from '@/lib/api/middleware';
import { providerFederationService } from '@/services/federation/providers.service';

const guard = compose(withRateLimit('api'), withProviderAuth());

export const GET = guard(async (_req: NextRequest, ctx: { params: { id: string } }) => {
  const id = ctx?.params?.id ?? 'unknown';
  try {
    const item = await providerFederationService.getTenant(id);
    if (!item) return jsonError(404, 'NotFound', 'Tenant not found');
    return jsonOk(item);
  } catch (e) {
    return jsonError(501, 'NotImplemented', 'Provider tenant detail not implemented');
  }
});

