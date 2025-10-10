
# Cortiware Provider‑Portal v3+ — PR Plan & Templates
**Repo:** Cortiware (Turborepo)  
**Primary app:** `apps/provider-portal/` (Next.js App Router, Prisma, Tailwind)  
**Date:** 2025-10-10  
**Use:** This file tells **Augment Code** exactly how to break the work into small PRs, what to put in each PR, what to test, and how to roll out/back out safely.

> Important: Make **no changes** outside the specified paths. Open PRs **sequentially** (PR-1 → PR-4). Each PR is intentionally small and reviewable.

---

## Global rules for all PRs
- Branch naming: `feat/federation-v3plus/<phase>`
- Commit prefix: `[federation]`
- CI gates to pass before requesting review (run from repo root):
  ```bash
  npm i
  npm run -w apps/provider-portal typecheck || true
  npm run -w apps/provider-portal lint || true
  npm run -w apps/provider-portal build
  npm run -w apps/provider-portal test || true
  ```
- Manual smoke (local): start provider-portal, verify `/api/health` (if present) or root page loads.
- Do **not** remove the legacy `src/app/*` app in these PRs.

---

## PR‑1 — Phase 0 Hotfix & Hardening
**Branch:** `feat/federation-v3plus/phase-0`  
**Objective:** Fix federation UI→API path mismatch; wrap federation/monetization routes; add OIDC discovery **test** endpoint; add SLO metrics hooks. No product UX changes.

### Scope of change
1) **Path fix (UI):**
- Edit these files and replace **all** `'/api/provider/federation/...` → `'/api/federation/...`:
  - `apps/provider-portal/src/app/provider/federation/FederationKeys.tsx`
  - `apps/provider-portal/src/app/provider/federation/OIDCConfig.tsx`
  - `apps/provider-portal/src/app/provider/federation/ProviderIntegrations.tsx`

2) **Wrap routes with auth + rate-limit + audit:**
- All handlers under:
  - `apps/provider-portal/src/app/api/federation/**/route.ts`
  - `apps/provider-portal/src/app/api/monetization/**/route.ts`
- Use:
  ```ts
  export const GET  = compose(withProviderAuth(), withRateLimit('api'))(getHandler)
  export const POST = compose(withProviderAuth(), withRateLimit('api'))(
    withAudit(postHandler, { action: 'create', entityType: '<entity>', actorType: 'provider', redactFields: ['secret','clientSecret','secretHash'] })
  )
  ```

3) **OIDC discovery test endpoint:**
- Add `POST /api/federation/oidc/test` (App Router sibling to existing OIDC handler):
  - Resolve issuer `/.well-known/openid-configuration`
  - Attempt token flow with configured `clientId/clientSecret`
  - Persist `lastTestedAt` and boolean `lastTestOk`
  - **Never** log secrets; **never** return secrets in GET

4) **Metrics hooks & SLOs:**
- Emit counters `federation.request.total`, `federation.oidc.test.ok`, and latency histograms per route (use existing metrics util if available).
- Target SLOs: availability 99.9%, p95 read < 300ms, p95 write < 600ms.

### Commit‑by‑commit checkpoints
1. `[federation] fix federation UI paths to /api/federation/*`  
2. `[federation] add route wrappers: withProviderAuth + withRateLimit + withAudit`  
3. `[federation] OIDC /test endpoint with discovery + token exchange + lastTestedAt`  
4. `[federation] metrics counters + histograms; document SLOs`  

### PR title & template
**Title:** `Phase 0: federation hotfix (path fix, wrappers, OIDC test, SLO hooks)`

**Description template:**
- **What:** Path corrections in 3 UI files; standardized wrappers; OIDC `/test`; metrics hooks.  
- **Why:** Fix broken UI→API calls; enforce auth/rate‑limit/audit; validate OIDC config; add observability.  
- **Risk:** Low (no schema change).  
- **Test plan:**  
  - UI: Keys/OIDC/Providers CRUD now work end‑to‑end.  
  - OIDC: `/api/federation/oidc/test` shows `lastTestedAt` updated on success.  
  - Check logs: no secrets.  
- **Rollout/Backout:** Deploy; if failure, revert commit or rollback image.  

---

## PR‑2 — Schema & Federation Libraries
**Branch:** `feat/federation-v3plus/schema-and-libs`  
**Objective:** Introduce minimal models and reusable libs (signature, verify, idempotency, ratelimit, webhooks). No product UI changes.

### Scope of change
1) **Prisma models (append/merge; no breaking changes):**
- Add/merge models: `FederatedClient`, `FederationKey`, `WebhookRegistration`, `EscalationTicket`, `Invoice`, `AuditEvent`, `IdempotencyKey` in  
  `apps/provider-portal/prisma/schema.prisma`

2) **Libraries under** `apps/provider-portal/src/lib/federation/`:
- `signature.ts`, `verify.ts`, `idempotency.ts`, `ratelimit.ts`, `webhooks.ts`
- Enforce 1MB body size in `apps/provider-portal/next.config.mjs`:
  ```js
  export default { api: { bodyParser: { sizeLimit: '1mb' } } }
  ```

3) **Migrations:**
```bash
npm run -w apps/provider-portal prisma:generate
npm run -w apps/provider-portal prisma:migrate
```

### Commit‑by‑commit checkpoints
1. `[federation] add prisma models for federation + audit + idempotency`  
2. `[federation] add signature + verify + idempotency + ratelimit libs`  
3. `[federation] add webhook dispatcher + next body size limit`  
4. `[federation] prisma migrate + docs`  

