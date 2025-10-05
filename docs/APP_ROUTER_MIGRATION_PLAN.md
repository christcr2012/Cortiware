App Router–Only Migration Plan (Phased)

Goal
- Retire legacy Pages Router for APIs; implement all routes under app/api/** with Route Handlers
- Preserve functionality, simplify middleware, and enforce audience separation consistently

Principles
- Canonical router is App Router
- Migrate by module with feature flags; keep Pages API until each module is fully replaced
- After each batch: run build + minimal smoke; do not remove Pages endpoints until new endpoints are verified

Phases

Phase 0: Prework (now)
- Branding and cookie normalization (done)
- Define shared server utils in /src/server/core (auth, rbac, rate limit)
- Confirm ENV and database connections work in server components/route handlers

Phase 1: Auth + Me + Themes (low risk)
- app/api/auth/login/route.ts (tenant)
- app/api/auth/logout/route.ts
- app/api/me/route.ts
- app/api/themes/route.ts
- Keep Pages API versions during validation; wire app routes in UI

Phase 2: Provider APIs (security first)
- app/api/provider/login|logout/route.ts
- app/api/provider/clients/* (read-only list first)
- Enforce: rs_provider cookie OR federation headers via providerFederationVerify
- Delete legacy /pages/api/provider/* per-endpoint once validated

Phase 3: CRM (shell endpoints)
- Leads, Contacts, Orgs, Opps basic CRUD: create read-only list endpoints first
- Introduce input zod schemas and canonical error format
- Keep side-effecting endpoints (create/update/delete) gated behind feature flag until validated

Phase 4: Jobs/Scheduling (defer heavy modules)
- Land read-only status endpoints and narrow write paths

Phase 5: Cleanup
- Remove unused /pages/api/** that have app/api equivalents
- Delete legacy auth helpers superseded by server utils

Guardrails per Batch
- npm run build (or pnpm build)
- npx tsc --noEmit (type safety)
- Minimal smoke script for new endpoints (200/401/403 responses)

Risks & Mitigations
- Risk: Middleware differences between pages/api and route handlers
  - Mitigation: Create wrapper helpers for cookies, audience checks, rate limits reusable in both
- Risk: Uncovered callers
  - Mitigation: Log deprecation warnings on legacy endpoints; collect usage

Acceptance
- All API endpoints under app/api/**
- Legacy /pages/api/** removed or stubbed with 410 Gone and migration link
- CI green: build, typecheck, smoke checks

