# Option C Implementation Plan (Per-App Auth with Shared Libraries)

Status: Draft
Owner: Augment Agent

## Milestones
1) Shared Libraries
- Create packages/auth-service
  - export: authenticateProvider, authenticateDeveloper, authenticateDatabaseUser
  - export: verifyTOTPCode, verifyBackupCode (wrap current helpers)
  - export: issueAuthTicket, verifyAuthTicket (HMAC/JWT)
  - export: cookie helpers, audit hooks interfaces
- (Optional) Create packages/db (Phase 2)
  - Prisma client singleton; (later) schema relocation

2) Provider-Portal Integration
- Replace local auth imports with packages/auth-service
- Add POST /api/auth/ticket endpoint
- Keep /api/auth/login and /login page behavior unchanged

3) Tenant-App Auth
- Add /login page and POST /api/auth/login endpoint (tenant users)
- Add POST /api/auth/callback (SSO ticket verification)
- Add POST /api/auth/emergency (provider/developer fallback)
- Add middleware guard for tenant context

4) Env & Vercel Config
- Add AUTH_TICKET_HMAC_SECRET to both apps
- Add TENANT_COOKIE_SECRET, PROVIDER_ADMIN_PASSWORD_HASH, DEVELOPER_ADMIN_PASSWORD_HASH to tenant-app
- Confirm turbo.json globalEnv includes new keys

5) Security & Guardrails
- Rate limiting on /api/auth/login, /api/auth/callback, /api/auth/emergency
- Audit logs for all outcomes
- Nonce store for ticket replay (Redis or in-memory with TTL on Vercel edge/functions)

6) Testing & Validation
- Unit tests for ticket issue/verify
- E2E tests: normal login, SSO callback, emergency login, cookie set
- UX smoke: banners, forbidden paths, role redirects

## Detailed Task List
- packages/auth-service
  - [ ] Scaffold package.json, tsconfig, index.ts
  - [ ] Move/authenticateProvider|Developer into package
  - [ ] Move authenticateDatabaseUser with dependency injection for Prisma client
  - [ ] Implement ticket utils (issue/verify) with jose and HS256
  - [ ] Implement cookie helpers
  - [ ] Export types for results and errors
- provider-portal
  - [ ] Refactor /api/auth/login to call auth-service
  - [ ] Implement /api/auth/ticket (POST)
  - [ ] Ensure redirects and cookies unchanged
- tenant-app
  - [ ] Create /login page (UI form)
  - [ ] Implement /api/auth/login (tenant DB users)
  - [ ] Implement /api/auth/callback (ticket verify + set cookie)
  - [ ] Implement /api/auth/emergency (hash verify + set cookie)
  - [ ] Add middleware for tenant context and role guards
- Env
  - [ ] Add AUTH_TICKET_HMAC_SECRET to both apps in Vercel
  - [ ] Add TENANT_COOKIE_SECRET, PROVIDER_ADMIN_PASSWORD_HASH, DEVELOPER_ADMIN_PASSWORD_HASH to tenant-app
- Tests
  - [ ] Unit: ticket utils
  - [ ] E2E: login flows + cookies
  - [ ] Lint/typecheck/build on both apps

## Acceptance Criteria
- Provider-portal still supports direct Provider/Developer login with existing env/backglass flows.
- Tenant-app supports local login and emergency Provider/Developer login.
- SSO ticket flow works from provider-portal → tenant-app with aud/exp/nonce checks.
- All cookies are HttpOnly+Secure in prod; per-app secrets used.
- Deployment on Vercel succeeds for both apps.

## Backout Plan
- Revert per-app endpoints and remove new package usage; keep unified login enabled.
- No data migrations, so rollback is code-only.

## Notes
- Phase 2 (packages/db) should be scheduled after Phase 1 stabilizes.
- If Redis is unavailable, use short ticket expiries and in-process nonce map per-region as interim.
