// Minimal App Router middleware wrappers (no external deps)
// These provide a clean composition model for auth, rate limiting, and idempotency.
// TODO(sonnet): Wire to real implementations in src/middleware/* or upstream infra.

import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { jsonError } from '@/lib/api/response';
import { FED_ENABLED } from '@/lib/config/federation';

export type Handler = (req: NextRequest, ...args: any[]) => Promise<Response> | Response;

export type Wrapper = (h: Handler) => Handler;

export function compose(...wrappers: Wrapper[]): Wrapper {
  return (handler) => wrappers.reduceRight((acc, w) => w(acc), handler);
}

export const rateLimitPresets = {
  api: { windowMs: 60_000, max: 60 },
  auth: { windowMs: 60_000, max: 20 },
} as const;

export function withRateLimit(_preset: keyof typeof rateLimitPresets): Wrapper {
  return (handler) => async (req, ...args) => {
    // TODO(sonnet): Integrate real limiter (KV/Redis/Upstash) keyed by audience+token(or IP)+route.
    // - Read optional env overrides: RATE_LIMIT_API_PER_MINUTE, RATE_LIMIT_AUTH_PER_MINUTE
    // - On limit exceeded, return jsonError(429, 'RateLimited', 'Try again later')
    return handler(req, ...args);
  };
}

export function withIdempotencyRequired(): Wrapper {
  return (handler) => async (req, ...args) => {
    if (req.method === 'POST') {
      const idem = req.headers.get('idempotency-key');
      if (!idem) return jsonError(400, 'ValidationError', 'Idempotency-Key header required');
      // TODO(sonnet): Check and record idempotency key in durable store.
      // - Replay semantics: identical body -> replay response; different body -> 409 conflict
      // - TTL via IDEMPOTENCY_TTL_MINUTES; persist response envelope
    }
    return handler(req, ...args);
  };
}

export function withTenantAuth(): Wrapper {
  return (handler) => async (req, ...args) => {
    const jar = await cookies();
    const email = jar.get('rs_user')?.value || jar.get('mv_user')?.value;
    if (!email) return jsonError(401, 'Unauthorized', 'Sign in required');
    // TODO(sonnet): Load user + orgId and attach via request attribute or header for downstream usage
    return handler(req, ...args);
  };
}

export function withProviderAuth(): Wrapper {
  return (handler) => async (req, ...args) => {
    if (!FED_ENABLED) return jsonError(404, 'NotFound', 'Federation disabled');
    const jar = await cookies();
    const token = jar.get('rs_provider')?.value || jar.get('provider-session')?.value || jar.get('ws_provider')?.value;
    if (!token) return jsonError(401, 'Unauthorized', 'Provider sign in required');
    // TODO(sonnet): Resolve provider identity (env-based now; OIDC later)
    return handler(req, ...args);
  };
}

export function withDeveloperAuth(): Wrapper {
  return (handler) => async (req, ...args) => {
    if (!FED_ENABLED) return jsonError(404, 'NotFound', 'Federation disabled');
    const jar = await cookies();
    const token = jar.get('rs_developer')?.value || jar.get('developer-session')?.value || jar.get('ws_developer')?.value;
    if (!token) return jsonError(401, 'Unauthorized', 'Developer sign in required');
    // TODO(sonnet): Resolve developer identity (env-based now; OIDC later)
    return handler(req, ...args);
  };
}


// --- Testable helpers (pure) ---
export function isFederationEnabled() { return FED_ENABLED; }
export function extractProviderToken(getCookie: (name: string) => string | undefined) {
  return getCookie('rs_provider') || getCookie('provider-session') || getCookie('ws_provider');
}
export function extractDeveloperToken(getCookie: (name: string) => string | undefined) {
  return getCookie('rs_developer') || getCookie('developer-session') || getCookie('ws_developer');
}

