import { NextRequest } from 'next/server';
import { jsonOk, jsonError } from '@/lib/api/response';
import { compose, withProviderAuth } from '@/lib/api/middleware';

// Mock OIDC config
let oidcConfig = {
  enabled: false,
  issuer: '',
  clientId: '',
  clientSecret: '',
  redirectUri: ''
};

const getHandler = async (req: NextRequest) => {
  try {
    return jsonOk({ config: oidcConfig });
  } catch (error) {
    console.error('Error getting OIDC config:', error);
    return jsonError(500, 'internal_error', 'Failed to get OIDC config');
  }
};

const patchHandler = async (req: NextRequest) => {
  try {
    const body = await req.json();
    oidcConfig = { ...oidcConfig, ...body };
    return jsonOk({ config: oidcConfig });
  } catch (error) {
    console.error('Error updating OIDC config:', error);
    return jsonError(500, 'internal_error', 'Failed to update OIDC config');
  }
};

export const GET = compose(withProviderAuth())(getHandler);
export const PATCH = compose(withProviderAuth())(patchHandler);

