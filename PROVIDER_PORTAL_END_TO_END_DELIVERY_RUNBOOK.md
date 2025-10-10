# 🧭 PROVIDER PORTAL — END‑TO‑END DELIVERY RUNBOOK (LIVE WIRING)

Date: 2025‑01‑10
Scope: Provider Portal (apps/provider-portal) + Tenant App (apps/tenant-app)
Goal: Deliver a live, wired Provider Portal that auto‑recognizes tenants (incl. a test tenant), monitors real usage, and supports day‑to‑day provider operations.

This runbook consolidates strategy + execution into a single followable plan.

---

## 0) Prerequisites & Environment

Secrets (.env at repo root — do not commit):
- DATABASE_URL=postgres://…
- NEXTAUTH_SECRET=…
- STRIPE_SECRET_KEY=… (if billing live)
- STRIPE_WEBHOOK_SECRET=… (if using webhooks)
- VERCEL_ANALYTICS_ID=… (optional)
- PROVIDER_JWT_SECRET=…
- EMAIL_SMTP_URL=… (optional)

Local bootstrap:
1) npx prisma generate
2) npm run typecheck
3) npm run build

Notes:
- Monorepo (Turborepo) already wired; Provider Portal reads from the shared db via Prisma.
- We will add a seed path to create a test tenant.

---
## 0a) Phase 0: Platform Integrity & Security Hardening (1–2 days)