### PR title & template
**Title:** `Schema & federation libraries (signature/verify/idempotency/ratelimit/webhooks)`

**Description template:**
- **What:** Adds DB models and libs for secure HMAC, replay protection, idempotency, rate limiting, and webhooks.  
- **Why:** Shared primitives for the v1 API; enables safe retries and strong auth.  
- **Risk:** Medium (schema migration).  
- **Test plan:** Migrations succeed; typecheck/lint pass; unit tests for `signature.ts` and `verify.ts` where available.  
- **Rollout/Backout:** Standard DB migration rollout; on failure, rollback DB and app image.  

---

## PR‑3 — Federation API (versioned `/api/v1/federation/*`)
**Branch:** `feat/federation-v3plus/api-v1`  
**Objective:** Add production endpoints with HMAC auth + idempotency + basic analytics.

### Scope of change
Add App Router handlers under `apps/provider-portal/src/app/api/v1/federation/`:
- `escalation/route.ts` (POST)
- `billing/invoice/route.ts` (POST)
- `status/route.ts` (GET)
- `analytics/route.ts` (GET)
- `callbacks/register/route.ts` (POST)

Each POST:
- Guard with `verifyFederationRequest()`; enforce `Idempotency-Key` using `idempotency.ts`.
- Persist rows (EscalationTicket or Invoice), write `AuditEvent`, and return JSON response.
- Fire webhook via `webhooks.ts` (non‑blocking).

### Commit‑by‑commit checkpoints
1. `[federation] add /api/v1/federation/escalation (POST) with HMAC + idempotency`  
2. `[federation] add /api/v1/federation/billing/invoice (POST) + audit`  
3. `[federation] add /api/v1/federation/status (GET)`  
4. `[federation] add /api/v1/federation/analytics (GET)`  
5. `[federation] add /api/v1/federation/callbacks/register (POST)`  
6. `[federation] wire webhook dispatch from escalation/invoice flows`  

### PR title & template
**Title:** `API v1: federation endpoints with HMAC + idempotency + webhooks`

**Description template:**
- **What:** Implements five endpoints for v1 federation with full auth, replay protection, and outbound webhooks.  
- **Why:** Enables external clients to escalate issues, report invoices, query status/analytics, and receive signed callbacks.  
- **Risk:** Medium (new surfaces).  
- **Test plan:** Use provided curl; verify DB rows; check audit; confirm signed webhooks fire/retry.  
- **Rollout/Backout:** Deploy; monitor 401/403/429; rollback image if needed.  

---

## PR‑4 — Provider Dashboard Wiring & RBAC
**Branch:** `feat/federation-v3plus/dashboard-rbac`  
**Objective:** Minimal UI integration to operate federation (Clients, Escalations, Billing, Analytics, Settings) and enforce RBAC for writes.

### Scope of change
- Add/adjust pages under `apps/provider-portal/src/app/provider/dashboard/`:
  - `clients/page.tsx` (CRUD `FederatedClient` + register webhook)
  - `escalations/page.tsx` (list + state transitions via `/api/admin/escalations/[id]`)
  - `billing/page.tsx` (list `Invoice`)
  - `analytics/page.tsx` (use `/api/v1/federation/analytics`)
  - `settings/page.tsx` (webhook registration, per‑org limits)
- Ensure server‑side RBAC: `provider_admin` for writes; `provider_analyst` read‑only.

### Commit‑by‑commit checkpoints
1. `[federation] add admin routes for clients/escalations/invoices (read/write)`  
2. `[federation] wire dashboard pages for clients/escalations/billing/analytics/settings`  
3. `[federation] enforce RBAC on write routes; return 403; add tests`  
4. `[federation] UX polish + error toasts; update docs`  

### PR title & template
**Title:** `Provider dashboard wiring + RBAC enforcement for federation/monetization`

**Description template:**
- **What:** Adds minimal dashboards bound to the v1 APIs and locks writes to `provider_admin`.  
- **Why:** Gives operators a working surface to manage federation safely.  
- **Risk:** Low/Medium (UI only; RBAC hardening).  
- **Test plan:** Manual exercise of each page; verify 403 for non‑admin writes.  
- **Rollout/Backout:** Deploy; if UI regressions appear, revert PR (backend remains intact).  

---

## Review checklist (for every PR)
- [ ] Only intended files changed; paths limited to provider‑portal  
- [ ] Typecheck/lint/build green; migrations run (if any)  
- [ ] No secrets in code or logs; redaction present for sensitive fields  
- [ ] RBAC checks on writes; 401/403 paths tested  
- [ ] Rate limits present; 429 behavior tested  
- [ ] Audit events written for create/update/delete/test  
- [ ] Monitoring counters/histograms added where applicable  
- [ ] Rollout/backout steps documented

---

## Release & tagging
After PR‑4 merges:
- Tag: `provider-portal-v3.0.0`
- Release notes (high‑level):
  - Federation API v1 with HMAC + idempotency + callbacks
  - OIDC discovery test & secret‑redaction
  - Provider dashboards for Clients/Escalations/Billing/Analytics/Settings
  - RBAC + audit + per‑org rate limits
  - Metrics + SLO hooks

---

## Appendices

### A) Curl smoke commands
(See the Implementation Guide for full curl examples; reuse them here in PR‑3 testing.)

### B) CI suggestion (optional)
If needed, create `.github/workflows/provider-portal.yml` to run typecheck/lint/build/test on `apps/provider-portal` only, and to run `prisma migrate diff` in PR‑2.

---

**End of plan.**
