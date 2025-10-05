// OIDC helper functions for federation authentication
// Used when FED_OIDC_ENABLED=true

import { FED_OIDC_ENABLED } from '@/lib/config/federation';

export type OIDCConfig = {
  issuer: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
};

export type OIDCSession = {
  sub: string; // Subject (user ID from IdP)
  email?: string;
  name?: string;
  roles?: string[];
  exp: number; // Expiration timestamp
};

export function getOIDCConfig(): OIDCConfig | null {
  if (!FED_OIDC_ENABLED) return null;

  const issuer = process.env.OIDC_PROVIDER_ISSUER;
  const clientId = process.env.OIDC_CLIENT_ID;
  const clientSecret = process.env.OIDC_CLIENT_SECRET;
  const redirectUri = process.env.OIDC_REDIRECT_URI;
  const scope = process.env.OIDC_SCOPE || 'openid profile email';

  if (!issuer || !clientId || !clientSecret || !redirectUri) {
    console.warn('[OIDC] FED_OIDC_ENABLED=true but OIDC config incomplete');
    return null;
  }

  return { issuer, clientId, clientSecret, redirectUri, scope };
}

// Placeholder for OIDC session validation
// In production, this would verify JWT signature and claims
export async function validateOIDCSession(token: string): Promise<OIDCSession | null> {
  if (!FED_OIDC_ENABLED) return null;

  try {
    // TODO: Implement JWT verification with IdP's public keys
    // For now, return null to fall back to env-based auth
    console.log('[OIDC] Session validation not yet implemented, token:', token.substring(0, 10) + '...');
    return null;
  } catch (error) {
    console.error('[OIDC] Session validation error:', error);
    return null;
  }
}

// Generate authorization URL for OIDC login flow
export function getOIDCAuthorizationUrl(state: string): string | null {
  const config = getOIDCConfig();
  if (!config) return null;

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scope,
    state,
  });

  return `${config.issuer}/authorize?${params.toString()}`;
}

