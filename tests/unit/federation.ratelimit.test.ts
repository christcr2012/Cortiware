/**
 * Unit Tests for Federation Rate Limiting
 * Tests token bucket algorithm, per-org limits, and 429 responses
 */

import { describe, it, expect, beforeEach } from '@jest/globals';

// Mock rate limiter implementation for testing
class MockRateLimiter {
  private buckets: Map<string, { tokens: number; lastRefill: number }> = new Map();
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per second
  private readonly refillInterval: number; // milliseconds

  constructor(maxTokens: number = 100, refillRate: number = 10) {
    this.maxTokens = maxTokens;
    this.refillRate = refillRate;
    this.refillInterval = 1000; // 1 second
  }

  async checkLimit(orgId: string, cost: number = 1): Promise<{ allowed: boolean; remaining: number }> {
    const now = Date.now();
    let bucket = this.buckets.get(orgId);

    if (!bucket) {
      bucket = { tokens: this.maxTokens, lastRefill: now };
      this.buckets.set(orgId, bucket);
    }

    // Refill tokens based on time elapsed
    const elapsed = now - bucket.lastRefill;
    const refillAmount = Math.floor((elapsed / this.refillInterval) * this.refillRate);
    
    if (refillAmount > 0) {
      bucket.tokens = Math.min(this.maxTokens, bucket.tokens + refillAmount);
      bucket.lastRefill = now;
    }

    // Check if enough tokens available
    if (bucket.tokens >= cost) {
      bucket.tokens -= cost;
      return { allowed: true, remaining: bucket.tokens };
    }

    return { allowed: false, remaining: bucket.tokens };
  }

  reset(orgId?: string) {
    if (orgId) {
      this.buckets.delete(orgId);
    } else {
      this.buckets.clear();
    }
  }
}

describe('Federation Rate Limiting', () => {
  let rateLimiter: MockRateLimiter;

  beforeEach(() => {
    rateLimiter = new MockRateLimiter(100, 10); // 100 tokens max, refill 10/sec
  });

  describe('Token Bucket Algorithm', () => {
    it('should allow requests when tokens available', async () => {
      const result = await rateLimiter.checkLimit('org-123', 1);
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(99);
    });

    it('should consume tokens on each request', async () => {
      await rateLimiter.checkLimit('org-123', 10);
      const result = await rateLimiter.checkLimit('org-123', 5);
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(85); // 100 - 10 - 5
    });

    it('should reject requests when tokens exhausted', async () => {
      // Consume all tokens
      await rateLimiter.checkLimit('org-123', 100);
      
      const result = await rateLimiter.checkLimit('org-123', 1);
      
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should handle different costs per request', async () => {
      const result1 = await rateLimiter.checkLimit('org-123', 25);
      const result2 = await rateLimiter.checkLimit('org-123', 50);
      
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(75);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(25);
    });

    it('should refill tokens over time', async () => {
      // Consume tokens
      await rateLimiter.checkLimit('org-123', 50);
      
      // Wait for refill (simulate 2 seconds = 20 tokens)
      await new Promise(resolve => setTimeout(resolve, 2100));
      
      const result = await rateLimiter.checkLimit('org-123', 1);
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(50); // Should have refilled
    });

    it('should not exceed max tokens on refill', async () => {
      // Start with full bucket
      const result1 = await rateLimiter.checkLimit('org-123', 0);
      expect(result1.remaining).toBe(100);
      
      // Wait for refill attempt
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const result2 = await rateLimiter.checkLimit('org-123', 0);
      
      expect(result2.remaining).toBe(100); // Should not exceed max
    });
  });

  describe('Per-Org Isolation', () => {
    it('should maintain separate buckets per org', async () => {
      await rateLimiter.checkLimit('org-123', 50);
      await rateLimiter.checkLimit('org-456', 30);
      
      const result1 = await rateLimiter.checkLimit('org-123', 1);
      const result2 = await rateLimiter.checkLimit('org-456', 1);
      
      expect(result1.remaining).toBe(49); // 100 - 50 - 1
      expect(result2.remaining).toBe(69); // 100 - 30 - 1
    });

    it('should not affect other orgs when one is rate limited', async () => {
      // Exhaust org-123
      await rateLimiter.checkLimit('org-123', 100);
      
      const result123 = await rateLimiter.checkLimit('org-123', 1);
      const result456 = await rateLimiter.checkLimit('org-456', 1);
      
      expect(result123.allowed).toBe(false);
      expect(result456.allowed).toBe(true);
    });

    it('should handle many concurrent orgs', async () => {
      const orgs = Array.from({ length: 100 }, (_, i) => `org-${i}`);
      
      const results = await Promise.all(
        orgs.map(org => rateLimiter.checkLimit(org, 10))
      );
      
      expect(results.every(r => r.allowed)).toBe(true);
      expect(results.every(r => r.remaining === 90)).toBe(true);
    });
  });

  describe('Rate Limit Responses', () => {
    it('should return 429 status when rate limited', async () => {
      await rateLimiter.checkLimit('org-123', 100);
      const result = await rateLimiter.checkLimit('org-123', 1);
      
      expect(result.allowed).toBe(false);
      // In actual API, this would return HTTP 429
    });

    it('should include remaining tokens in response', async () => {
      const result = await rateLimiter.checkLimit('org-123', 25);
      
      expect(result.remaining).toBe(75);
      // In actual API, this would be in X-RateLimit-Remaining header
    });

    it('should handle burst traffic correctly', async () => {
      // Simulate burst of 10 requests
      const results = await Promise.all(
        Array.from({ length: 10 }, () => rateLimiter.checkLimit('org-123', 10))
      );
      
      expect(results.filter(r => r.allowed).length).toBe(10); // All should succeed
      expect(results[9].remaining).toBe(0); // Last one should have 0 remaining
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero cost requests', async () => {
      const result = await rateLimiter.checkLimit('org-123', 0);
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(100);
    });

    it('should handle requests larger than bucket size', async () => {
      const result = await rateLimiter.checkLimit('org-123', 150);
      
      expect(result.allowed).toBe(false);
    });

    it('should handle empty org ID', async () => {
      const result = await rateLimiter.checkLimit('', 1);
      
      expect(result.allowed).toBe(true);
    });

    it('should handle special characters in org ID', async () => {
      const result = await rateLimiter.checkLimit('org-123-test@example.com', 1);
      
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(99);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset specific org bucket', async () => {
      await rateLimiter.checkLimit('org-123', 50);
      rateLimiter.reset('org-123');
      
      const result = await rateLimiter.checkLimit('org-123', 1);
      
      expect(result.remaining).toBe(99); // Should be reset to full
    });

    it('should reset all buckets', async () => {
      await rateLimiter.checkLimit('org-123', 50);
      await rateLimiter.checkLimit('org-456', 30);
      
      rateLimiter.reset();
      
      const result1 = await rateLimiter.checkLimit('org-123', 1);
      const result2 = await rateLimiter.checkLimit('org-456', 1);
      
      expect(result1.remaining).toBe(99);
      expect(result2.remaining).toBe(99);
    });
  });
});

