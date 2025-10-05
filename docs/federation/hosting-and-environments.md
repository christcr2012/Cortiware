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

