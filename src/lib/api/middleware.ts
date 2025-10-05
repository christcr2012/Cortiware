// Minimal App Router middleware wrappers (no external deps)
// These provide a clean composition model for auth, rate limiting, and idempotency.
// TODO(sonnet): Wire to real implementations in src/middleware/* or upstream infra.

import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { jsonError } from '@/lib/api/response';

export type Handler = (req: NextRequest) => Promise<Response> | Response;

export type Wrapper = (h: Handler) => Handler;

export function compose(...wrappers: Wrapper[]): Wrapper {
  return (handler) => wrappers.reduceRight((acc, w) => w(acc), handler);
}

export const rateLimitPresets = {
  api: { windowMs: 60_000, max: 60 },
  auth: { windowMs: 60_000, max: 20 },
} as const;

export function withRateLimit(_preset: keyof typeof rateLimitPresets): Wrapper {
  return (handler) => async (req) => {
    // Placeholder: No-op. Sonnet to connect to real limiter (KV/Redis/Upstash/etc.).
    return handler(req);
  };
}

export function withIdempotencyRequired(): Wrapper {
  return (handler) => async (req) => {
    if (req.method === 'POST') {
      const idem = req.headers.get('idempotency-key');
      if (!idem) return jsonError(400, 'ValidationError', 'Idempotency-Key header required');
      // TODO(sonnet): Check and record idempotency key in durable store
    }
    return handler(req);
  };
}

export function withTenantAuth(): Wrapper {
  return (handler) => async (req) => {
    const jar = await cookies();
    const email = jar.get('rs_user')?.value || jar.get('mv_user')?.value;
    if (!email) return jsonError(401, 'Unauthorized', 'Sign in required');
    // TODO(sonnet): Load user + orgId and attach via request attribute or header for downstream usage
    return handler(req);
  };
}

