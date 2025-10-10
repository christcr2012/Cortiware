# 📈 PROVIDER PORTAL STRATEGIC ENHANCEMENT PLAN

Date: 2025-01-10
Scope: Provider Portal (apps/provider-portal) with context from Tenant App (apps/tenant-app)
Objective: Align the Provider Portal to the service-contractor CRM SaaS business model and deliver an actionable, prioritized roadmap to operate the business end‑to‑end.

---

## 1) Executive Summary

Current State
- 95.5% operational after audit fixes; no 404s; TypeScript clean; build passing
- Key strengths: Tenant Health (churn risk), Billing/Subscriptions/Monetization, API Usage, Federation, Incidents, Leads (now includes dispute workflow)
- Key misalignments: “Provisioning” still reads as infra-oriented; some pages use technical jargon

Critical Gaps Preventing Optimal Operations
- Provider‑level business workflows are scattered; no single “Action Center” for at‑risk tenants, overdue invoices, escalation queues
- Revenue forecasting and cohort analytics are not fully realized
- Guided Onboarding for new tenants (business-centric, not infra) not implemented
- Provider CRM for client success (notes, playbooks, tasks) missing

Top 5 Immediate Priorities
1) Replace Provisioning with Tenant Onboarding (guided, business-centric)
2) Add Provider Action Center (alerts, queues, tasks across Leads/Billing/Support/Health)
3) Complete Revenue Intelligence (forecasting, cohorts, expansion/churn analytics)
4) Add Client Success Workspace (accounts, owners, health playbooks, timeline, tasks)
5) UX Language Refresh (rename technical labels, simplify copy, task-first navigation)

---

## 2) Business Model Mapping (Provider Lifecycle)

Lifecycle you must run end‑to‑end:
1) Client Acquisition: lead sources, partnerships, referrals, demos
2) Onboarding: CRM workspace setup, industry workflow templates, integrations
3) Lead Generation & Billing: lead sources (SAM.gov lives in Tenant App), billing/disputes, attribution
4) Client Success & Support: health monitoring, support incidents, playbooks, renewals
5) Revenue Management & Analytics: pricing, subscriptions, invoices, revenue forecasts
6) Platform Health & Monitoring: API usage, error budgets, uptime, incidents
7) Retention & Expansion: adoption, NPS, expansion revenue, churn prediction

Provider Portal Feature → Lifecycle Map (high-level)
- Acquisition: (Missing) Partner program, referral tracking, demo pipeline [❌]
- Onboarding: Provisioning (misaligned) → Tenant Onboarding [⚠️ → ✅]
- Lead/Billing: Leads (now with disputes) [✅], Billing/Invoices/Monetization [✅]
- Success/Support: Tenant Health [✅], Incidents [✅], (Missing) Success Workspace [❌]
- Revenue/Analytics: Subscriptions [✅], Revenue Intelligence (planned) [⏳]
- Platform Health: API Usage [✅], Incidents [✅]
- Retention/Expansion: Tenant Health (churn risk) [✅], (Missing) Expansion analytics [❌]

---

## 3) Feature Audit & Gap Analysis (Provider Portal)

Legend: Status → Functional [✅] / Incomplete [⚠️] / Misaligned [⚠️] / Missing [❌]

Core Areas
- Dashboard (/provider) → overview KPIs [✅]
- Tenant Health (/provider/tenant-health) → scoring, churn risk [✅]
- Leads (/provider/leads) → summary, table, dispute, reclassify, quality, bulk [✅]
- Billing (/provider/billing), Invoices (/provider/invoices), Subscriptions (/provider/subscriptions), Monetization (/provider/monetization) → revenue ops [✅]
- Analytics (/provider/analytics) → charts exist; confirm data source [⚠️]
- API Usage (/provider/api-usage) → limits, alerts; tenant table + rate-limit modal pending per handoff [⚠️]
- Incidents (/provider/incidents) → SLA, filtering [✅]
- Federation (/provider/federation) → providers, OIDC, keys, test [✅]
- Branding (/provider/branding), Compliance (/provider/compliance) → available [✅]
- Provisioning (/provider/provisioning) → infra semantics (CPU/memory/db) [⚠️ Misaligned]

