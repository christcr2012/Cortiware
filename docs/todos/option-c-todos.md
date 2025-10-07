# TODOs / Issues: Option C

## Must-Haves (Phase 1)
- [x] Create packages/auth-service with exported auth/ticket/cookie helpers
- [x] provider-portal: implement /api/auth/ticket
- [x] tenant-app: add /login, /api/auth/login, /api/auth/callback, /api/auth/emergency
- [ ] Add AUTH_TICKET_HMAC_SECRET to both apps in Vercel (deployment step)
- [ ] Add TENANT_COOKIE_SECRET, PROVIDER_ADMIN_PASSWORD_HASH, DEVELOPER_ADMIN_PASSWORD_HASH to tenant-app in Vercel (deployment step)
- [x] Rate limit and audit logs on new endpoints

## Provider/Developer Direct-Access Redesign (Single-Client Mode)
- [x] Add Direct Access banner and restrict cross-tenant navigation
- [x] Route guards ensure single-tenant context derived from host/session
- [x] Audit tags include providerId/developerId + tenantId
- [x] Document operational procedure for emergency access

## Nice-to-Haves (Phase 2)
- [x] packages/db for Prisma client + (later) schema centralization
- [ ] Replace in-memory nonce store with Redis (Edge KV alternative) for replay protection (GitHub Issue #28)
- [ ] Add refresh-token model with short app cookies (GitHub Issue #29)

## Documentation
- [x] Update MY_DEPLOYMENT_GUIDE.md for per-app login + emergency flows
- [x] Add runbooks for SSO outage recovery

## Tracking
- [x] GitHub Epic #30 (Option C Auth) - Phase 1 complete
- [ ] GitHub Epic #30 - Phase 2 items tracked in Issues #27-29
- [ ] GitHub Epic #43 - Single-tenant Provider/Developer portals (Issues #31-42)

## Completed (2025-10-07)
All Phase 1 items completed. See `docs/IMPLEMENTATION_SUMMARY.md` for details.
