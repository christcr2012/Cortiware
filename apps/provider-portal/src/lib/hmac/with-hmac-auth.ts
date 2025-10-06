/**
 * withHmacAuth Middleware Wrapper
 * 
 * Per hmac-auth.md and WRAPPERS_SPEC.md:
 * - Validates HMAC signature using HMAC-SHA256
 * - Enforces anti-replay with nonce store (10min TTL)
 * - Validates clock skew (±5min)
 * - Checks scope and org constraints
 * - Returns 401/403 on failure
 * 
 * Composition order (from WRAPPERS_SPEC):
 * withRateLimit → withIdempotencyRequired → withHmacAuth → handler
 */

import type { NextRequest } from 'next/server';
import { jsonError } from '@/lib/api/response';
import type { Wrapper } from '@/lib/api/middleware';
import { getApiKey, hasScope, isValidForOrg } from './key-store';
import { checkNonce } from './nonce-store';
import {
  extractHmacHeaders,
  validateRequiredHeaders,
  validateTimestamp,
  verifySignature,
  hashBody,
} from './signature';

/**
 * HMAC Authentication Wrapper
 * 
 * Usage:
 * export const POST = compose(
 *   withRateLimit('api'),
 *   withIdempotencyRequired(),
 *   withHmacAuth(),
 * )(handler);
 */
export function withHmacAuth(): Wrapper {
  return (handler) => async (req: NextRequest, ...args) => {
    // Extract HMAC headers
    const hmacHeaders = extractHmacHeaders(req.headers);
    
    // Validate all required headers are present
    const headerValidation = validateRequiredHeaders(hmacHeaders);
    if (!headerValidation.valid) {
      return jsonError(401, 'Unauthorized', `Missing required headers: ${headerValidation.missing?.join(', ')}`);
    }
    
    // Type assertion after validation
    const keyId = hmacHeaders.keyId!;
    const timestamp = hmacHeaders.timestamp!;
    const nonce = hmacHeaders.nonce!;
    const signature = hmacHeaders.signature!;
    const scope = hmacHeaders.scope!;
    
    // Validate timestamp (clock skew check)
    const timestampValidation = validateTimestamp(timestamp);
    if (!timestampValidation.valid) {
      return jsonError(401, 'Unauthorized', timestampValidation.error || 'Invalid timestamp');
    }
    
    // Check nonce for replay attack
    const nonceValid = await checkNonce(keyId, nonce);
    if (!nonceValid) {
      return jsonError(401, 'Unauthorized', 'Nonce already used (replay attack detected)');
    }
    
    // Get API key from store
    const apiKey = await getApiKey(keyId);
    if (!apiKey) {
      return jsonError(401, 'Unauthorized', 'Invalid API key');
    }
    
    if (!apiKey.isActive) {
      return jsonError(403, 'Forbidden', 'API key has been revoked');
    }
    
    // Check scope
    if (!hasScope(apiKey, scope)) {
      return jsonError(403, 'Forbidden', `Insufficient scope: ${scope}`);
    }
    
    // Get request body and compute hash
    const bodyText = await req.clone().text();
    const bodyHash = hashBody(bodyText);
    
    // Build path with query
    const url = new URL(req.url);
    const pathWithQuery = url.pathname + url.search;
    
    // Verify signature
    // Note: In production, we'd fetch the actual secret from secure storage
    // For now, we'll use a test secret from env
    const secret = process.env.TEST_PROVIDER_SECRET || 'test-secret-key-do-not-use-in-production';
    
    const signatureValid = verifySignature({
      secret,
      method: req.method,
      pathWithQuery,
      keyId,
      timestamp,
      nonce,
      bodyHash,
      providedSignature: signature,
    });
    
    if (!signatureValid) {
      return jsonError(401, 'Unauthorized', 'Invalid signature');
    }
    
    // Check org constraint if present in request
    // Extract orgId from body or query params
    let orgId: string | undefined;
    try {
      if (bodyText) {
        const body = JSON.parse(bodyText);
        orgId = body.orgId;
      }
    } catch {
      // Body not JSON or no orgId
    }
    
    if (!orgId) {
      orgId = url.searchParams.get('orgId') || undefined;
    }
    
    if (orgId && !isValidForOrg(apiKey, orgId)) {
      return jsonError(403, 'Forbidden', 'API key not valid for this organization');
    }
    
    // Attach authentication context to request headers for downstream use
    req.headers.set('x-hmac-keyid', keyId);
    req.headers.set('x-hmac-scope', scope);
    if (orgId) {
      req.headers.set('x-hmac-orgid', orgId);
    }
    
    // Call handler
    return handler(req, ...args);
  };
}

