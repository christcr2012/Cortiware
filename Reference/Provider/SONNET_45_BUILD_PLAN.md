# Sonnet 4.5 Build Plan — Provider Portal & Federation (Handoff)

This plan enumerates concrete tasks with acceptance criteria, file paths, and coding notes. Follow App Router standards, keep provider/developer/accountant separate from client RBAC.

## Principles
- Do not mix provider UI with client AppShell or useMe()
- Use server-only services under src/services/provider/**
- All ingestion routes must compose: withRateLimit → withIdempotencyRequired → withHmacAuth → withAuditLog
- Prefer Prisma for queries; KV/Redis for rate limit, nonce, idempotency
- Follow theme CSS variables (no hardcoded Tailwind colors)

## 1) Provider Pages & Navigation
- Add/complete routes under src/app/(provider)/provider/**
  - leads (DONE baseline): add filters (status/org/source/date), bulk actions (convert/invoice), row actions
  - ai (DONE baseline): add feature breakdown (lead_analysis, rfp_strategy, pricing), alerts (75/90/100%), per-org drilldowns
  - subscriptions: list, MRR/ARR, churn, plan changes
  - usage: meters, rating windows, billable totals
  - addons: SKU purchases/refunds
  - incidents: open/resolved queues, SLA, escalations
  - billing: reconciliation by stream, dunning
  - analytics: trends, funnels, cohorts, revenue mix
  - audit: searchable event feed
- Update src/app/(provider)/ProviderShellClient.tsx with nav links (leads, ai already added)

Acceptance:
- Each page loads on provider auth only and renders real data without 500s
- Each page has at least one KPI row + table + filters + empty/error states

## 2) Services (server-only)
Create files (if missing) with functions and types:
- src/services/provider/subscriptions.service.ts
- src/services/provider/usage.service.ts
- src/services/provider/addons.service.ts
- src/services/provider/incidents.service.ts
- src/services/provider/billing.service.ts
- src/services/provider/analytics.service.ts
- src/services/provider/audit.service.ts

Acceptance:
- Each service exports list/summary/detail functions with typed return shapes
- No client imports; use '@/lib/prisma' and narrow selects

## 3) Federation Ingestion
Implement endpoints:
- POST /api/federation/events
- POST /api/federation/usage

Pathing:
- src/app/api/federation/events/route.ts
- src/app/api/federation/usage/route.ts

Behavior:
- Compose guardrail wrappers
- Validate JSON body per PROVIDER_OPERATIONS_BLUEPRINT.md
- Map event types to domain writes (e.g., lead.created → Lead; invoice.paid → Payment)
- Enqueue Activity entries for timeline

Acceptance:
- HMAC signature validated; nonce & timestamp enforced; idempotent
- Returns { ok: true } with 200; structured errors otherwise

## 4) Schema Deltas (Prisma)
Add models from blueprint if not present (Activity, Subscription, UsageMeter, AddonPurchase, FederationKey).

Steps:
- Update prisma/schema.prisma
- npm run prisma:generate (do not deploy until instructed)

Acceptance:
- tsc --noEmit passes; code compiles referencing new models

## 5) Billing & Reconciliation
- Enhance provider/billing page to show revenue by stream
- Identify unbilled converted leads; batch "Add to invoice" action
- Show AI credit usage vs remaining per org; mismatch alerts

Acceptance:
- Filters by org/date/stream; export CSV

## 6) Background Jobs (scripts or /api/admin tasks)
- Nightly rating: aggregate UsageMeter → invoice lines
- Dunning retries: attempt failed payments
- Monthly rollups: ensure AiMonthlySummary consistency

Acceptance:
- Idempotent reruns; logs written to Audit

## 7) Testing
- Unit tests: services per stream; wrappers (401/403/429/409 paths)
- Integration: POST /api/federation/events & /usage → DB writes → query services
- E2E: provider dashboard KPIs link to sections; pages render and paginate

Acceptance:
- All tests pass locally in CI; minimal flakiness

## 8) Observability/Dev Aids
- Add "Prompt Evaluations" tab under /developer or /provider/dev-aids for CI runs
- Add federation webhook log viewer and replay tool

## Coding Notes
- Use small, typed DTOs; no any
- Protect server code: 'use server' where applicable
- Cursor pagination for large tables; stable ordering by createdAt,id
- Consistent error/empty/loading UI using theme variables

## Out of Scope Guardrails
- Do not touch client RBAC/auth flows
- Do not merge provider and client navigation
- Do not bypass wrappers on ingestion endpoints

