// Entitlements model for federation access control
// Defines what actions provider/developer users can perform

export type FederationRole = 'provider-admin' | 'provider-viewer' | 'developer';

export type FederationAction =
  | 'tenants:list'
  | 'tenants:read'
  | 'tenants:write'
  | 'diagnostics:read'
  | 'audit:read';

type EntitlementMatrix = Record<FederationRole, FederationAction[]>;

const ENTITLEMENTS: EntitlementMatrix = {
  'provider-admin': [
    'tenants:list',
    'tenants:read',
    'tenants:write',
    'audit:read',
  ],
  'provider-viewer': [
    'tenants:list',
    'tenants:read',
  ],
  'developer': [
    'diagnostics:read',
    'audit:read',
  ],
};

export function hasEntitlement(role: FederationRole, action: FederationAction): boolean {
  return ENTITLEMENTS[role]?.includes(action) ?? false;
}

export function checkEntitlement(role: FederationRole, action: FederationAction): void {
  if (!hasEntitlement(role, action)) {
    throw new Error(`Forbidden: ${role} does not have permission for ${action}`);
  }
}

// For now, we'll use a simple env-based role mapping
// TODO: Replace with OIDC claims when FED_OIDC_ENABLED=true
export function getRoleFromToken(token: string): FederationRole {
  // Simple mapping for dev/test
  if (token === 'dev-provider' || token.startsWith('provider-')) {
    return 'provider-admin';
  }
  if (token === 'dev-developer' || token.startsWith('developer-')) {
    return 'developer';
  }
  return 'provider-viewer'; // Default fallback
}