Cross-Cutting Gaps
- Missing Provider Action Center (cross-queue for disputes pending, dunning, expiring subscriptions, high‑risk tenants, SLA breaches) [❌]
- Missing Client Success Workspace (account owner, notes, playbooks, tasks, EBR timeline) [❌]
- Revenue Intelligence (forecasting, cohorts, expansion/churn waterfall) not completed [⚠️]
- Guided Tenant Onboarding (checklists, integrations, templates) not implemented [⚠️ → redesign]

Tenant App (context)
- Login, Dashboard, Emergency access flows present; SAM.gov lives correctly in Tenant App (not Provider)

---

## 4) Strategic Recommendations (Prioritized)

Phase 1 (Critical & High-Impact: run your business day‑to‑day)
1) Tenant Onboarding (replace Provisioning)
   - Checklist: company profile, service areas, roles, pipelines, lead sources, integrations (QuickBooks, email, calendar)
   - Templates: trade-specific workflows (plumbing, electrical, HVAC) and automations
   - Outcomes: onboarded status, readiness score, time‑to‑live metric
2) Provider Action Center
   - Unified queues: lead disputes pending, overdue invoices, dunning retries, expiring subscriptions, SLA breaches, at‑risk tenants, low adoption
   - Actions: approve/reject, send reminder, create task, escalate, schedule EBR
   - Filters: by tenant, severity, aging; saved views
3) Revenue Intelligence v1
   - MRR/ARR, MoM growth, net revenue retention (NRR), expansion vs. churn waterfall
   - Forecasting (simple linear + moving average), cohort retention by signup month
   - Drilldowns by plan, segment, trade (plumbing/electrical/HVAC)
4) Client Success Workspace
   - Account 360: owner, plan, health, usage, NPS, open tickets, upcoming renewals
   - Playbooks: low adoption → training outreach; dunning → billing assistance
   - Tasks & Timeline: calls, emails, EBR notes; attachment support
5) Analytics Data Sources
   - Replace any mock data with service-backed APIs; add snapshot jobs if needed

Phase 2 (High Priority: scale and predictability)
6) API Usage Completion
   - Tenant list table, rate-limit edit modal, endpoint breakdown, 30‑day trends, CSV export
7) Guided Upsell/Expansion
   - Identify expansion opportunities (add‑ons, seat growth); suggest offers by segment
8) Incident Management Enhancements
   - Bulk status updates, SLA clock/views, runbooks, on‑call integration hooks (Slack/PagerDuty)
9) Federation Console Enhancements
   - Bulk enable/disable, provider health view, last sync dashboards, configuration templates

Phase 3 (Medium Priority: polish & UX)
10) UX Language Refresh
    - See section 6 (Language Audit) for nav label and copy changes
11) Navigation & IA (Information Architecture)
    - Top-level groups: Overview, Clients, Revenue, Operations, Health, Settings
    - Task-first links for Action Center; contextual shortcuts from cards
12) Reports & Exports
    - Scheduled email reports (weekly MRR, at‑risk tenants, unpaid invoices)

Phase 4 (Nice-to-Have: advanced)
13) Forecasting v2
    - Simple ML (prophet‑style trend/seasonality), scenario planner
14) Success Scorecards & Playbooks Library
    - Template playbooks per trade; benchmarked adoption scorecards
15) Partner/Referral Program
    - Track referrals, payouts, partner tiers; acquisition dashboard

---

## 5) UI/UX Language Audit (Layman-friendly copy)

Rename Navigation Labels
- Provisioning → Tenant Onboarding
- API Usage → API Usage & Limits (or "API & Integrations" if broader)
- Monetization → Pricing & Offers
- Incidents → Support & Incidents
- Federation → Integrations Hub (if used for providers); keep “Federation” in subtext
- Compliance → Security & Compliance
- Branding → White‑Label Branding

