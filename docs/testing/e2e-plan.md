# End-to-End Testing Plan (Playwright or Cypress)

This plan focuses on high-signal flows to validate auth, listing, and creation for v2 APIs and the App Router, plus negative and guardrail cases (401/409/429).

## 1) Framework & Setup
- Preferred: Playwright (auto-waiting, trace viewer), alt: Cypress
- Environments: local dev (http://localhost:5000 or 5001)
- Test data: seed minimal users/orgs with scripts/seed.cjs (non-destructive, idempotent)
- Auth helpers: programmatic cookie set for `rs_user` (tenant), plus legacy `mv_user` fallback tests

## 2) Smoke: Health & Navigation
- App root loads without 500s
- Login screen renders for unauthenticated user; authenticated redirects to dashboard

## 3) Tenant Login Flows
- Success: valid tenant cookie set (rs_user), verify protected page accessible
- Legacy cookie: set `mv_user`, verify still accepted (migration path)
- Negative 401: clear cookies, attempt to access protected page → expect 401 JSON { ok:false, error.code: 'Unauthorized' }

## 4) Leads: List & Create
- GET /api/v2/leads
  - Authenticated: returns { ok:true, data.items:[], data.nextCursor:null } (placeholder until Prisma)
  - Unauthenticated: 401
- POST /api/v2/leads
  - Missing Idempotency-Key → 400 ValidationError
  - With Idempotency-Key and valid body { name, contact? } → expect 501 for now (until Sonnet implements)
  - Validation: body missing name → 400 ValidationError

## 5) Opportunities: List & Create
- GET /api/v2/opportunities
  - Authenticated: returns empty list placeholder
  - Unauthenticated: 401
- POST /api/v2/opportunities
  - Missing Idempotency-Key → 400 ValidationError
  - Invalid stage/amount/closeDate → 400 ValidationError
  - Valid body → 501 (until implemented)

## 6) Organizations: Current Org
- GET /api/v2/organizations
  - Authenticated: returns empty items placeholder
  - Unauthenticated: 401

## 7) Guardrails & Negative Cases
- 401 Unauthorized: Missing tenant cookie on protected endpoints
- 400 ValidationError: Invalid body or missing Idempotency-Key
- 409 Conflict (future): Duplicate create (dedupe by org + email/phone) once service implemented
- 429 Too Many Requests (future): Rate limit presets (api/auth) once limiter wired

## 8) Stability & Idempotency (future-ready)
- Repeat POST /leads with same Idempotency-Key → same result (created or replay)
- Change body but reuse Idempotency-Key → 409 conflict per RFC-Idempotency best practices

## 9) Artifacts & CI
- Enable tracing/videos on failure (Playwright trace)
- Run in CI on PRs: smoke + quick negative cases
- Optional nightly: extended rate-limit and idempotency scenarios

