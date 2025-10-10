/**
 * Rate limiting for federation API
 * Uses Redis if RATE_LIMIT_REDIS_URL is set, otherwise in-memory (dev only)
 */

// In-memory store for development (not suitable for production multi-instance)
const memoryStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Rate limit check using token bucket algorithm
 * @param key - Unique key for rate limiting (e.g., orgId)
 * @param limitPerMin - Maximum requests per minute
 * @returns True if rate limit exceeded
 */
export async function rateLimit(key: string, limitPerMin: number): Promise<boolean> {
  const redisUrl = process.env.RATE_LIMIT_REDIS_URL;
  
  if (redisUrl) {
    // TODO: Implement Redis-backed rate limiting for production
    // For now, fall through to in-memory
    console.warn('Redis rate limiting not yet implemented, using in-memory fallback');
  }
  
  // In-memory implementation (dev only)
  const now = Date.now();
  const windowMs = 60_000; // 1 minute
  const bucket = memoryStore.get(key);
  
  if (!bucket || now > bucket.resetAt) {
    // New window
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  
  if (bucket.count >= limitPerMin) {
    // Rate limit exceeded
    return true;
  }
  
  // Increment counter
  bucket.count++;
  return false;
}

/**
 * Clean up expired entries from in-memory store (call periodically)
 */
export function cleanupMemoryStore(): void {
  const now = Date.now();
  for (const [key, bucket] of memoryStore.entries()) {
    if (now > bucket.resetAt) {
      memoryStore.delete(key);
    }
  }
}

// Auto-cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupMemoryStore, 5 * 60 * 1000);
}

