# Provider Portal — End-to-End Delivery Runbook (v2)
**Project:** Cortiware — Provider-Side Federation & Monetization  
**Date:** 2025-10-10  
**Audience:** Providers (Ops/Eng), SRE, Implementers  
**Scope:** Get the **Provider Portal** running end-to-end with fully functional **Provider-side Federation** (keys, OIDC, provider integrations) and **Monetization**. Enforce RBAC for **Provider** and **Developer** accounts.

---

## 1) System of Record & Repo Layout
- **Monorepo:** `Cortiware-main/` (Turborepo)
- **Primary app to run/deploy:** `apps/provider-portal/` (Next.js App Router, Prisma, Tailwind)
- **Tenant app:** `apps/tenant-app/`
- **Legacy/duplicate app:** root `src/app/*` (App Router) — **to be removed or migrated** to avoid split routing.

```
Cortiware-main/
  apps/
    provider-portal/
      prisma/schema.prisma
      src/app/
        provider/federation/*           # UI for federation (Keys, OIDC, Providers)
        provider/monetization/*         # UI for monetization
        api/federation/*                # API for federation (keys, oidc, providers)
        api/monetization/*              # API for monetization (plans, prices, overrides, coupons, invites, global-config)
      src/lib/api/*                     # middleware, server utils
      src/lib/config/federation.ts
    tenant-app/
  src/app/* (LEGACY - remove after migration)
```

**Critical bug fixed in this version:** Federation UI previously called `/api/provider/federation/...`; backend routes are `/api/federation/...`. This runbook applies the correction across Keys, OIDC, Providers UI.

---

## 2) Prerequisites
- Node 18+ / PNPM or NPM
- PostgreSQL 14+
- Secrets manager (for production): AWS/GCP/Azure Secrets Manager (recommended)

**Required environment variables (prod):**
- `DATABASE_URL=postgres://...`
- `NEXTAUTH_SECRET=<strong random>`
- `FED_ENABLED=true`
- `FED_OIDC_ENABLED=true`
- `FED_HMAC_MASTER_KEY=<32+ bytes>` (used to encrypt OIDC client secrets)
- Provider session secret(s) for cookies (if applicable)

> Do **not** commit secrets. Store in your secrets manager and inject at deploy time.

---

## 3) Local Setup
```bash
# From repo root
cp apps/provider-portal/.env.example apps/provider-portal/.env
# Fill required env vars
npm i

# Prisma
npm run prisma:generate -w apps/provider-portal
npm run prisma:migrate -w apps/provider-portal
npm run prisma:seed -w apps/provider-portal

# Dev server
npm run dev
```

**Local URLs (default):**
- Provider Portal: `http://localhost:3000`

---

## 4) Accounts & RBAC
Define system roles through Prisma models: `RbacRole`, `RbacUserRole`.

**Roles:**
- `provider_admin` — full access (federation, monetization, billing, analytics, incidents, branding, provisioning).
- `provider_analyst` — read-only analytics/audit; no write to federation/monetization.
- `developer` — developer-facing capabilities (API explorer, app keys, webhooks sandbox, usage dashboards).

**Middleware:**
- `withProviderAuth()` — resolves provider session cookie and asserts role membership.
- `withDeveloperAuth()` — for developer area or separate app.
- All **write** endpoints: `compose(withProviderAuth(), withRateLimit('api'), withAudit(...))`

---

## 5) Federation (Provider-Side) — Operations
### 5.1 Endpoints (App Router)
- `GET /api/federation/keys` — list (redact secret)
- `POST /api/federation/keys` — create key (secret returned once); audit + hash
- `DELETE /api/federation/keys/:id` — disable

- `GET /api/federation/oidc` — read config (no secret)
- `POST /api/federation/oidc` — create (secret encrypted, one-time reveal)
- `PATCH /api/federation/oidc` — update + connectivity test
- `POST /api/federation/oidc/test` — live discovery + token exchange validation

- `GET /api/federation/providers` — list integrations (OIDC/SAML/API-key)
- `POST /api/federation/providers` — create
- `PATCH /api/federation/providers/:id` — update
- `DELETE /api/federation/providers/:id` — remove
- `POST /api/federation/providers/:id/test` — health check, sets `lastSyncAt`, `healthStatus`

**Wrappers for all:** `compose(withProviderAuth(), withRateLimit('api'), withAudit(...))`