Tasks (from v2, merged into v3):
1) Federation UI path fixes: replace all /api/provider/federation/* with /api/federation/* (done)
2) API guardrails: wrap Federation & Monetization routes with compose(withProviderAuth(), withRateLimit('api')); keep audit wrappers on writes
3) OIDC posture:
   - Use /.well-known discovery for issuer metadata
   - Encrypt clientSecret at rest (AES) and only ever reveal once at creation; redact on reads
   - Keep POST /api/federation/oidc/test for connectivity checks; rate-limit it
4) Observability & SLOs:
   - Define 99.9% availability + 95th percentile latency SLOs for federation endpoints
   - Alerts on spikes of 401/403/429 and error budget burn
   - Add minimal dashboard panels (requests, p95 latency, 4xx/5xx, 429)
5) Repo hygiene (plan only):
   - Inventory root src/app/* for eventual removal; do not remove until Phase 1 ships and routing is confirmed

Acceptance checks:
- All federation screens (Keys, OIDC, Providers, Test) work end-to-end
- 429s return correct headers when hammering a federation route
- OIDC secret redaction verified via GET /api/federation/oidc
- Alerts/dashboards created (or placeholders documented)

---


## 1) Tenancy & Data Model (validate)

Core models (present in prisma/schema.prisma; verify):
- Organization, Tenant, User, Subscription, Plan, Invoice
- Lead, LeadDispute/Reclassification (or fields on Lead with audit), Attribution
- Usage (API and feature usage), MetricsSnapshot
- AuditEvent, Incident
- ProviderIntegration (federation)

Actions:
- Confirm Tenant has: id, orgId, name, slug, status, createdAt, updatedAt, serviceAreas (JSON), trade (plumbing/electrical/hvac), planId, onboardingStatus.
- Confirm Usage tables: apiUsage (tenantId, route, method, status, bytes, durationMs, timestamp), featureUsage (tenantId, featureKey, count, metadata, timestamp).
- Confirm Lead fields needed for disputes/reclassification now match new UI.
- Confirm Billing models exist for invoices, dunning status, coupons.

If gaps exist, design additive migrations (non‑breaking); apply via prisma migrate dev (create‑only) then deploy.

---

## 2) Live Usage Wiring (Provider + Tenant Apps)

Objectives:
- Capture API usage and feature interactions in real time
- Attribute to tenantId (or provider/global when N/A)

2.1 HTTP/API usage capture
- Add a lightweight wrapper in Provider Portal and Tenant App route handlers:
  - withUsageLogging(handler): time the request, read route/method/status/bytes/tenantId, write to apiUsage
  - Compose with existing middleware (auth/audit).
- Tenant identification sources:
  - For Tenant App: tenantId from session or subdomain/path (depending on routing) → attach to request context.
  - For Provider Portal: tenantId may be null; still log provider operations with actor info.

2.2 Feature usage capture
- Introduce a client helper recordFeatureUse(featureKey, metadata?) that POSTs to /api/provider/usage/feature (or tenant analogue) → inserts featureUsage.
- Use sparingly on primary actions (ApproveDispute, ReclassifyLead, CreateInvoice, RateLimitEdit, etc.).

2.3 Aggregation & surfacing
- Ensure /provider/api-usage reads from apiUsage with filters (date range, tenant, route, 30‑day trend). Add CSV export endpoint.

---

## 3) Action Center (Critical Ops Hub)

Purpose: unify urgent queues for daily ops.

3.1 Data model (re‑use existing tables):
- Lead disputes (pending), invoices (overdue/dunning), subscriptions (expiring/at‑risk), incidents (SLA breach), tenants (churn‑risk/high‑priority), usage (rate‑limit approaching), payments failed.

3.2 API: /api/provider/action-center
- Returns buckets with counts + items (cursorized):
  - disputesPending[], invoicesOverdue[], subsExpiring[], slaBreaches[], tenantsAtRisk[], rateLimitAlerts[]
  - filter: tenantId?, severity?, aging?

3.3 UI: /provider/action-center
- KPI row (counts), tabs or left nav (queues), list + bulk actions, action bar (Approve Dispute, Send Reminder, Escalate, Create Task, Schedule EBR).

3.4 Actions (write endpoints):
- POST /api/provider/leads/[id]/dispute (approve/reject)
- POST /api/provider/billing/invoices/[id]/remind
- POST /api/provider/subscriptions/[id]/extend
- POST /api/provider/incidents/[id]/escalate
- POST /api/provider/tasks (create provider success task referencing tenant)

---

## 4) Tenant Onboarding (Replace Provisioning)

Purpose: business‑centric onboarding for service contractors.

4.1 Checklist sections:
- Company Profile (name, trade, service areas, hours, contact)
- Roles & Permissions (owner, dispatcher, field techs)
- Pipelines & Workflows (defaults by trade)
- Lead Sources (web, phone, imports, marketplace)
- Integrations (QuickBooks, email, calendar)
- Branding (logo, colors)
- Training & Go‑Live (resource links, confirmation)

4.2 API:
- /api/provider/onboarding/templates (GET)
- /api/provider/onboarding/[tenantId] (GET/PUT) — store checklist JSON
- /api/provider/integrations/* (per integration auth/config)

4.3 UI: /provider/tenant-onboarding
- Trade‑specific template starter; progress meter; per‑step forms; save as draft; mark complete.

4.4 Outcomes:
- onboardingStatus=completed; readinessScore; timeToLive metric; audit events emitted.

---

## 5) Revenue Intelligence v1

Metrics & views:
- KPIs: MRR, ARR, MoM growth, NRR, ARPU, LTV:CAC (if CAC data present)
- Forecast: simple linear + 3‑month moving average
- Cohorts: retention by signup month
- Waterfall: expansion vs churn vs contraction
- Segments: by plan, trade, region

API:
- /api/provider/revenue/summary
- /api/provider/revenue/forecast
- /api/provider/revenue/cohorts

UI:
- /provider/revenue-intelligence — KPI cards, charts, cohort table, CSV export.

---

## 6) Client Success Workspace

Account 360 pane per tenant:
- Header: owner, plan, renewal date, ARR, health score, NPS, lifecycle stage
- Activity timeline: tasks, notes, emails, EBRs (events table or reuse AuditEvent with typed metadata)
- Playbooks: low‑adoption, dunning, renewal prep; one‑click start → creates tasks
- Tasks: list by owner/due date; quick create; completion updates timeline

APIs:
- /api/provider/tenants/[id]/overview (aggregated)
- /api/provider/tenants/[id]/tasks (GET/POST)
- /api/provider/tenants/[id]/notes (GET/POST)

UI:
- /provider/clients/[id] — tabbed: Overview, Tasks, Notes, Billing, Usage, Health

---

## 7) Analytics Data Sources (de‑mock)

- For any chart using mocks, wire to services that read MetricsSnapshot/apiUsage/featureUsage/invoices/subscriptions.
- Add /api/analytics/snapshot (exists) to materialize daily stats by job (cron/collect-metrics).
- Ensure cron writes snapshots nightly; support re‑compute backfill.

---

## 8) Observability, Audit & Guardrails

- Reuse withAuditLog; add withUsageLogging in both apps.
- Add error boundary pages for user‑friendly messages.
- SLA counters in incidents; show time‑to‑ack and time‑to‑resolve.
- Structured logs: level, tenantId, actor, route, latency.

CI/CD
- GitHub Actions: typecheck, lint, build, test; Vercel deploy from monorepo with proper root.
- Zero‑Tolerance: fix any red before proceeding.

---

## 9) Seeding a Test Tenant (so Provider Portal recognizes it)

Script (Node/ts-node under scripts/seed-test-tenant.ts):
- Creates: Organization → Tenant (trade=plumbing, serviceAreas=[…]) → Plan (Basic) → Subscription (active) → Owner user → Sample leads (5) with a pending dispute → One invoice (overdue) → Minimal apiUsage rows.
- Prints: tenantId, owner email/password, sample data ids.

Usage:
1) npm run seed:test-tenant (add script in root package.json)
2) Login to Provider Portal; visit:
   - /provider/clients → see tenant
   - /provider/tenant-health → see health tile
   - /provider/action-center → see pending dispute/overdue invoice
   - /provider/api-usage → see sample usage rows

Notes:
- If auth is required for tenant users, also generate tenant app credentials for end‑to‑end testing.

---

## 10) Manual Smoke & Acceptance Tests

Pre‑checks
- npm run typecheck; npm run build — both must pass

Smoke

- Login → Provider dashboard loads
- /provider/clients shows the test tenant; clicking opens Client 360
- /provider/action-center shows at least 1 item in each relevant bucket
- /provider/leads supports dispute approve/reject and reclassify; reflects in billing state
- /provider/api-usage loads, filters by tenant; CSV export returns data
- /provider/revenue-intelligence loads; KPIs and charts render (based on current data)
- /provider/tenant-onboarding (new) shows checklist and allows saving

Edge
- Empty states render friendly guidance (no tenants; no disputes; no incidents)
- Errors show helpful action (retry/contact support)

---

## 11) UX Language Refresh (apply during build)

- Provisioning → Tenant Onboarding; Monetization → Pricing & Offers; Incidents → Support & Incidents; Federation → Integrations Hub (subtitle: Federation), Compliance → Security & Compliance
- Jargon to plain language: Dunning → Payment Retries; Rate limit exceeded → Too many requests — try again
- Button verbs: Approve Dispute, Reclassify Lead, Create Task, Send Reminder

---

## 12) Implementation Order (2–3 weeks)
Phase 0 (1-2 days):
1) Federation UI path fixes to /api/federation/* (done)
2) Add withRateLimit('api') to Federation & Monetization routes (done)
3) OIDC discovery + clientSecret encryption + one-time reveal + redaction
4) Define SLOs/alerts and minimal dashboard for federation endpoints
5) Repo hygiene inventory only (no removals yet)


Week 1 (Operational):
1) Implement withUsageLogging (both apps) + feature usage capture
2) Build Action Center API + UI (core buckets + actions)
3) Replace Provisioning nav + implement Tenant Onboarding shell + checklist CRUD

Week 2 (Revenue & Success):
4) Revenue Intelligence v1 APIs + UI (KPI, forecast, cohorts, waterfall)
5) Client Success Workspace (Account 360, tasks, notes, playbooks)
6) Analytics de‑mock; ensure nightly snapshot job

Week 3 (Polish):
7) Complete API Usage tenant table, rate‑limit edit modal, endpoint breakdown, CSV
8) Federation & Incidents enhancements (bulk, health, SLA clocks)
9) UX copy refresh across nav/pages; scheduled reports (optional)

Guardrails after each batch: typecheck → build → smoke → fix reds.

---

## 13) Handover Criteria

- Provider Action Center live and actionable
- Tenant Onboarding present; can mark a test tenant complete
- Revenue Intelligence v1 operational
- Client Success Workspace usable for daily work
- Usage logging active; API Usage dashboard shows data
- Documentation updated (this runbook + API contracts)

---

## 14) What Will Auto‑Recognize a New Test Tenant?

- Seed creates org/tenant/subscription/usage rows
- Provider Portal queries (Clients, Tenant Health, Action Center, API Usage) filter by active tenants → the test tenant appears
- Dispute/invoice seeds ensure Action Center is non‑empty for validation

---

## 15) Next Steps

- Approve this runbook
- I will execute Week 1 tasks first, then iterate per guardrails
- Once your test tenant is seeded, you’ll be able to validate live flows end‑to‑end

— End of Runbook —
