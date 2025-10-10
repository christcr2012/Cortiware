# Provider Portal — Strategic Enhancement Plan (v2)
**Project:** Cortiware — Provider/Developer Accounts, Provider-Side Federation, Monetization  
**Date:** 2025-10-10  
**Audience:** Product & Engineering Leadership, Architects

---

## A. Executive Summary
We will make **apps/provider-portal** the single source of truth and fully operationalize **Provider-side Federation** (keys, OIDC, provider integrations) and **Monetization**. We finalize the account model with two top-level personas: **Provider** and **Developer**, enforced by RBAC and middleware, with clear navigation and permissions. We remove or migrate the legacy `src/app/*` tree to end routing duplication.

**Key fixes**: Correct the Federation UI → API path mismatch (`/api/provider/federation/...` → `/api/federation/...`). Harden secrets, add audit & rate limits, and align OIDC flows to current specs.

---

## B. Architecture Overview
- **Monorepo:** Turborepo with Next.js App Router apps under `apps/*` and shared packages.
- **Provider Portal (authoritative):** `apps/provider-portal/` — Prisma, RBAC, Federation & Monetization UIs and APIs.
- **Tenant App:** `apps/tenant-app/` (not in scope for provider federation).
- **Legacy app:** root `src/app/*` — to be removed after migration.

**Key modules:**
- Federation: `src/app/provider/federation/*`, `src/app/api/federation/*`
- Monetization: `src/app/provider/monetization/*`, `src/app/api/monetization/*`
- Auth/RBAC: `src/lib/api/*` and Prisma models
- Config: `src/lib/config/federation.ts`

---

## C. Personas & RBAC
**Provider** (two roles):
- `provider_admin`: full control over federation, monetization, billing, analytics, incidents, branding, provisioning.
- `provider_analyst`: read-only analytics & audit; no write on federation/monetization.

**Developer**:
- Access to developer tools (API explorer, app-scoped keys, webhooks sandbox, usage dashboards). Implement as `/developer/*` in provider portal **or** as a new `apps/developer-portal` with its own auth cookie.

**Enforcement:** App Router middleware `withProviderAuth()` / `withDeveloperAuth()` and role checks. Server-side nav gating; 403 for unauthorized routes.

---

## D. Provider-Side Federation — Target Design
1. **Keys**: HMAC keys scoped by tenant/capability; rotate; copy-once secret reveal; record `lastUsedAt`; audit all actions.

2. **OIDC**: Use `/.well-known/openid-configuration` (OIDC Discovery / RFC 8414) to discover endpoints; store `clientSecret` encrypted (never returned in reads); patch supports test; rate-limit testing.

3. **Provider Integrations**: Registry of identity providers with `healthStatus` and `lastSyncAt`; single-click test; bulk enable/disable.

4. **API wrappers**: `compose(withProviderAuth(), withRateLimit('api'), withAudit(...))` for all federation routes.

5. **UI**: Federation tabs — Keys, OIDC, Providers; optimistic updates; error toasts; one-time secret reveal flows.

**Bug fix:** replace `/api/provider/federation/...` with `/api/federation/...` in three federation components.

---

## E. Monetization — Target Design
- Endpoints already exist for plans, prices, overrides, coupons, invites, global-config.
- Lock all writes behind `provider_admin` and wrap with audit + rate limits.
- Add export/import for plans and prices to enable review and promotion across envs.
- Unit test pricing math and override resolution; add basic usage dashboards.

---

## F. Security & Compliance
- **Secrets**: store in secret manager; rotate quarterly or on incident; `FED_HMAC_MASTER_KEY` 32+ bytes; no secrets in GET responses/logs.
- **Audit**: redact secrets; include actor, entity type/id, action, outcome.
- **Rate Limits**: 429 with proper headers; stricter on `/test` endpoints.
- **Data retention**: configurable TTL for AuditEvent; export on request.
- **JWT/Keys**: follow RFC 7517 (JWKS/JWK) where relevant.

