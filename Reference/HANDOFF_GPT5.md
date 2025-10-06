# GPT‑5 Handoff (Provider Ops + AI Monetization)

Scope
- Continue building Provider operations center across streams: Leads, AI, Subscriptions, Usage, Add‑ons, Incidents, Billing, Analytics, Audit, Federation tools

Current State (done)
- Real data dashboards for Provider/Developer/Accountant
- Provider pages: /provider/leads (summary+table), /provider/ai (KPI+top orgs+recent)
- Services: provider/leads.service.ts, provider/ai.service.ts
- Navigation updated (Leads, AI). Typecheck/build passing

Authoritative Docs to Read First
- Reference/Provider/PROVIDER_OPERATIONS_BLUEPRINT.md (architecture, schemas, contracts)
- Reference/Provider/SONNET_45_BUILD_PLAN.md (task list, acceptance, paths)

Immediate Next (suggested order)
1) Billing reconciliation (all streams), unbilled converted leads; AI credits vs usage
2) Subscriptions (MRR/ARR/churn), Usage rating, Add‑ons purchases
3) Incidents (SLA/escalations), Analytics (trends/funnels), Audit feed, Federation tools

Guardrails
- App Router canonical; strict audience separation (Provider/Developer/Accountant vs Client RBAC)
- Ingestion routes compose: RateLimit → Idempotency → HMAC → Audit
- Theme via CSS variables only (no hardcoded colors)

Verification
- npm run typecheck && npm run build
- Pages load: /provider, /provider/leads, /provider/ai (no 500s)

Pointers
- Prisma AI monetization: AiUsageEvent, AiMonthlySummary; Org.ai* fields
- Use '@/lib/prisma'; KV/Redis for idempotency/nonce/rate limit
- Billing surfaces: revenue by stream via Invoice/Payment/BillingLedger

Start Here
- Read both docs above, then proceed with SONNET_45_BUILD_PLAN.md tasks.