Copy and Micro‑UX
- Replace “Dunning” with “Payment Retries (Overdue Payments)”
- Replace “Provision resources” with “Set up their workspace”
- Replace “Rate limit exceeded” with “Too many requests — try again in a moment”
- Buttons use verbs: “Approve Dispute”, “Reclassify Lead”, “Create Task”, “Send Reminder”
- Add empty states with helpful next steps (e.g., “No disputes today — see yesterday’s”) 

Navigation & Layout
- Add “Action Center” in top‑level nav
- Surface shortcuts on KPI cards (e.g., “3 tenants at risk → View queue”)
- Persistent global search: tenants, invoices, disputes, tickets

---

## 6) Competitive Feature Analysis (Benchmarks)

Reference Patterns (Stripe, Intercom, HubSpot, Chargebee):
- Actionable dashboards with alert queues → add Provider Action Center
- Revenue intelligence: NRR, cohort retention, expansion/churn waterfall → implement Revenue Intelligence v1
- Customer success: health scores, playbooks, timelines, tasks → add Client Success Workspace
- Guided onboarding: checklists, integration status → build Tenant Onboarding
- Exports/schedules: weekly PDFs/emails for leadership → add scheduled reports

---

## 7) Complete Feature Inventory (Provider Portal)

Status key: ✅ Functional, ⚠️ Incomplete/Misaligned, ❌ Missing
- Overview/Dashboard: ✅
- Tenant Health: ✅
- Leads (with disputes/reclassify/quality/bulk): ✅
- Analytics: ⚠️ confirm data sources
- API Usage: ⚠️ complete table, modal, trends, CSV
- Revenue Intelligence: ⚠️ implement v1
- Billing: ✅
- Invoices: ✅
- Subscriptions: ✅
- Monetization: ✅
- Incidents (Support): ✅ (enhance SLA & bulk)
- Federation (Integrations): ✅ (enhance)
- Branding (White‑Label): ✅
- Compliance (Security): ✅
- Provisioning → Tenant Onboarding: ⚠️ redesign
- Action Center: ❌
- Client Success Workspace: ❌

---

## 8) Implementation Blueprint (next 2–3 weeks)

Week 1 (Operational wins)
- Tenant Onboarding: server + client + service; replace infra copy; add checklists
- Provider Action Center: server endpoint to aggregate queues; client with filters/actions
- UX Language Refresh: nav labels + key copy updates

Week 2 (Revenue & Success)
- Revenue Intelligence v1: KPIs, forecast, cohorts, waterfall
- Client Success Workspace: Account 360, playbooks, tasks, timeline
- Analytics data sources: wire to services; remove mocks

Week 3 (Scale & Polish)
- API Usage completion: table + modal + trends + CSV
- Incident & Federation enhancements (bulk, health)
- Scheduled reports (email)

Guardrails (run after each batch)
- npm run typecheck; npm run build; tests; UX smoke

---

## 9) Risks & Mitigations
- Misaligned copy confuses business users → Perform language refresh early (Week 1)
- Analytics accuracy → Prioritize service-backed endpoints; add snapshot jobs
- Fragmented workflows → Introduce Action Center to unify operations
- Adoption gaps by trade → Provide trade-specific onboarding templates

---

## 10) Acceptance Criteria (Phase 1 completion)
- Navigation: “Tenant Onboarding” and “Action Center” live
- Action Center shows at least: disputes pending, overdue invoices, expiring subs, at‑risk tenants, SLA breaches; each item is actionable
- Revenue Intelligence v1: MRR/ARR, NRR, cohorts, simple forecast, waterfall
- Client Success Workspace: Account 360 + tasks + playbooks + timeline
- Zero TypeScript errors; build passes; no broken links; UX language updated

---

## 11) Appendices (Artifacts & References)
- Handoff: HANDOFF_DOCUMENT.md
- Prior audit: PROVIDER_PORTAL_AUDIT_REPORT.md
- Fixes summary: PROVIDER_PORTAL_AUDIT_FIXES_COMPLETE.md
- Code locations: apps/provider-portal/src/app/* and src/services/provider/*

— End of Plan —
