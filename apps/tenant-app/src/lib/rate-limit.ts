/**
 * Simple rate limiting for tenant-app
 * Phase 1: In-memory store
 * Phase 2: Redis/KV store
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
  lockoutUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMITS = {
  auth: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    lockoutMs: 30 * 60 * 1000, // 30 minutes
  },
  'auth-ticket': {
    maxAttempts: 10,
    windowMs: 60 * 1000, // 1 minute
    lockoutMs: 5 * 60 * 1000, // 5 minutes
  },
  'auth-emergency': {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    lockoutMs: 60 * 60 * 1000, // 1 hour
  },
};

export async function applyRateLimit(
  req: NextRequest,
  category: keyof typeof RATE_LIMITS = 'auth'
): Promise<NextResponse | null> {
  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const key = `${category}:${ipAddress}`;
  const config = RATE_LIMITS[category];
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  if (!entry) {
    entry = {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    };
    rateLimitStore.set(key, entry);
    return null;
  }

  // Check if in lockout period
  if (entry.lockoutUntil && entry.lockoutUntil > now) {
    const remainingMs = entry.lockoutUntil - now;
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${remainingMinutes} minutes.` },
      { status: 429 }
    );
  }

  // Reset if window expired
  if (now - entry.firstAttempt > config.windowMs) {
    entry.count = 1;
    entry.firstAttempt = now;
    entry.lastAttempt = now;
    delete entry.lockoutUntil;
    return null;
  }

  // Increment count
  entry.count++;
  entry.lastAttempt = now;

  // Check if exceeded
  if (entry.count > config.maxAttempts) {
    entry.lockoutUntil = now + config.lockoutMs;
    const lockoutMinutes = Math.ceil(config.lockoutMs / 60000);
    return NextResponse.json(
      { error: `Too many attempts. Locked out for ${lockoutMinutes} minutes.` },
      { status: 429 }
    );
  }

  return null;
}

export function resetRateLimit(ipAddress: string, category: keyof typeof RATE_LIMITS = 'auth'): void {
  const key = `${category}:${ipAddress}`;
  rateLimitStore.delete(key);
}

