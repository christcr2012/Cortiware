# Option C: Per-App Auth with Shared Libraries (Architecture)

Status: Draft
Owner: Augment Agent
Audience: Implementation (Sonnet 4.5), Security, Platform

## Goals
- Per-app authentication surfaces (provider-portal, tenant-app) with independent sessions/cookies per domain/app.
- Shared auth logic packaged once (no logic duplication), reusable across apps.
- Support central SSO (provider-portal issues short-lived tickets) AND robust fallback (per-tenant emergency Provider/Developer access) if SSO is down.
- Preserve current Provider/Developer convenience flows and DEV flags.

## Non-Goals (Phase 1)
- Breaking schema changes. We reuse existing tables/fields.
- Introducing a standalone auth service. We keep it in shared libraries inside the monorepo.

## High-Level Architecture
- packages/auth-service (new)
  - Pure functions: authenticateProvider, authenticateDeveloper, authenticateDatabaseUser, TOTP/backups, rate-limit adapter hooks, audit hooks.
  - Cookie helpers: buildSetCookie headers, naming, durations.
  - Ticket helpers: issueAuthTicket(payload), verifyAuthTicket(token) using HMAC (HS256) or libsodium (HMAC-SHA256) with exp/aud/nonce.
- packages/db (optional Phase 1; required Phase 2)
  - Prisma client singleton export, and schema if we centralize schema. In Phase 1, provider-portal can keep Prisma; tenant-app consumes only the shared auth logic without direct DB usage, or we add DB when needed.
- provider-portal (app)
  - /login UI → /api/auth/login (provider, developer, tenant unified acceptable)
  - /api/auth/ticket (POST) issues short-lived signed ticket for cross-app SSO (aud = tenant-app)
  - Maintains Provider/Developer environment-based fallback + breakglass.
- tenant-app (app)
  - /login → /api/auth/login (tenant primary flow)
  - /api/auth/callback → verifies ticket, sets cookie
  - /api/auth/emergency → Provider/Developer emergency access (env-hash gated)

## Cookies & Sessions
- Cookies scoped per app/domain.
- Cookie names (defaults):
  - provider-portal: rs_provider, rs_developer
  - tenant-app: rs_user, rs_accountant, rs_vendor; emergency rs_provider, rs_developer in tenant-app only set by /api/auth/emergency.
- Attributes: HttpOnly; SameSite=Lax; Secure in prod; Max-Age 30d (configurable). Consider rolling session + refresh in Phase 2.

## Ticket Format (SSO)
- Compact JWT-like (using jose) or custom HMAC payload.
- Claims: sub (user id/email), role, aud (target app id/domain), iat, exp (< 2 minutes), nonce.
- Signature: HS256 with AUTH_TICKET_HMAC_SECRET (shared between issuer and verifier).
- Transport: POST from provider-portal to tenant-app /api/auth/callback with token in body OR redirect with token in query + CSRF mitigation. Prefer POST with SameSite and CSRF token.

## Emergency Access (Resilience)
- Endpoint: tenant-app /api/auth/emergency (POST)
- Validates:
  - EMERGENCY_LOGIN_ENABLED === true
  - email matches PROVIDER/DEVELOPER emergency patterns (or exact env emails)
  - bcrypt compare to PROVIDER_ADMIN_PASSWORD_HASH / DEVELOPER_ADMIN_PASSWORD_HASH
  - optional IP allowlist
- Sets rs_provider or rs_developer cookie for tenant-app scope; redirects to /provider or /developer tools section limited to single-tenant view.

## Provider/Developer Direct Portals (Single-Client Mode)
- Direct-access mode constraint: Provider/Developer features in tenant-app are limited to the current tenant context.
- UI: add a visible banner "Direct Access: Tenant X"; disable cross-tenant nav.
- Route guard: middleware ensures tenant context resolved from host or session; blocks switching.
- Audit: all actions tagged with providerId/developerId and tenantId.

## Security Considerations
- Tickets: very short exp, aud-binding, nonce to prevent replay; store nonce server-side with TTL to block re-use.
- Cookies: HttpOnly + Secure + SameSite=Lax; separate secrets per app.
- Rate limiting: reuse existing applyRateLimit hooks; add per-endpoint categories (auth, emergency, callback).
- Logging: success/failure, TOTP status, emergency logins flagged.

## Environment Variables Matrix (Phase 1)
- Shared: AUTH_TICKET_HMAC_SECRET
- provider-portal:
  - PROVIDER_EMAIL/PROVIDER_PASSWORD (or *_USERNAME)
  - PROVIDER_BREAKGLASS_EMAIL/PROVIDER_BREAKGLASS_PASSWORD
  - DEVELOPER_EMAIL/DEVELOPER_PASSWORD
  - DEVELOPER_BREAKGLASS_EMAIL/DEVELOPER_BREAKGLASS_PASSWORD
  - PROVIDER_SESSION_SECRET, DEVELOPER_SESSION_SECRET
  - DEV_ACCEPT_ANY_* flags as today
- tenant-app:
  - TENANT_COOKIE_SECRET
  - PROVIDER_ADMIN_PASSWORD_HASH, DEVELOPER_ADMIN_PASSWORD_HASH (emergency)
  - EMERGENCY_LOGIN_ENABLED=true
  - EMERGENCY_IP_ALLOWLIST= (optional)

## Routing Contracts
- provider-portal
  - POST /api/auth/login → returns 303 redirect to /provider|/developer|/dashboard
  - POST /api/auth/ticket → body { aud, email, role } returns { token, exp } for SSO
- tenant-app
  - POST /api/auth/login → tenant user login
  - POST /api/auth/callback → body { token } verifies and sets cookie, 303 to /dashboard
  - POST /api/auth/emergency → emergency provider/developer login

## Rollout Strategy
- Phase 1 (lib + endpoints + tenant login)
- Phase 2 (optional shared DB package + move Prisma, unify schema ownership)
- Phase 3 (deprecate unified login page if desired)
