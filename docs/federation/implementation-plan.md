# Federation Implementation Plan

This plan translates the roadmap into concrete engineering steps with acceptance criteria and owner split (GPT‑5 vs Sonnet 4.5).

## 1) Middleware & Config (Week 0)
- Add wrappers: `withProviderAuth`, `withDeveloperAuth` in `src/lib/api/middleware.ts` (no‑op auth for now; env‑based)
- Config flags: `FED_ENABLED=true`, `FED_OIDC_ENABLED=false` to gate features
- Acceptance: typecheck green; wrappers imported without route churn

## 2) Route Namespaces (Week 1)
- Create `app/api/fed/providers/tenants/route.ts` (GET list)
- Create `app/api/fed/providers/tenants/[id]/route.ts` (GET detail)
- Create `app/api/fed/developers/diagnostics/route.ts` (GET)
- All routes composed with `withRateLimit('api'|'auth')`, `withProviderAuth|withDeveloperAuth`
- Acceptance: E2E smoke (401/429) passes; contract examples return placeholder data

## 3) Service Layer (Week 1–2)
- `src/services/federation/providers.service.ts` with methods: `listTenants`, `getTenant`
- `src/services/federation/developers.service.ts` with `getDiagnostics`
- Map to Prisma queries (Sonnet)
- Acceptance: Unit tests for services (mock Prisma) by Sonnet

## 4) Entitlements (Week 3)
- Define `Entitlement` model and `hasEntitlement(user, action, resource)` helper
- Check entitlements inside federation services before DB calls
- Acceptance: Unit tests for 403 cases

## 5) Audit & Idempotency (Week 3–4)
- Add `audit.log({ actor, action, resource, result })` stub
- Implement durable idempotency store (KV/Redis) behind `withIdempotencyRequired`
- Acceptance: Replay behavior verified; audit entries emitted

## 6) OIDC Readiness (Week 4–5)
- Extend `withProviderAuth`/`withDeveloperAuth` to read from OIDC session when `FED_OIDC_ENABLED=true`
- Update `.env.example` with IdP placeholders; docs for callback routes
- Acceptance: Dual‑mode works under feature flag

## 7) Cutover (Week 6)
- Turn on `FED_OIDC_ENABLED` in staging; dual‑run with env‑based
- Update runbooks; execute migration checklist
- Acceptance: UX smoke, contract diff, unit and E2E all green

## Deliverables & Owners
- GPT‑5: wrappers, route scaffolds, docs, test scaffolds
- Sonnet: Prisma services, OIDC integration, durable stores, tests