### 5.2 UI Fixes (already applied in v2)
Update fetch targets in:
- `apps/provider-portal/src/app/provider/federation/FederationKeys.tsx`
- `apps/provider-portal/src/app/provider/federation/OIDCConfig.tsx`
- `apps/provider-portal/src/app/provider/federation/ProviderIntegrations.tsx`

Replace:
```
/api/provider/federation/...  ->  /api/federation/...
```

### 5.3 OIDC Discovery & Secrets Handling
- Use issuer discovery: `/.well-known/openid-configuration` (OIDC Discovery / RFC 8414)
- Store `clientSecret` encrypted; **never** return in GETs
- Provide **one-time reveal** on create/rotate
- Add **Rotate** and **Test** actions in UI
- Rate limit testing endpoints (e.g., 5/min per user/IP)

---

## 6) Monetization — Operations
**Endpoints present:** `/api/monetization/{plans,prices,overrides,coupons,invites,global-config}`

**Runbook rules:**
1. Wrap all with `withProviderAuth()` + RBAC (`provider_admin` for writes) + `withAudit` + `withRateLimit('api')`
2. UI at `provider/monetization` shows Plans, Prices, Tenant Overrides, Invites, Coupons
3. Export/Import JSON for plans/prices for change review
4. Add unit tests for pricing math, plan inheritance, and overrides

---

## 7) Deployment
### 7.1 Build & Env
```bash
# CI (example GitHub Actions)
pnpm i
pnpm -w build
# prisma migrate during deploy or via CI step:
pnpm -w --filter apps/provider-portal prisma:migrate deploy
```

Ensure production env is present: `DATABASE_URL`, `NEXTAUTH_SECRET`, `FED_*`, session secrets.

### 7.2 Migrations & Seeding
- Run `prisma migrate deploy`
- Optional: run seed to create initial roles/users (`provider_admin`, `provider_analyst`).

### 7.3 Secrets
- Inject via secret manager; rotate quarterly (or on incident).

---

## 8) Observability & Audit
- **AuditEvent** on create/update/delete/test for federation & monetization
- **Metrics:** counters (`federation.keys.created`, `oidc.test.success`, etc.) and latency histograms
- **Logs:** redact secrets; structured JSON
- **Dashboards:** success ratios, latency p95/p99, error rates, 429s

---

## 9) SLOs & Alerts
- **Availability:** 99.9% monthly on Federation & Monetization APIs
- **Latency:** p95 < 300ms for read; < 600ms for write
- **Error budget:** alert if 20% consumed within 7 days
- **Security:** alert on repeated 401/403/429 spikes; anomaly detection on key creation bursts

---

## 10) Smoke & E2E Checklist
**Federation → Keys**
- Create key → secret shown once (copy)
- List (no secret), Disable key → status updates
- Audit entries exist

**Federation → OIDC**
- Save issuer/client → `/.well-known` resolves
- Test succeeds; `lastTestedAt` updates
- Secret masked in reads

**Federation → Providers**
- Add OIDC provider; test → `healthStatus=healthy`
- Update/delete works; audit entries exist

**Monetization**
- Create plan & price → visible in UI
- Create tenant override → reflected in pricing
- Export/Import JSON works
- RBAC blocks non-admin writes

---

## 11) Rollback & Recovery
- Use blue/green or canary deploys
- Rollback by re-pointing traffic to previous image
- `prisma migrate resolve --applied`/`--rolled-back` as needed
- Rotate compromised keys; revoke access; audit investigation

---

## 12) Troubleshooting
- **UI 404 for federation:** verify path fix (`/api/federation/...`) applied
- **OIDC test fails:** check issuer URL has trailing domain only (no `/authorize`), check network egress, check client credentials
- **429s:** rate limit too strict — bump per-route limits
- **403:** user lacks `provider_admin` — assign role

---

## 13) Decommission Legacy App
- Migrate any needed developer screens into `apps/provider-portal/src/app/developer/*` or create `apps/developer-portal`
- Remove root `src/app/*` to eliminate duplication

---

## 14) Acceptance Criteria (DONE = ✅)
- ✅ Federation UI uses `/api/federation/...` paths; CRUD + tests work
- ✅ RBAC + Audit + Rate limits on federation & monetization
- ✅ Secrets handled securely; no secret in GET responses
- ✅ Single authoritative portal (legacy removed/migrated)
- ✅ Runbook and env docs current