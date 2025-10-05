# CI/CD & Observability for Federation

## CI Pipeline (incremental)
- Typecheck: `npx tsc --noEmit`
- Lint: `npm run lint`
- Build: `npm run build` (includes `prisma migrate deploy`)
- Unit tests: validation + federation services (mock Prisma)
- Contract checks: `node scripts/generate-contract-snapshot.js` then `node scripts/diff-contracts.js --fail-on-breaking`

## Deployment
- Vercel Preview for PRs; protect main with checks
- Promote to Production on green checks + manual approval

## Config Management
- Use environment variables for flags: `FED_ENABLED`, `FED_OIDC_ENABLED`, `RATE_LIMIT_PRESET_API`, etc.
- Maintain `.env.example`; never commit secrets

## Observability
- Structured logs with correlation IDs
- Error rate and latency per route group (`/api/v2/*` vs `/api/fed/*`)
- Optional: OpenTelemetry traces; external log sink

## Runbooks
- Federation outage: disable federation routes via `FED_ENABLED=false`; tenant unaffected
- Idempotency cache miss: inspect KV; retry with same key
- Rate limit spikes: raise preset for provider ops temporarily

