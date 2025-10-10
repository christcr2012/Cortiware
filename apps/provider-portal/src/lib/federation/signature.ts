import crypto from 'crypto';

/**
 * Generate HMAC-SHA256 signature
 * @param key - Secret key for HMAC
 * @param data - Data to sign
 * @returns Hex-encoded signature
 */
export function hmacSHA256(key: string, data: string): string {
  return crypto.createHmac('sha256', key).update(data).digest('hex');
}

/**
 * Constant-time string comparison to prevent timing attacks
 * @param a - First string
 * @param b - Second string
 * @returns True if strings are equal
 */
export function constantTimeEq(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Build string-to-sign for federation requests
 * Format: ${METHOD} ${PATH+QUERY} ${TIMESTAMP}
 * @param method - HTTP method (GET, POST, etc.)
 * @param pathWithQuery - Full path including query string
 * @param isoTs - ISO 8601 timestamp
 * @returns String to sign
 */
export function buildStringToSign(method: string, pathWithQuery: string, isoTs: string): string {
  return `${method} ${pathWithQuery} ${isoTs}`;
}

