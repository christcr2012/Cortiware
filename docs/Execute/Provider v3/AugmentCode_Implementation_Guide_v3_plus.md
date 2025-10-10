# Augment Code — Implementation Guide for Provider-Side Federation (v3+) in Cortiware
**Repo:** Cortiware (Turborepo)  
**Primary app:** `apps/provider-portal/` (Next.js App Router, Prisma, Tailwind)  
**Date:** 2025-10-10  
**Agent:** Augment Code (execute steps exactly; do not introduce unrelated changes)

> Goal: Ship a **fully operational** provider-side federation system and dashboards, tailored to this monorepo, **without drop-in bulk code**. Make minimal, explicit edits only where instructed, create new files only under the paths specified, and open separate PRs per phase.

---

## 0) Safety, Branching & Conventions
1. Create a branch: `feat/federation-v3plus`.
2. Use **small, reviewable commits** per task. Commit message prefix: `[federation]`.
3. Never modify or delete files under `apps/tenant-app/` or the root `src/app/*` legacy tree in Phase 0–2. (Migration happens later.)
4. Run before each commit from repo root:
   - `npm i`
   - `npm run -w apps/provider-portal typecheck || true`
   - `npm run -w apps/provider-portal lint || true`
   - `npm run -w apps/provider-portal test || true` (if test setup exists; add tests in Step 9)
5. When writing code, prefer App Router handlers (`route.ts`) and existing helper modules under `apps/provider-portal/src/lib/*`. If a helper doesn’t exist, create it **only** under `src/lib/federation/*`.

---

## 1) Phase 0 — Hotfix & Hardening (must pass before anything else)
### 1.1 Fix Federation UI → API path mismatch
In **exact files**:
- `apps/provider-portal/src/app/provider/federation/FederationKeys.tsx`
- `apps/provider-portal/src/app/provider/federation/OIDCConfig.tsx`
- `apps/provider-portal/src/app/provider/federation/ProviderIntegrations.tsx`

**Action:** Replace all `fetch('/api/provider/federation/...')` with `fetch('/api/federation/...')` for **GET/POST/PATCH/DELETE**.

**Acceptance:** Manual test: Keys create/list/disable; OIDC save/test; Provider integrations list/create/test.

### 1.2 Enforce wrappers on federation & monetization routes
Find all handlers under:
- `apps/provider-portal/src/app/api/federation/**/route.ts`
- `apps/provider-portal/src/app/api/monetization/**/route.ts`

Wrap exported handlers with existing middlewares (or add if missing):
```ts
export const GET  = compose(withProviderAuth(), withRateLimit('api'))(getHandler)
export const POST = compose(withProviderAuth(), withRateLimit('api'))(
  withAudit(postHandler, { action: 'create', entityType: '<entity>', actorType: 'provider', redactFields: ['secret','clientSecret','secretHash'] })
)
```
If `compose`, `withRateLimit`, or `withAudit` do not exist, implement minimal versions in `src/lib/api/*` consistent with project style.

**Acceptance:** 401/403 returned for unauthorized; 429 for exceeded limits; audit rows created on writes (verify in DB).

### 1.3 OIDC discovery, redaction, one-time secret reveal
In `apps/provider-portal/src/app/api/federation/oidc/route.ts` (or adjacent file structure):
- Add `POST /test` handler that fetches issuer metadata from `/.well-known/openid-configuration` and performs a token exchange with configured `clientId/clientSecret` (do not log secrets).
- Ensure `GET` never returns `clientSecret`.
- Support **one-time secret reveal** only in the `POST create` response; do not expose in subsequent reads.
- Record `lastTestedAt` and success/failure in DB. Rate limit this endpoint to 5/min/user.

**Acceptance:** Successful test updates `lastTestedAt`; `GET` omits secrets; audit entries present.

### 1.4 SLOs/Alerts
Integrate counters and latency metrics for federation endpoints (keys/oidc/providers). Emit to the project’s metrics sink (use existing util). Set target SLOs: Availability 99.9%, p95 read < 300ms, p95 write < 600ms. Add alerting rules for spikes in 401/403/429 and error budget burn (hook into existing alert framework if present).

---

## 2) Schema — Add Required Models via Prisma
Open `apps/provider-portal/prisma/schema.prisma`. Append **exactly** these models if missing; otherwise **merge fields** (no breaking changes):

