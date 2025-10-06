/**
 * HMAC Key Store
 * 
 * Manages provider API keys for HMAC authentication.
 * Keys are stored with hashed secrets for security.
 * 
 * Per hmac-auth.md spec:
 * - Keys identified by keyId (e.g., "provider_abc123")
 * - Secrets are hashed and never logged
 * - Keys can be revoked
 * - Keys have associated scopes and org constraints
 */

import { createHash } from 'crypto';

export interface ApiKey {
  keyId: string;
  secretHash: string; // SHA-256 hash of the secret
  orgId?: string; // Optional org constraint
  scopes: string[]; // e.g., ["federation:escalation:create", "federation:billing:read"]
  isActive: boolean;
  createdAt: Date;
  revokedAt?: Date;
}

// In-memory store for development
// TODO(production): Replace with database or secure key management service
const keyStore = new Map<string, ApiKey>();

/**
 * Initialize with test keys for development
 */
export function initializeTestKeys() {
  // Test provider key
  const testSecret = process.env.TEST_PROVIDER_SECRET || 'test-secret-key-do-not-use-in-production';
  const testKeyId = 'provider_test_001';
  
  keyStore.set(testKeyId, {
    keyId: testKeyId,
    secretHash: hashSecret(testSecret),
    scopes: [
      'federation:escalation:create',
      'federation:billing:read',
      'federation:billing:create',
      'federation:status:read',
      'federation:analytics:read',
    ],
    isActive: true,
    createdAt: new Date(),
  });
}

/**
 * Hash a secret using SHA-256
 */
export function hashSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

/**
 * Get API key by keyId
 */
export async function getApiKey(keyId: string): Promise<ApiKey | null> {
  // Initialize test keys if store is empty (dev mode)
  if (keyStore.size === 0 && process.env.NODE_ENV !== 'production') {
    initializeTestKeys();
  }
  
  return keyStore.get(keyId) || null;
}

/**
 * Verify a secret against a stored key
 */
export async function verifySecret(keyId: string, secret: string): Promise<boolean> {
  const key = await getApiKey(keyId);
  if (!key || !key.isActive) {
    return false;
  }
  
  const providedHash = hashSecret(secret);
  return providedHash === key.secretHash;
}

/**
 * Check if a key has a specific scope
 */
export function hasScope(key: ApiKey, requiredScope: string): boolean {
  return key.scopes.includes(requiredScope);
}

/**
 * Check if a key is valid for a specific org
 */
export function isValidForOrg(key: ApiKey, orgId: string): boolean {
  // If key has no org constraint, it's valid for all orgs
  if (!key.orgId) {
    return true;
  }
  
  return key.orgId === orgId;
}

/**
 * Create a new API key (for admin/provider portal use)
 */
export async function createApiKey(params: {
  keyId: string;
  secret: string;
  orgId?: string;
  scopes: string[];
}): Promise<ApiKey> {
  const key: ApiKey = {
    keyId: params.keyId,
    secretHash: hashSecret(params.secret),
    orgId: params.orgId,
    scopes: params.scopes,
    isActive: true,
    createdAt: new Date(),
  };
  
  keyStore.set(params.keyId, key);
  return key;
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(keyId: string): Promise<boolean> {
  const key = keyStore.get(keyId);
  if (!key) {
    return false;
  }
  
  key.isActive = false;
  key.revokedAt = new Date();
  return true;
}

/**
 * List all API keys (for admin portal)
 */
export async function listApiKeys(): Promise<ApiKey[]> {
  return Array.from(keyStore.values());
}

