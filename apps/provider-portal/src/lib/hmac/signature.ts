/**
 * HMAC Signature Verification
 * 
 * Per hmac-auth.md spec:
 * - Algorithm: HMAC-SHA256
 * - Canonical string format (newline-delimited):
 *   METHOD
 *   PATH_WITH_QUERY
 *   X-Provider-KeyId
 *   X-Provider-Timestamp
 *   X-Provider-Nonce
 *   SHA256(body) in hex (empty string for GET)
 * 
 * - Clock skew tolerance: ±5 minutes
 * - Signature format: base64(HMAC_SHA256(secret, canonicalString))
 */

import { createHmac, createHash } from 'crypto';

const CLOCK_SKEW_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Build canonical string for HMAC signature
 */
export function buildCanonicalString(params: {
  method: string;
  pathWithQuery: string;
  keyId: string;
  timestamp: string;
  nonce: string;
  bodyHash: string;
}): string {
  return [
    params.method,
    params.pathWithQuery,
    params.keyId,
    params.timestamp,
    params.nonce,
    params.bodyHash,
  ].join('\n');
}

/**
 * Compute HMAC-SHA256 signature
 */
export function computeSignature(secret: string, canonicalString: string): string {
  const hmac = createHmac('sha256', secret);
  hmac.update(canonicalString);
  return hmac.digest('base64');
}

/**
 * Hash request body with SHA-256
 */
export function hashBody(body: string): string {
  if (!body || body.length === 0) {
    return '';
  }
  return createHash('sha256').update(body, 'utf8').digest('hex');
}

/**
 * Verify HMAC signature
 */
export function verifySignature(params: {
  secret: string;
  method: string;
  pathWithQuery: string;
  keyId: string;
  timestamp: string;
  nonce: string;
  bodyHash: string;
  providedSignature: string;
}): boolean {
  const canonicalString = buildCanonicalString({
    method: params.method,
    pathWithQuery: params.pathWithQuery,
    keyId: params.keyId,
    timestamp: params.timestamp,
    nonce: params.nonce,
    bodyHash: params.bodyHash,
  });
  
  const expectedSignature = computeSignature(params.secret, canonicalString);
  
  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(expectedSignature, params.providedSignature);
}

/**
 * Timing-safe string comparison
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Validate timestamp (check clock skew)
 */
export function validateTimestamp(timestamp: string): { valid: boolean; error?: string } {
  let timestampMs: number;
  
  // Try parsing as ISO8601 first
  const isoDate = new Date(timestamp);
  if (!isNaN(isoDate.getTime())) {
    timestampMs = isoDate.getTime();
  } else {
    // Try parsing as unix epoch ms
    timestampMs = parseInt(timestamp, 10);
    if (isNaN(timestampMs)) {
      return { valid: false, error: 'Invalid timestamp format' };
    }
  }
  
  const now = Date.now();
  const diff = Math.abs(now - timestampMs);
  
  if (diff > CLOCK_SKEW_MS) {
    return {
      valid: false,
      error: `Clock skew too large: ${Math.floor(diff / 1000)}s (max ${CLOCK_SKEW_MS / 1000}s)`,
    };
  }
  
  return { valid: true };
}

/**
 * Extract required headers from request
 */
export function extractHmacHeaders(headers: Headers): {
  keyId: string | null;
  timestamp: string | null;
  nonce: string | null;
  signature: string | null;
  scope: string | null;
} {
  return {
    keyId: headers.get('x-provider-keyid'),
    timestamp: headers.get('x-provider-timestamp'),
    nonce: headers.get('x-provider-nonce'),
    signature: headers.get('x-provider-signature'),
    scope: headers.get('x-provider-scope'),
  };
}

/**
 * Validate all required HMAC headers are present
 */
export function validateRequiredHeaders(headers: {
  keyId: string | null;
  timestamp: string | null;
  nonce: string | null;
  signature: string | null;
  scope: string | null;
}): { valid: boolean; missing?: string[] } {
  const missing: string[] = [];
  
  if (!headers.keyId) missing.push('X-Provider-KeyId');
  if (!headers.timestamp) missing.push('X-Provider-Timestamp');
  if (!headers.nonce) missing.push('X-Provider-Nonce');
  if (!headers.signature) missing.push('X-Provider-Signature');
  if (!headers.scope) missing.push('X-Provider-Scope');
  
  if (missing.length > 0) {
    return { valid: false, missing };
  }
  
  return { valid: true };
}

