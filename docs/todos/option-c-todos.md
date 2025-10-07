# TODOs / Issues: Option C

## Must-Haves (Phase 1)
- [ ] Create packages/auth-service with exported auth/ticket/cookie helpers
- [ ] provider-portal: implement /api/auth/ticket
- [ ] tenant-app: add /login, /api/auth/login, /api/auth/callback, /api/auth/emergency
- [ ] Add AUTH_TICKET_HMAC_SECRET to both apps in Vercel
- [ ] Add TENANT_COOKIE_SECRET, PROVIDER_ADMIN_PASSWORD_HASH, DEVELOPER_ADMIN_PASSWORD_HASH to tenant-app in Vercel
- [ ] Rate limit and audit logs on new endpoints

## Provider/Developer Direct-Access Redesign (Single-Client Mode)
- [ ] Add Direct Access banner and restrict cross-tenant navigation
- [ ] Route guards ensure single-tenant context derived from host/session
- [ ] Audit tags include providerId/developerId + tenantId
- [ ] Document operational procedure for emergency access

## Nice-to-Haves (Phase 2)
- [ ] packages/db for Prisma client + (later) schema centralization
- [ ] Replace in-memory nonce store with Redis (Edge KV alternative) for replay protection
- [ ] Add refresh-token model with short app cookies

## Documentation
- [ ] Update MY_DEPLOYMENT_GUIDE.md for per-app login + emergency flows
- [ ] Add runbooks for SSO outage recovery

## Tracking
Create GitHub issues for each bullet after plan approval; group under epic "Option C Per-App Auth".
