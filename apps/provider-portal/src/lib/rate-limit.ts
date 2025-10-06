/**
 * Rate Limiting System
 * 
 * Prevents abuse by limiting the number of requests from a single IP address
 * within a time window. Uses in-memory storage for simplicity (can be upgraded
 * to Redis for production multi-server deployments).
 * 
 * Features:
 * - Progressive delays (1s, 2s, 5s, 10s, 30s)
 * - Account lockout after max attempts
 * - IP-based tracking
 * - Configurable limits per endpoint type
 */

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
  lockoutUntil?: number;
}

// In-memory store (upgrade to Redis for production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMITS = {
  auth: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    lockoutMs: 30 * 60 * 1000, // 30 minutes
  },
  api: {
    maxAttempts: 60,
    windowMs: 60 * 1000, // 1 minute
    lockoutMs: 5 * 60 * 1000, // 5 minutes
  },
  recovery: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    lockoutMs: 60 * 60 * 1000, // 1 hour
  },
};

// Progressive delay calculation
const PROGRESSIVE_DELAYS = [1000, 2000, 5000, 10000, 30000]; // ms

function getProgressiveDelay(attemptCount: number): number {
  const index = Math.min(attemptCount - 1, PROGRESSIVE_DELAYS.length - 1);
  return PROGRESSIVE_DELAYS[index];
}

/**
 * Check if a request should be rate limited
 * 
 * @param identifier - Unique identifier (usually IP address)
 * @param type - Type of rate limit ('auth', 'api', 'recovery')
 * @returns Object with allowed status and optional delay/lockout info
 */
export function checkRateLimit(
  identifier: string,
  type: keyof typeof RATE_LIMITS = 'auth'
): {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  delayMs?: number;
  lockedUntil?: Date;
  reason?: string;
} {
  const config = RATE_LIMITS[type];
  const now = Date.now();
  const key = `${type}:${identifier}`;

  // Get or create entry
  let entry = rateLimitStore.get(key);

  // Check if locked out
  if (entry?.lockoutUntil && entry.lockoutUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(entry.lockoutUntil),
      lockedUntil: new Date(entry.lockoutUntil),
      reason: 'Account temporarily locked due to too many attempts',
    };
  }

  // Reset if window expired
  if (!entry || now - entry.firstAttempt > config.windowMs) {
    entry = {
      count: 0,
      firstAttempt: now,
      lastAttempt: now,
    };
    rateLimitStore.set(key, entry);
  }

  // Check if limit exceeded
  if (entry.count >= config.maxAttempts) {
    // Lock out the account
    entry.lockoutUntil = now + config.lockoutMs;
    rateLimitStore.set(key, entry);

    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(entry.lockoutUntil),
      lockedUntil: new Date(entry.lockoutUntil),
      reason: `Too many attempts. Locked out for ${config.lockoutMs / 60000} minutes`,
    };
  }

  // Calculate progressive delay
  const delayMs = entry.count > 0 ? getProgressiveDelay(entry.count) : 0;

  // Increment count
  entry.count++;
  entry.lastAttempt = now;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: config.maxAttempts - entry.count,
    resetAt: new Date(entry.firstAttempt + config.windowMs),
    delayMs,
  };
}

/**
 * Reset rate limit for an identifier (e.g., after successful login)
 */
export function resetRateLimit(
  identifier: string,
  type: keyof typeof RATE_LIMITS = 'auth'
): void {
  const key = `${type}:${identifier}`;
  rateLimitStore.delete(key);
}

/**
 * Get current rate limit status without incrementing
 */
export function getRateLimitStatus(
  identifier: string,
  type: keyof typeof RATE_LIMITS = 'auth'
): {
  attempts: number;
  remaining: number;
  resetAt: Date;
  isLocked: boolean;
  lockedUntil?: Date;
} {
  const config = RATE_LIMITS[type];
  const now = Date.now();
  const key = `${type}:${identifier}`;

  const entry = rateLimitStore.get(key);

  if (!entry) {
    return {
      attempts: 0,
      remaining: config.maxAttempts,
      resetAt: new Date(now + config.windowMs),
      isLocked: false,
    };
  }

  const isLocked = !!(entry.lockoutUntil && entry.lockoutUntil > now);

  return {
    attempts: entry.count,
    remaining: Math.max(0, config.maxAttempts - entry.count),
    resetAt: new Date(entry.firstAttempt + config.windowMs),
    isLocked,
    lockedUntil: entry.lockoutUntil ? new Date(entry.lockoutUntil) : undefined,
  };
}

/**
 * Clean up expired entries (run periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  const maxAge = Math.max(
    RATE_LIMITS.auth.windowMs + RATE_LIMITS.auth.lockoutMs,
    RATE_LIMITS.api.windowMs + RATE_LIMITS.api.lockoutMs,
    RATE_LIMITS.recovery.windowMs + RATE_LIMITS.recovery.lockoutMs
  );

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.lastAttempt > maxAge) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}

/**
 * Middleware helper for Next.js API routes
 */
export async function applyRateLimit(
  request: Request,
  type: keyof typeof RATE_LIMITS = 'auth'
): Promise<Response | null> {
  // Get IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

  // Check rate limit
  const result = checkRateLimit(ip, type);

  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests',
        message: result.reason,
        lockedUntil: result.lockedUntil,
        resetAt: result.resetAt,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': result.lockedUntil
            ? Math.ceil((result.lockedUntil.getTime() - Date.now()) / 1000).toString()
            : '60',
        },
      }
    );
  }

  // Apply progressive delay if needed
  if (result.delayMs && result.delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, result.delayMs));
  }

  return null; // Allow request to proceed
}

