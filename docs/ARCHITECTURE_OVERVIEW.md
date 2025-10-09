# Cortiware Architecture Overview

This document consolidates the current architecture as implemented in the codebase (App Router migration, shared packages, and Prisma schema). It is intentionally pragmatic: it captures how the system behaves today, where the seams sit, and which pieces remain stubbed or incomplete.

---

## Monorepo Topology

- **Root Next app (`src/`)** – App Router build that now owns all portals (client/owner, provider, developer, accountant) and the v2 API surface. Shared utilities live under `src/lib`, `src/services`, and `src/server`.
- **Legacy apps (`apps/`)** – Older Next.js projects (`tenant-app`, `provider-portal`, marketing sites) retained for reference and staged migration; most active code paths have been lifted into `src/app`.
- **Packages (`packages/`)** – Reusable libraries compiled with TypeScript:
  - `auth-service` – unified login helpers used by `/api/auth/login`.
  - `db`, `kv`, `config`, `routing`, `themes`, `ui(/-components)`, `verticals`, `wallet` – house domain-specific helpers, UI kits, and seeded data.
- **Prisma schema (`prisma/schema.prisma`)** – Defines the multi-tenant data model plus monetization, audit, federation, import wizard, and security subsystems.
- **Turbo monorepo** – `package.json` + `turbo.json` wire workspaces and shared scripts (`build`, `typecheck`, `test`, contract tooling).

---

## Runtime Surfaces

| Portal / Surface | Route Group | Audience & Scope | Primary Auth Cookie | Notes |
| ---------------- | ----------- | ---------------- | ------------------- | ----- |
| Client tenant app | `(app)` (`/dashboard`, `/settings`, future `/leads` etc.) | Tenant users stored in Postgres `User` table with RBAC | `rs_user` (accepts legacy `mv_user`) | Layout enforced in `src/app/(app)/layout.tsx`; only dashboard + settings migrated so far, remaining CRM pages live in `src/_disabled/pages`. |
| Owner portal | `(owner)` (`/owner/**`) | Tenant owner (same identity plane as client users) | `rs_user` | Shares login flow; wraps content in `OwnerShellClient` for owner-specific navigation. |
| Provider portal | `(provider)` (`/provider/**`) | SaaS provider operators (cross-tenant admins) | `rs_provider` (or `provider-session`, `ws_provider`) | Auth enforced in `src/app/(provider)/layout.tsx`; data fetched via server services (e.g., `getProviderStats`). Several pages still `Coming Soon` (clients, federation). |
| Developer portal | `(developer)` (`/developer/**`) | Provider engineers with system diagnostics access | `rs_developer` (or legacy variants) | Rides provider auth plane; features dashboards, logs, API explorer. |
| Accountant portal | `(accountant)` (`/accountant/**`) | Finance operators (env-based credentials today) | `rs_accountant` (or `accountant-session`, `ws_accountant`) | Layout currently reuses `AppShellClient`; accountant-specific shell exists but is not wired yet. |
| Site-wide protection | `/site-unlock` + middleware | Optional password gate for staging/testing | `site_access_granted` | Controlled via `SITE_PROTECTION_ENABLED` & `SITE_PROTECTION_PASSWORD`. |
| Federation/Owner APIs | `/api/**` namespace | Calls from portals, onboarding flows, external M2M clients | varies | Guarded via middleware wrappers (`withTenantAuth`, `withProviderAuth`, `withHmacAuth`). |

---

## Authentication & Session Model

### Unified Login Endpoint

- `POST /api/auth/login` (`src/app/api/auth/login/route.ts`) is the single entry point for every persona.
- Execution order:
  1. Apply adaptive rate limit via `src/lib/rate-limit.ts` (per IP, progressive delays).
  2. Attempt **database-backed identities** (tenant/owner/accountant/vendor). Uses Prisma (`User`), bcrypt hashes, optional TOTP (`packages/auth-service`), and issues `rs_user`/`rs_accountant` cookies.
  3. Fall back to environment-based **provider** credentials, issuing `rs_provider`.
  4. Fall back to environment-based **developer** credentials (`rs_developer`).
- `packages/auth-service` exposes helpers for cookie naming, redirect routing, break-glass credentials, and TOTP validation.
- Logout endpoints exist per persona (`/api/auth/logout`, `/api/provider/logout`, `/api/developer/logout`, `/api/accountant/logout`).

### Portal Enforcement

- Route-group layouts enforce cookie presence and redirect to the appropriate login (`src/app/(app)/layout.tsx`, `(provider)/layout.tsx`, `(developer)/layout.tsx`, `(accountant)/layout.tsx`).
- Global middleware (`src/middleware.ts`) catches unauthenticated hits to client routes (`/dashboard`, `/leads`, etc.) and funnels to `/login`.
- Site protection middleware (`src/middleware/site-protection.ts`) optionally guards everything behind a shared password during staging.

### Authorization & RBAC