```prisma
model FederatedClient {
  id              String   @id @default(cuid())
  orgId           String   @unique
  name            String
  contactEmail    String
  planType        String
  apiKeyId        String   @unique
  webhookEndpoint String?
  lastSeen        DateTime?
  monthlyRevenue  Int      @default(0)
  convertedLeads  Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model FederationKey {
  id         String   @id @default(cuid())
  keyId      String   @unique
  secretHash String
  orgId      String
  createdAt  DateTime @default(now())
  disabledAt DateTime?
  @@index([orgId, keyId])
}

model WebhookRegistration {
  id         String   @id @default(cuid())
  orgId      String   @unique
  url        String
  secretHash String
  enabled    Boolean  @default(true)
  createdAt  DateTime @default(now())
}

model EscalationTicket {
  id           String   @id @default(cuid())
  escalationId String   @unique
  tenantId     String
  orgId        String
  type         String
  severity     String
  description  String
  createdAt    DateTime @default(now())
  state        String   @default("received") // received|sandbox_created|pr_opened|canary_requested|rolled_out|rolled_back
}

model Invoice {
  id             String   @id @default(cuid())
  clientOrgId    String
  leadId         String
  conversionType String
  amountCents    Int
  metadataJson   Json
  createdAt      DateTime @default(now())
  status         String   @default("received") // received|accepted|failed
}

model AuditEvent {
  id         String   @id @default(cuid())
  actorType  String   // provider|system|ai_dev
  actorId    String?
  orgId      String?
  entityType String
  entityId   String?
  action     String
  result     String   // success|failure
  redactJson Json?
  createdAt  DateTime @default(now())
  @@index([orgId, entityType, createdAt])
}

model IdempotencyKey {
  key       String   @id
  method    String
  path      String
  bodyHash  String
  response  Json
  orgId     String
  createdAt DateTime @default(now())
  ttl       Int
}
```

**Migration steps:**
```bash
npm run -w apps/provider-portal prisma:generate
npm run -w apps/provider-portal prisma:migrate
```
**Acceptance:** migrations succeed; Prisma Client builds; tables appear in DB.

---

## 3) Federation Libraries (create new files)
Add the following **new** modules under `apps/provider-portal/src/lib/federation/`. Follow the project’s export style.

**3.1 `signature.ts`**
- `hmacSHA256(key: string, data: string): string` — returns hex.
- `constantTimeEq(a: string, b: string): boolean` — use `crypto.timingSafeEqual`.
- `buildStringToSign(method: string, pathWithQuery: string, isoTs: string)` — `${METHOD} ${PATH+QUERY} ${TIMESTAMP}`.

**3.2 `ratelimit.ts`**
- Implement `rateLimit(key: string, limitPerMin: number)` using Redis if `RATE_LIMIT_REDIS_URL` exists; otherwise fallback to in-memory (dev only). TTL ~70s per bucket.

**3.3 `verify.ts`**
- Export `verifyFederationRequest(req: NextRequest) -> NextResponse | null`.
- Validate required headers: `X-Provider-KeyId`, `X-Provider-Timestamp`, `X-Provider-Signature`, `X-Provider-Org`.
- Clock skew: 300s. Body size: 1MB (also set in Next config).
- String-to-sign: `${METHOD} ${PATH+QUERY} ${TIMESTAMP}`; expected signature format `sha256:<hex>`.
- Rate-limit per org: 100 req/min.
- Secrets source: `CLIENT_KEYS_JSON` env (keyId → secret).

**3.4 `idempotency.ts`**
- `bodyHash(buf: Buffer) -> hex` (sha256).
- `readOrCreateIdempotent(key, method, path, bodyHash, orgId)`.
- `saveIdempotent(key, method, path, bodyHash, orgId, response, ttlSec = 86400)`.

**3.5 `webhooks.ts`**
- `dispatchEvent(orgId: string, type: string, payload: any)`.
- Look up `WebhookRegistration` by `orgId`. POST JSON to `url` with `x-provider-signature` header (HMAC of body using stored secret). Retry 5 times with exponential backoff; TODO: insert DLQ row on repeated failure.

**3.6 Next config**
- Ensure `apps/provider-portal/next.config.mjs` contains:
```js
export default {
  api: { bodyParser: { sizeLimit: '1mb' } }
}
```

**Acceptance:** Typecheck/lint pass; libs importable by route handlers.

---

## 4) Create Federation API (App Router, versioned)
Create the following handlers under `apps/provider-portal/src/app/api/v1/federation/`:

### 4.1 `escalation/route.ts` (POST only)
- Prepend: `const bad = await verifyFederationRequest(req); if (bad) return bad;`
- Require `Idempotency-Key` and use `idempotency.ts` helpers.
- Validate body (must include `escalationId`, `tenantId`, `incident{type,severity,description}`, `client{orgId,...}`).
- Dedupe by `escalationId` (return prior ticket id if exists).
- Create `EscalationTicket`; write `AuditEvent`.
- Respond `{ success: true, providerTicketId, acknowledgment: 'received' }`.
- Fire webhook: `dispatchEvent(orgId, 'escalation.acknowledged', { ticketId })` (non-blocking).

