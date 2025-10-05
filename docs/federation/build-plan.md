# Federation Build Plan

This plan follows the Hybrid Binder model: sequential core work with guardrails and post-checks, independent docs/tests in parallel.

## Phase 0: Foundations (Week 0)
- Docs: Overview, Architecture, Security, Contracts skeletons
- Utilities: Extend middleware with withProviderAuth/withDeveloperAuth (no-ops initially)
- CI: Add contract snapshot/diff jobs (reuse existing scripts)

Guardrails: `npx tsc --noEmit`, lint; No `next build` (prisma migrate deploy) until DB configs confirmed.

## Phase 1: Provider Federation MVP (Weeks 1–2)
- Routes: /api/fed/providers/* read-only listings (tenants, org summaries)
- Auth: withProviderAuth wrapper (env-based), rateLimit('api')
- Contracts: docs/api/federation/providers.md with examples
- Tests: minimal unit tests for provider wrappers; E2E smoke GET pathways

## Phase 2: Developer Federation MVP (Weeks 2–3)
- Routes: /api/fed/developers/* diagnostics, feature-flag views
- Auth: withDeveloperAuth (env-based), rateLimit('auth')
- Contracts: docs/api/federation/developers.md
- Tests: unit + E2E smoke

## Phase 3: Entitlements & Audit (Weeks 3–4)
- Add entitlements model and enforcement helper in services
- Append audit logging stubs to federation mutations (still minimal)
- Negative tests: 403, 429 cases

## Phase 4: OIDC Upgrade Readiness (Weeks 4–5)
- Introduce config knobs (no new deps yet) and doc OIDC handoff points
- Prepare `.env.example` with provider/developer IdP placeholders
- No route churn: wrappers become OIDC-aware later

## Phase 5: Rollout & Migration (Week 6)
- Map current env-based flows to OIDC flows; dual-mode during cutover
- UX smoke check across portals
- Contract snapshot baseline for v1 federation

## Deliverables by Phase
- Code: wrappers, thin routes, service stubs, tests
- Docs: contracts, security, runbooks
- CI: typecheck, contract diff, unit tests

