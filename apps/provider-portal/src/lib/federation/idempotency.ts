import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

/**
 * Compute SHA256 hash of request body
 * @param buf - Request body buffer
 * @returns Hex-encoded hash
 */
export function bodyHash(buf: Buffer): string {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

/**
 * Read existing idempotent response or return null
 * @param key - Idempotency key from header
 * @param method - HTTP method
 * @param path - Request path
 * @param hash - Body hash
 * @param orgId - Organization ID
 * @returns Stored response JSON or null
 */
export async function readOrCreateIdempotent(
  key: string,
  method: string,
  path: string,
  hash: string,
  orgId: string
): Promise<any | null> {
  try {
    const existing = await prisma.idempotencyKey.findUnique({
      where: { key },
    });
    
    if (!existing) {
      return null;
    }
    
    // Verify method, path, bodyHash, orgId match
    if (
      existing.method === method &&
      existing.path === path &&
      existing.bodyHash === hash &&
      existing.orgId === orgId
    ) {
      // Check TTL
      const ageMs = Date.now() - existing.createdAt.getTime();
      if (ageMs < existing.ttl * 1000) {
        return existing.response;
      }
    }
    
    // Mismatch or expired - return null (will create new)
    return null;
  } catch (error) {
    console.error('Error reading idempotency key:', error);
    return null;
  }
}

/**
 * Save idempotent response
 * @param key - Idempotency key from header
 * @param method - HTTP method
 * @param path - Request path
 * @param hash - Body hash
 * @param orgId - Organization ID
 * @param response - Response JSON to store
 * @param ttlSec - Time-to-live in seconds (default 24 hours)
 */
export async function saveIdempotent(
  key: string,
  method: string,
  path: string,
  hash: string,
  orgId: string,
  response: any,
  ttlSec: number = 86400
): Promise<void> {
  try {
    await prisma.idempotencyKey.upsert({
      where: { key },
      create: {
        key,
        method,
        path,
        bodyHash: hash,
        orgId,
        response,
        ttl: ttlSec,
      },
      update: {
        response,
      },
    });
  } catch (error) {
    console.error('Error saving idempotency key:', error);
    // Non-fatal - continue
  }
}