- Tenant RBAC lives in `src/lib/rbac.ts`. It derives permissions from `RbacRole` + `RbacRolePermission` tables, with OWNER/MANAGER/STAFF convenience grants.
- Helpers expose `assertPermission`, `getOrgIdFromReq`, and development bypasses via `DEV_USER_EMAIL`, `DEV_ORG_ID`.
- Provider/developer/accountant personas currently bypass RBAC and rely on route-group scoping.

---

## Guardrails & Middleware

- `src/lib/api/middleware.ts` implements composable wrappers for App Router handlers:
  - `withRateLimit(preset)` – token bucket with configurable presets (`auth`, `api`, `analytics`); supports Redis via `src/lib/rate-limiter.ts`.
  - `withIdempotencyRequired()` – enforces `Idempotency-Key` header, caches responses in Redis or memory via `src/lib/idempotency-store.ts`.
  - `withTenantAuth()` – asserts presence of tenant cookie (TODO: enhance with org/user injection).
  - `withProviderAuth()` / `withDeveloperAuth()` – enforce provider/developer cookies or OIDC (when `FED_OIDC_ENABLED`), attach federation headers.
  - `withHmacAuth()` (`src/lib/hmac/with-hmac-auth.ts`) – validates HMAC signature, nonce, scope for machine-to-machine federation routes using key store + nonce store.
  - `withAudit()` (`src/lib/api/audit-middleware.ts`) – wraps mutating handlers and records audit events (`AuditEvent` table).
- Guardrail primitives default to in-memory stores but flip to Redis/Vercel KV when `REDIS_URL`/`KV_REST_API_URL` are present.

---

## Data Layer (Prisma)

Key entity groups (see `prisma/schema.prisma`):

1. **Tenant & Security Core**
   - `Org`, `User`, `RbacRole`, `RbacUserRole`, `AuditLog`, `Activity`, `AuditEvent`.
   - Security tables for recovery: `UserRecoveryCode`, `UserSecurityQuestion`, `UserBreakglassAccount`, `UserDeviceFingerprint`, `UserLoginHistory`, `BreakglassActivationLog`, `LoginAttempt`, `RefreshToken`.

2. **CRM Domain**
   - `Lead`, `Opportunity`, `Customer`, `Invoice`, `InvoiceLine`, `Payment`, `LeadInvoice`, `LeadInvoiceLine`, `Referral`, `Job`.
   - Supporting enums (`LeadStatus`, `LeadSource`, etc.) enable filtering and dedupe.

3. **Monetization & Billing**
   - `PricePlan`, `PlanPrice`, `Coupon`, `Offer`, `GlobalMonetizationConfig`, `TenantPriceOverride`, `Subscription`, `BillingLedger`, `Addon`, `AddonPurchase`, `UsageMeter`.
   - Stripe integration fields (`stripeCustomerId`, `stripeSubscriptionId`) are stored on `Org`, `Invoice`, `Subscription`.

4. **Onboarding**
   - `OnboardingInvite`, `InviteToken`, onboarding audit references, `Trial`, `VerificationRequest`, `VerificationAttempt`.

5. **Federation & Operations**
   - `FederationKey`, `FederationProvider`, `FederationCredential`, `FederationAudit`, `Incident`, `Notification`.

6. **AI / Automation & Imports**
   - `AiUsageEvent`, `AiMonthlySummary`, `ImportJob`, `ImportMapping`, `ImportError`, `UpgradeRecommendation`.

The schema is extensive (400+ lines); many models support features staged in `_disabled` routes (import wizard, AI agents, etc.) and are ready for future wiring.

---

## Service Layer Highlights

- `src/services/provider/stats.service.ts` – Aggregates cross-tenant metrics (client counts, active users, revenue) for provider dashboards and activity feeds.
- `src/services/developer/stats.service.ts`, `src/services/accountant/stats.service.ts` (similar patterns for their portals).
- `src/services/audit-log.service.ts` & `src/services/metrics.service.ts` – Lightweight audit + funnel tracking (no-op during unit tests) writing to `AuditLog` and `Activity`.
- `src/server/services/onboarding.service.ts` – Invite verification, org/user provisioning, placeholder + Stripe-backed subscription creation, audit hooks.
- Monetization helpers under `src/services/provider/*` manage coupons, offers, prices, and Stripe synchronization.

---

## API Surface Snapshot

### Tenant & Owner

- `/api/onboarding/*` – Accept invite/public onboarding (`accept`, `accept-public`, `verify`), rate-limited + idempotent.
- `/api/v2/*` – New CRM endpoints (`leads`, `opportunities`, `organizations`, `themes`, `auth`) guarded by tenant middleware. Implementation is stubbed (`jsonOk([])` / `501`) pending `leadService` and `opportunityService` wiring.
- Legacy dashboard endpoints (`/api/dashboard/summary`, contacts, etc.) still live in `_disabled` directories and need migration.

### Provider / Developer / Accountant

- `/api/provider/monetization/**` – CRUD for plans, prices, coupons, offers, overrides, invites; enforces provider cookies and records audit events.
- `/api/provider/analytics`, `/api/provider/clients`, `/api/provider/invoices`, `/api/provider/notifications` – Portal data endpoints (some return placeholder data or are partial implementations).
- `/api/provider/federation/**` – Key management, OIDC configuration, provider listings; guarded by `withProviderAuth`.
- `/api/developer/logout`, `/api/accountant/login/logout` – Persona-specific auth endpoints.