---

## G. Observability
- **Metrics**: counters for create/update/delete/test; latency histograms per endpoint.
- **Dashboards**: federation health, OIDC test success rate, monetization write errors, 429s.
- **Alerts**: spikes in 401/403/429; degraded OIDC test success; error budget burn.

---

## H. Migration Plan (Legacy App Removal)
1. Inventory useful developer pages under root `src/app/*`.
2. Move into `apps/provider-portal/src/app/developer/*` **or** create `apps/developer-portal`.
3. Verify routes; remove `src/app/*`.
4. Run end-to-end tests and update links.

---

## I. Roadmap & Estimates
**Phase 1 (Now): Federation Hotfix & Hardening (1–2 days)**
- Fix UI paths; add wrappers; OIDC test + discovery; one-time secret reveal; rate limits.

**Phase 2: Monetization Hardening (1–2 days)**
- RBAC + audit + rate limits; export/import; pricing tests.

**Phase 3: Repo Hygiene (0.5–1 day)**
- Migrate/remove legacy app; unify auth helpers (App Router).

**Phase 4: Developer Experience (1–2 days)**
- Standalone developer portal or gated section; API explorer; webhooks sandbox; usage dashboards.

---

## J. Risks & Mitigations
- **Routing collisions** due to duplicate apps → remove legacy app.
- **Secret exposure** in logs or responses → encrypt-at-rest; redact in audit; one-time reveal only.
- **OIDC variability** among IdPs → discovery; robust validation; test endpoint; rate limits.
- **RBAC drift** → centralize checks in middleware; add unit tests for role gating.

---

## K. API Contracts (Condensed)
**Federation/Keys**
- `GET /api/federation/keys` → list (no secret)
- `POST /api/federation/keys` → create (secret once)
- `DELETE /api/federation/keys/:id` → disable

**Federation/OIDC**
- `GET /api/federation/oidc` → read (masked)
- `POST /api/federation/oidc` → create
- `PATCH /api/federation/oidc` → update
- `POST /api/federation/oidc/test` → discovery + token test

**Federation/Providers**
- `GET|POST /api/federation/providers`
- `PATCH|DELETE /api/federation/providers/:id`
- `POST /api/federation/providers/:id/test`

**Monetization**
- `/api/monetization/{plans,prices,overrides,coupons,invites,global-config}` (writes require `provider_admin`)

---

## L. Minimal Code Diffs (Apply Now)
**FederationKeys.tsx**
```
- fetch('/api/provider/federation/keys', ...)
+ fetch('/api/federation/keys', ...)
```

**OIDCConfig.tsx**
```
- fetch('/api/provider/federation/oidc', ...)
+ fetch('/api/federation/oidc', ...)
```

**ProviderIntegrations.tsx**
```
- fetch('/api/provider/federation/providers', ...)
+ fetch('/api/federation/providers', ...)
```

**Route wrappers (example)**
```ts
export const GET  = compose(withProviderAuth(), withRateLimit('api'))(getHandler)
export const POST = compose(withProviderAuth(), withRateLimit('api'))(
  withAudit(postHandler, { action: 'create', entityType: 'federation_key', actorType: 'provider', redactFields: ['secret','secretHash'] })
)
```

---

## M. Acceptance Criteria
- Federation UI calls correct endpoints; Keys/OIDC/Providers CRUD + tests pass.
- Secrets never leak in reads/logs; one-time secret reveal works.
- RBAC enforced: `provider_admin` for writes; `provider_analyst` read-only.
- Monetization endpoints gated; export/import available; pricing tests green.
- Legacy app removed/migrated and a single portal remains authoritative.
- Dashboards/alerts in place; runbook updated.

---

## N. References
- OAuth 2.0 Authorization Server Metadata (RFC 8414) / OIDC Discovery (`/.well-known/openid-configuration`).
- JSON Web Key (JWK) / JWKS (RFC 7517).
- Secret management best practices (cloud provider docs) and standard redaction patterns.