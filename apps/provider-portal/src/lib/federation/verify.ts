import { NextRequest, NextResponse } from 'next/server';
import { hmacSHA256, constantTimeEq, buildStringToSign } from './signature';
import { rateLimit } from './ratelimit';
import { jsonError } from '@/lib/api/response';

const CLOCK_SKEW_SEC = parseInt(process.env.FEDERATION_CLOCK_SKEW_SEC || '300', 10);
const MAX_BODY_SIZE = 1_000_000; // 1MB

/**
 * Verify federation request signature and headers
 * @param req - Next.js request object
 * @returns NextResponse with error if verification fails, null if success
 */
export async function verifyFederationRequest(req: NextRequest): Promise<NextResponse | null> {
  // Extract required headers
  const keyId = req.headers.get('X-Provider-KeyId');
  const timestamp = req.headers.get('X-Provider-Timestamp');
  const signature = req.headers.get('X-Provider-Signature');
  const orgId = req.headers.get('X-Provider-Org');
  
  if (!keyId || !timestamp || !signature || !orgId) {
    return jsonError(401, 'missing_headers', 'Required federation headers missing');
  }
  
  // Validate timestamp (clock skew protection)
  const requestTime = new Date(timestamp).getTime();
  const now = Date.now();
  const skewMs = CLOCK_SKEW_SEC * 1000;
  
  if (isNaN(requestTime) || Math.abs(now - requestTime) > skewMs) {
    return jsonError(401, 'invalid_timestamp', 'Request timestamp outside acceptable window');
  }
  
  // Rate limit per org
  const rateLimited = await rateLimit(orgId, 100); // 100 req/min per org
  if (rateLimited) {
    return jsonError(429, 'rate_limit_exceeded', 'Too many requests', {
      headers: { 'Retry-After': '60' },
    });
  }
  
  // Get secret from environment (CLIENT_KEYS_JSON)
  const clientKeysJson = process.env.CLIENT_KEYS_JSON || '{}';
  let clientKeys: Record<string, string>;
  try {
    clientKeys = JSON.parse(clientKeysJson);
  } catch {
    console.error('Failed to parse CLIENT_KEYS_JSON');
    return jsonError(500, 'internal_error', 'Server configuration error');
  }
  
  const secret = clientKeys[keyId];
  if (!secret) {
    return jsonError(401, 'invalid_key', 'Unknown or invalid key ID');
  }
  
  // Build string to sign: ${METHOD} ${PATH+QUERY} ${TIMESTAMP}
  const url = new URL(req.url);
  const pathWithQuery = url.pathname + url.search;
  const stringToSign = buildStringToSign(req.method, pathWithQuery, timestamp);
  
  // Compute expected signature
  const expectedSig = `sha256:${hmacSHA256(secret, stringToSign)}`;
  
  // Constant-time comparison
  if (!constantTimeEq(signature, expectedSig)) {
    return jsonError(401, 'invalid_signature', 'Signature verification failed');
  }
  
  // Check body size (if present)
  const contentLength = req.headers.get('Content-Length');
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    return jsonError(413, 'payload_too_large', 'Request body exceeds 1MB limit');
  }
  
  // Verification successful
  return null;
}

