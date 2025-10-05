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
};

export function withRateLimit(preset: keyof typeof rateLimitPresets): Wrapper {
  return (handler) => async (req, ...args) => {
    const { checkRateLimit, getRateLimitKey } = await import('@/lib/rate-limiter');

    // Get config with optional env overrides
    const config = { ...rateLimitPresets[preset] };
    if (preset === 'api' && process.env.RATE_LIMIT_API_PER_MINUTE) {
      config.max = parseInt(process.env.RATE_LIMIT_API_PER_MINUTE, 10);
    }
    if (preset === 'auth' && process.env.RATE_LIMIT_AUTH_PER_MINUTE) {
      config.max = parseInt(process.env.RATE_LIMIT_AUTH_PER_MINUTE, 10);
    }

    // Determine identifier (cookie token or IP)
    const jar = await cookies();
    const identifier =
      jar.get('rs_provider')?.value ||
      jar.get('rs_developer')?.value ||
      jar.get('rs_user')?.value ||
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      'unknown';

    const route = new URL(req.url).pathname;
    const key = getRateLimitKey(preset, identifier, route);
    const result = await checkRateLimit(key, config);

    if (!result.allowed) {
      return jsonError(429, 'RateLimited', 'Too many requests. Try again later.', {
        resetAt: new Date(result.resetAt).toISOString(),
      });
    }

    return handler(req, ...args);
  };
}

export function withIdempotencyRequired(): Wrapper {
  return (handler) => async (req, ...args) => {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      const idem = req.headers.get('idempotency-key');
      if (!idem) return jsonError(400, 'ValidationError', 'Idempotency-Key header required');

      const { checkIdempotency, recordIdempotency } = await import('@/lib/idempotency-store');
      const bodyText = await req.clone().text();

      const check = await checkIdempotency(idem, bodyText);

      if ('replay' in check && check.replay) {
        // Replay cached response
        return new Response(JSON.stringify(check.response.body), {
          status: check.response.status,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if ('conflict' in check && check.conflict) {
        // Different body with same key
        return jsonError(409, 'IdempotencyConflict', 'Idempotency key already used with different request body');
      }

      // Execute handler and record response
      const response = await handler(req, ...args);
      const responseClone = response.clone();
      const responseBody = await responseClone.json();
      await recordIdempotency(idem, bodyText, { status: response.status, body: responseBody });

      return response;
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

    // Attach provider identity to request (via header for downstream usage)
    const { getRoleFromToken } = await import('@/lib/entitlements');
    const role = getRoleFromToken(token);

    // Attach identity headers to existing request
    req.headers.set('x-federation-actor', token);
    req.headers.set('x-federation-role', role);

    return handler(req, ...args);
  };
}

export function withDeveloperAuth(): Wrapper {
  return (handler) => async (req, ...args) => {
    if (!FED_ENABLED) return jsonError(404, 'NotFound', 'Federation disabled');
    const jar = await cookies();
    const token = jar.get('rs_developer')?.value || jar.get('developer-session')?.value || jar.get('ws_developer')?.value;
    if (!token) return jsonError(401, 'Unauthorized', 'Developer sign in required');

    // Attach developer identity to request
    const { getRoleFromToken } = await import('@/lib/entitlements');
    const role = getRoleFromToken(token);

    req.headers.set('x-federation-actor', token);
    req.headers.set('x-federation-role', role);

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

