# Sonnet 4.5 Handoff (Execution Checklist)

Read first
- Reference/Provider/PROVIDER_OPERATIONS_BLUEPRINT.md
- Reference/Provider/SONNET_45_BUILD_PLAN.md

Deliverables
1) Provider pages (App Router)
   - /provider/subscriptions, /provider/usage, /provider/addons, /provider/incidents, /provider/billing, /provider/analytics, /provider/audit
   - Each: KPI row + table + filters + empty/error states; server-only services
2) Services (server-only)
   - src/services/provider/{subscriptions,usage,addons,incidents,billing,analytics,audit}.service.ts
3) Federation ingestion
   - POST /api/federation/events, POST /api/federation/usage with wrappers (RateLimit→Idempotency→HMAC→Audit)
   - Validate payloads; map to domain writes; append Activity timeline
4) Schema deltas (if missing)
   - Activity, Subscription, UsageMeter, AddonPurchase, FederationKey (update prisma/schema.prisma)
   - Run prisma generate only (no deploy unless instructed)
5) Billing & reconciliation
   - Revenue by stream; identify unbilled converted leads; AI credits vs usage; CSV export
6) Background jobs (idempotent)
   - Nightly rating (UsageMeter→invoice lines), dunning retries, monthly AI rollups
7) Tests
   - Unit (services, wrappers 401/403/429/409); Integration (ingest→query); E2E (KPI→section drilldown)

Coding notes
- Use '@/lib/prisma'; theme via CSS vars; cursor pagination; stable ordering by createdAt,id
- Do not use client RBAC in provider; no useMe() in provider pages
- Idempotency/nonce/rate limit stores in KV/Redis with TTL

Acceptance
- npm run typecheck && npm run build: green
- New pages render with real queries (no 500s)
- Ingestion endpoints: HMAC verified, nonce/timestamp enforced, idempotent
- Basic tests pass

Start points
- Add pages under src/app/(provider)/provider/** matching above list
- Add services under src/services/provider/**
- Implement /api/federation/{events,usage}/route.ts with wrappers

