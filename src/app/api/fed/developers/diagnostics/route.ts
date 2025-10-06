import { NextRequest } from 'next/server';
import { jsonError, jsonOk } from '@/lib/api/response';
import { compose, withRateLimit, withDeveloperAuth } from '@/lib/api/middleware';
import { developerFederationService } from '@/services/federation/developers.service';

const guard = compose(withRateLimit('auth'), withDeveloperAuth());

export const GET = guard(async (_req: NextRequest) => {
  try {
    const data = await developerFederationService.getDiagnostics();
    return jsonOk(data);
  } catch (e) {
    const error = e as Error;
    return jsonError(500, 'InternalError', error.message || 'Failed to get diagnostics');
  }
});

