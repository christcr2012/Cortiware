/**
 * Rate Limiter - Token Bucket Algorithm
 *
 * Current: In-memory store (single instance)
 * Production: Redis/Vercel KV for multi-instance deployments
 *
 * Per GUARDRAILS_INFRA.md:
 * - Presets: AUTH (10s/20), API (60s/100), ANALYTICS (600s/1000)
 * - Headers: Retry-After, X-RateLimit-Remaining, X-RateLimit-Reset
 * - Key format: ${ip}|${keyId}|${route}
 */

export type RateLimitConfig = {
  windowMs: number;
  max: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

// In-memory store (TODO: Replace with Redis/Vercel KV)
const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Check rate limit using token bucket algorithm
 *
 * @param key - Rate limit key (format: ${ip}|${keyId}|${route})
 * @param config - Rate limit configuration
 * @returns Rate limit result with allowed status, remaining tokens, and reset time
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    // New window - initialize with first request
    const resetAt = now + config.windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: config.max - 1,
      resetAt,
      limit: config.max,
    };
  }

  if (entry.count >= config.max) {
    // Limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      limit: config.max,
    };
  }

  // Increment count (consume token)
  entry.count++;
  store.set(key, entry);
  return {
    allowed: true,
    remaining: config.max - entry.count,
    resetAt: entry.resetAt,
    limit: config.max,
  };
}

/**
 * Generate rate limit key
 *
 * Format per GUARDRAILS_INFRA.md: ${ip}|${keyId}|${route}
 *
 * @param audience - Audience/preset identifier (auth, api, analytics)
 * @param identifier - User/IP identifier
 * @param route - API route path
 * @returns Formatted rate limit key
 */
export function getRateLimitKey(audience: string, identifier: string, route: string): string {
  return `rate:${audience}:${identifier}:${route}`;
}

/**
 * Get rate limit headers for response
 *
 * Per GUARDRAILS_INFRA.md:
 * - X-RateLimit-Limit: Maximum requests allowed
 * - X-RateLimit-Remaining: Remaining requests in window
 * - X-RateLimit-Reset: Unix timestamp when limit resets
 * - Retry-After: Seconds until reset (only on 429)
 *
 * @param result - Rate limit result
 * @returns Headers object
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.floor(result.resetAt / 1000).toString(),
  };

  if (!result.allowed) {
    const retryAfterSeconds = Math.ceil((result.resetAt - Date.now()) / 1000);
    headers['Retry-After'] = retryAfterSeconds.toString();
  }

  return headers;
}