### 4.2 `billing/invoice/route.ts` (POST only)
- Verify request (same as above), idempotency, and persist `Invoice`.
- Call Stripe: use env `STRIPE_SECRET_KEY`; on error, mark `status = 'failed'`.
- Write `AuditEvent`.
- Respond `{ success: status==='accepted', providerInvoiceId }`.

### 4.3 `status/route.ts` (GET)
- Return `{ version:'v1', now: <ISO>, limits:{ perMin:100, maxBodyBytes:1000000 } }`.

### 4.4 `analytics/route.ts` (GET)
- Aggregate: invoice count and sum, escalation count; return minimal JSON without PII.

### 4.5 `callbacks/register/route.ts` (POST)
- Body: `{ orgId, url, secret }`. Hash secret with SHA256 into `WebhookRegistration.secretHash`. Upsert by `orgId`.

**Acceptance:** Manual curl test (see Step 8.1) returns 200s; DB rows created; webhook attempt logged; Stripe path runs when configured.

---

## 5) Provider Dashboard Wiring (no bulk code, only minimal pages if missing)
Check for an existing provider dashboard. If **already present**, integrate links/actions that call the APIs above and render DB results. If **missing**, create lightweight pages under:
- `src/app/provider/dashboard/clients/page.tsx` — CRUD `FederatedClient`; register webhook via `/api/v1/federation/callbacks/register`.
- `src/app/provider/dashboard/escalations/page.tsx` — list `EscalationTicket`; allow state transitions via a simple admin PATCH route (implement under `/api/admin/escalations/[id]`).
- `src/app/provider/dashboard/billing/page.tsx` — list `Invoice` rows.
- `src/app/provider/dashboard/analytics/page.tsx` — fetch `/api/v1/federation/analytics` and display totals.
- `src/app/provider/dashboard/settings/page.tsx` — webhook registration and per-org limits (read/write via admin endpoints).

Keep styling consistent with existing Tailwind utility classes in the project. Use existing design system components if available; otherwise use plain HTML/Tailwind.

**Acceptance:** All pages render, call APIs successfully, and show toast/error messages on failure.

---

## 6) RBAC & Approvals
- Enforce `provider_admin` for **writes** across federation/monetization/admin routes, `provider_analyst` read-only.
- If a developer/AI-dev persona exists, ensure it has no write permissions in production without approval workflow.
- Add unit tests for RBAC checks on critical routes.

---

## 7) Environment Variables (prod)
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `CLIENT_KEYS_JSON` — JSON object `{ "client-acme":"<secret>", ... }`
- `FEDERATION_CLOCK_SKEW_SEC=300`
- `RATE_LIMIT_REDIS_URL` — optional; if absent, dev-only in-memory limiter.
- `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`

**Acceptance:** Secrets stored in secret manager; not committed.

---

## 8) Tests
### 8.1 Curl simulation (local)
```
TS=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
TO_SIGN="POST /api/v1/federation/escalation $TS"
SIG="sha256:$(echo -n "$TO_SIGN" | openssl dgst -sha256 -hmac secret123 -binary | xxd -p -c256)"
curl -s -X POST http://localhost:3000/api/v1/federation/escalation  -H "X-Provider-KeyId: client-acme"  -H "X-Provider-Timestamp: $TS"  -H "X-Provider-Signature: $SIG"  -H "X-Provider-Org: org-123"  -H "Idempotency-Key: demo-001"  -H "Content-Type: application/json"  --data '{"escalationId":"esc-1","tenantId":"tenant-1","incident":{"type":"ai_triage_failure","severity":"high","description":"X"},"client":{"orgId":"org-123","contactEmail":"ops@example.com","planType":"premium"}}'
```

### 8.2 Unit tests (add to existing test runner)
- Signature acceptance/rejection; timestamp window; per-org rate limit 429; idempotency replays same JSON.
- API handlers for `escalation` and `invoice`; webhook dispatcher retry logic with a mocked fetch.

---

## 9) PR & Rollout
1. Open PR: **Phase 0** only (path fix + wrappers + OIDC test + SLO hooks). Merge after review.
2. Open PR: **Schema + Libraries** (Step 2–3). Merge after migration passes.
3. Open PR: **Federation API** (Step 4). Merge after curl test passes.
4. Open PR: **Dashboard wiring** (Step 5) and **RBAC** (Step 6).
5. Tag release `provider-portal-v3.0.0` and deploy. Validate `/api/v1/federation/status` and dashboards.

**Done criteria:** All acceptance checks pass; no secrets in logs; SLO dashboards/alerts active.