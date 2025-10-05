# Middleware Glue Guidance (App Router)

Provide thin wrappers for auth, rate limit, and idempotency in App Router handlers without coupling to NextApi types. These wrappers are defined in `src/lib/api/middleware.ts`.

## Presets and Wrappers
- `withTenantAuth()` → ensures tenant cookie (`rs_user` or legacy `mv_user`) is present; returns 401 otherwise
- `withIdempotencyRequired()` → enforces `Idempotency-Key` header on POST
- `withRateLimit('api'|'auth')` → placeholder; Sonnet to wire to real limiter
- `compose(...wrappers)` → functional composition helper

## Example Usage in a Route
```ts
import { compose, withTenantAuth, withIdempotencyRequired, withRateLimit } from '@/lib/api/middleware';
import { jsonOk } from '@/lib/api/response';

const guard = compose(
  withRateLimit('api'),
  withIdempotencyRequired(),
  withTenantAuth(),
);

export const POST = guard(async (req) => {
  // body parsing + service call here
  return jsonOk({ created: true }, { status: 201 });
});
```

## Notes
- Keep business logic in service layer (`src/services/*`) to reduce coupling
- Return using `jsonOk/jsonError` for consistent envelope
- As Sonnet implements real guards, swap internals of wrappers without touching routes

