/**
 * Rate limiting for federation API using Redis
 * Implements token bucket algorithm with Redis INCR and EXPIRE
 */

import { getRedis } from '../redis';

/**
 * Rate limit check using token bucket algorithm with Redis
 * @param key - Unique key for rate limiting (e.g., orgId)
 * @param limitPerMin - Maximum requests per minute
 * @returns True if rate limit exceeded
 */
export async function rateLimit(key: string, limitPerMin: number): Promise<boolean> {
  const redis = getRedis();

  if (!redis) {
    // Redis not configured - fail open (allow request) with warning
    console.warn('Redis not configured for rate limiting - allowing request');
    return false;
  }

  const redisKey = `ratelimit:federation:${key}`;
  const windowSeconds = 60; // 1 minute window

  try {
    // Use Redis INCR to atomically increment counter
    const count = await redis.incr(redisKey);

    // Set expiration on first request in window
    if (count === 1) {
      await redis.expire(redisKey, windowSeconds);
    }

    // Check if limit exceeded
    if (count > limitPerMin) {
      return true; // Rate limit exceeded
    }

    return false; // Within limit
  } catch (error) {
    // Redis error - fail open (allow request) to prevent blocking legitimate traffic
    console.error('Redis rate limit error:', error);
    return false;
  }
}