### Federation & External Hooks

- `/api/federation/{events,usage,escalation}` – Require HMAC auth (`withHmacAuth`, `withAudit`). Currently rely on in-memory key/nonce stores.
- `/api/fed/providers/**`, `/api/fed/developers/diagnostics` – Exposure for federation tenants and diagnostics.
- `/api/webhooks/stripe` – Stripe webhook entry (implementation should be verified before go-live).

### Site Protection & Theme

- `/api/site-unlock` – Issues site access cookies.
- `/api/theme` – Applies portal theme selections (tied to CSS variable system in `packages/themes` / `src/styles/theme.ts`).

---

## External Integrations

- **Stripe** – `src/services/provider/stripe.service.ts` ensures customers/subscriptions; onboarding flows optionally create Stripe subscriptions when credentials are present (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`).
- **Redis / Vercel KV** – Optional backend for rate limiting, idempotency, nonce stores (`REDIS_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`).
- **SendGrid, Twilio, OpenAI, etc.** – Packages included but live usage is largely confined to disabled routes or future phases; treat as placeholders pending explicit wiring.
- **OIDC** – Federation auth wrappers honor `FED_OIDC_ENABLED` and delegate to `src/lib/oidc` (implementation gated behind configuration).

---

## Notable Gaps & TODOs

- **Client portal feature pages** – `/leads`, `/contacts`, `/opportunities`, `/organizations`, `/fleet`, `/admin`, `/reports` still sit in `src/_disabled/pages` and need App Router migrations.
- **v2 CRM APIs** – `src/app/api/v2/{leads,opportunities,organizations}` return stubs and rely on unimplemented service contracts (`src/services/leads.service.ts`, `src/services/opportunities.service.ts`).
- **Guardrail persistence** – Rate limit, idempotency, nonce, and key stores fall back to memory until Redis/KV is deployed.
- **Accountant layout** – `src/app/(accountant)/layout.tsx` renders `AppShellClient` instead of the accountant-specific shell; confirm intent.
- **Audit enrichment** – `withTenantAuth` TODO notes to hydrate org/user context; same for HMAC key storage (currently in-memory).
- **Testing coverage** – Unit suites exist (`tests/unit/**`), but integration/E2E coverage for App Router APIs and guardrails is pending (`tests/e2e/run.ts` scaffolding present).

---

## Environment Variables (Working Set)

| Concern | Key Variables |
| ------- | ------------- |
| Database | `DATABASE_URL`, `DATABASE_URL_UNPOOLED` |
| Cache / Guardrails | `REDIS_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `IDEMPOTENCY_TTL_HOURS`, `RATE_LIMIT_API_PER_MINUTE`, `RATE_LIMIT_AUTH_PER_MINUTE`, `RATE_LIMIT_ANALYTICS_PER_10MIN` |
| Auth Personas | `PROVIDER_USERNAME`, `PROVIDER_PASSWORD`, `PROVIDER_BREAKGLASS_EMAIL`, `PROVIDER_BREAKGLASS_PASSWORD`, `DEVELOPER_USERNAME`, `DEVELOPER_PASSWORD`, `DEVELOPER_BREAKGLASS_EMAIL`, `DEVELOPER_BREAKGLASS_PASSWORD`, `ACCOUNTANT_USERNAME`, `ACCOUNTANT_PASSWORD`, `DEV_ACCEPT_ANY_*` toggles |
| Tenant Auth | `DEV_USER_EMAIL`, `DEV_ORG_ID`, `UNIT_TESTS` (audit/metrics bypass), `ONBOARDING_TOKEN_SECRET` |
| Stripe | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` |
| Onboarding / Portals | `NEXT_PUBLIC_BASE_URL`, `FED_ENABLED`, `FED_OIDC_ENABLED`, `TEST_PROVIDER_SECRET` (HMAC dev fallback), `FED_OIDC_*` values |
| Site Protection | `SITE_PROTECTION_ENABLED`, `SITE_PROTECTION_PASSWORD` |

Consult `docs/ENVIRONMENT_VARIABLES.md` for the exhaustive list; the table above reflects variables referenced directly in active code paths.

---

## Where to Deepen Understanding Next

1. **Walk the onboarding flow** (invite + public) to observe audit metrics and Stripe behavior; trace through `src/app/api/onboarding/` and `src/server/services/onboarding.service.ts`.
2. **Review monetization UI** under `src/app/(provider)/provider/monetization` alongside its APIs to understand plan/price lifecycle.
3. **Map CRM migration** work by comparing `_disabled` legacy pages/APIs with their future App Router targets.
4. **Validate guardrail readiness** by enabling Redis and exercising rate limit/idempotency/HMAC flows.

This overview should serve as a living baseline; update it as new routes are implemented or ecosystems (Redis, OIDC, etc.) are wired into production.

