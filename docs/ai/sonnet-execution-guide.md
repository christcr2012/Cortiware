# Sonnet 4.5 Execution Guide (Federation)

This guide lists everything Sonnet should implement now that GPT‑5 has scaffolded contracts, routes, wrappers, tests, and plans.

## Quick Start
1) Read docs/federation/* to understand scope (overview, build-plan, roadmap, hosting, integration, CI/CD, migration)
2) Implement items below in order. Keep PRs small and green. Update docs as needed.

## Work Items (ordered)
- Services (Prisma)
  - Implement providerFederationService.listTenants/getTenant
  - Implement developerFederationService.getDiagnostics
  - Files:
    - src/services/federation/providers.service.ts
    - src/services/federation/developers.service.ts
  - Acceptance: Unit tests added; routes return 200 (no longer 501)

- Guardrails Infra
  - Rate limiting (withRateLimit): wire KV/Redis/Upstash
  - Durable idempotency store (withIdempotencyRequired)
  - Acceptance: Negative test coverage (429; idempotency replay)

- Entitlements & Audit
  - Define entitlement model; enforcement in services before DB calls
  - Persist audit logs for federation actions (redacting sensitive fields)
  - Acceptance: 403/401 coverage; audit entries visible (simple query or log)

- OIDC Readiness + Cutover
  - FED_OIDC_ENABLEDGate: in withProviderAuth/withDeveloperAuth read OIDC sessions
  - Add IdP callbacks and docs; update .env.example
  - Acceptance: Dual‑mode works with flag; docs updated

- Contracts & E2E
  - Update federation contract docs with fields returned by services
  - Extend E2E smoke to require 200s; move to CI workflow input against Preview env

## Dev Practices
- Contract-first: modify docs under docs/federation and docs/api/* before code
- Keep envelope stable: { ok, data | error }
- Add TODO(sonnet) comments where helpful; avoid TODO debt after merge
- Tests first where possible (services mocked Prisma, wrappers unit)

## Running Locally
- Enable federation: set FED_ENABLED=true in .env.local
- Dev server: npm run dev (http://localhost:5000)
- Unit tests: npm run test:unit
- E2E smoke (requires server): npm run test:e2e (see docs/federation/e2e-smoke-howto.md)

## CI
- CI runs tsc, lint, unit, and contract diff on PRs (.github/workflows/ci.yml)
- E2E smoke is a manual workflow with BASE_URL input (.github/workflows/e2e-smoke.yml)

## Handoff Notes
- Code stubs return 501; replace with real implementations
- Keep middleware composition; swap internals only
- Preserve audience separation and flags

