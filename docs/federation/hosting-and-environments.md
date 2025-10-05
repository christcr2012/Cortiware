# Hosting & Environments (Federation)

## Hosting Model
- Frontend + App Router: Vercel (Edge Network); APIs under `app/api/**`
- Runtime selection: Prefer Edge Runtime for read-heavy GET; Node.js runtime for Prisma-backed routes
- Database: Neon PostgreSQL (existing); Region close to Vercel POPs
- KV/Cache: Upstash Redis (rate limit, idempotency, session cache) or Vercel KV
- Object Storage (optional): R2/S3 for audit exports

## Environments
- Local: `next dev -p 5000`; `.env.local` with federated flags (`FED_ENABLED`, `FED_OIDC_ENABLED=false`)
- Staging: Preview deployments per PR; separate DB and KV; feature flags managed via env vars
- Production: `next build` + `prisma migrate deploy`; secrets via Vercel project environment

## OIDC Configuration (when FED_OIDC_ENABLED=true)

### Required Environment Variables
```bash
FED_OIDC_ENABLED=true
OIDC_PROVIDER_ISSUER=https://your-idp.example.com
OIDC_CLIENT_ID=your-client-id
OIDC_CLIENT_SECRET=your-client-secret
OIDC_REDIRECT_URI=https://your-app.vercel.app/api/auth/oidc/callback
OIDC_SCOPE=openid profile email
```

### Dual-Mode Authentication
- When `FED_OIDC_ENABLED=false`: Uses env-based tokens (rs_provider, rs_developer cookies)
- When `FED_OIDC_ENABLED=true`: Tries OIDC session first, falls back to env-based if not found
- This allows gradual migration without breaking existing auth

### OIDC Flow
1. User visits provider/developer portal
2. Portal redirects to `/api/auth/oidc/login` (not yet implemented)
3. System redirects to IdP authorization endpoint
4. User authenticates at IdP
5. IdP redirects back to `/api/auth/oidc/callback` with authorization code
6. Callback exchanges code for tokens, validates JWT, creates session cookie
7. User redirected to intended destination

### IdP Requirements
- Must support OpenID Connect (OIDC) with authorization code flow
- Must provide public keys for JWT signature verification (JWKS endpoint)
- Recommended claims: `sub` (required), `email`, `name`, `roles` (custom claim for federation roles)

### Session Management
- Session stored in `oidc_session` cookie (HttpOnly, Secure, SameSite=Lax)
- Session validated on each request by checking JWT signature and expiration
- Refresh tokens not yet implemented (TODO)

## Domains & Routes
- Tenant app: `app.yourdomain.com`
- Provider portal: `provider.yourdomain.com` (future), initially internal routes only
- Developer portal: `dev.yourdomain.com` (future), initially internal routes only
- API namespace: `/api/fed/*` is additive and versionless initially (v0); promote to `/api/fed/v1/*` at stabilization

## Secrets Management
- Use Vercel Envs for runtime secrets; GitHub Actions OIDC to inject build-time vars if needed
- No secrets in Git; maintain `.env.example` documenting required keys

## Scaling & Limits
- Rate limits at wrapper level; per-audience presets
- Edge caching for GET federation reads (safe responses); revalidate as appropriate

## Observability
- Logs: Vercel + external aggregator (Datadog/New Relic) optional
- Tracing: OpenTelemetry if enabled; correlation IDs in response headers

## DR & Backups
- Neon automatic backups; periodic snapshot schedule
- KV backups for idempotency keys not needed (ephemeral), but retention policy documented

