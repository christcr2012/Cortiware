# Provider Operations Blueprint (Robinson AI Systems)

Purpose: End-to-end architecture, schemas, contracts, and portal IA to run all revenue streams and future systems from the Provider portal. App Router canonical. Provider/Developer/Accountant separated from client tenants.

## 1) High-level Architecture
- Portals (App Router): Provider (/provider/**), Developer (/developer/**), Accountant (/accountant/**), Client (/dashboard/**)
- Auth separation:
  - Provider/Developer/Accountant: environment/OIDC cookies (no DB users)
  - Client: DB users with RBAC
- Guardrails (wrappers already present): RateLimit → Idempotency → HMAC → Audit
- Data plane:
  - Tenants emit events to federation ingestion (/api/federation/**)
  - Domain tables store normalized records
  - Aggregations for dashboards (Prisma) + KV for counters
- Billing plane:
  - All streams (Leads, Subscriptions, Usage, Add-ons, AI) converge into Invoice/Payment, BillingLedger
- Observability: AuditLog, contract snapshot/diff, diagnostics panel

## 2) Revenue Streams (now and future)
- Leads: generation, conversion, billing per converted lead
- Subscriptions: plan lifecycle (trial/active/canceled), MRR/ARR, churn
- Usage: metered units → rating → invoice lines
- Add-ons: one-off purchases/refunds
- AI: credit-based monetization, hard provider cap, per-feature analytics
- Support/Incidents: SLA compliance, escalations
- Marketplace/Partners (future): rev-share, vendor payouts

## 3) Data Model (Prisma) — Deltas/Confirmations
Existing (confirmed): Lead, Invoice, Payment, BillingLedger, AiUsageEvent, AiMonthlySummary, Org (ai* fields), AuditLog
Add/confirm (proposed minimal set):
- Activity (for cross-entity timelines)
```
model Activity {
  id String @id @default(cuid())
  orgId String
  actorType String // 'system'|'user'|'machine'
  actorId String?
  entityType String // 'lead'|'invoice'|'incident'|...
  entityId String
  action String // 'created'|'updated'|'converted'|...
  meta Json @default("{}")
  createdAt DateTime @default(now())
  org Org @relation(fields: [orgId], references: [id])
  @@index([orgId, entityType, entityId, createdAt])
}
```
- Subscription (if not present)
```
model Subscription {
  id String @id @default(cuid())
  orgId String
  plan String
  status String // trialing|active|past_due|canceled
  startedAt DateTime
  canceledAt DateTime?
  renewsAt DateTime?
  priceCents Int
  meta Json @default("{}")
  org Org @relation(fields: [orgId], references: [id])
  @@index([orgId, status])
}
```
- UsageMeter (records raw units before rating)
```
model UsageMeter {
  id String @id @default(cuid())
  orgId String
  meter String // e.g. 'emails_sent'
  quantity Int
  windowStart DateTime
  windowEnd DateTime
  createdAt DateTime @default(now())
  org Org @relation(fields: [orgId], references: [id])
  @@index([orgId, meter, windowStart])
}
```
- AddonPurchase
```
model AddonPurchase {
  id String @id @default(cuid())
  orgId String
  sku String
  amount Decimal @db.Decimal(12,2)
  status String // purchased|refunded
  purchasedAt DateTime @default(now())
  refundedAt DateTime?
  meta Json @default("{}")
  org Org @relation(fields: [orgId], references: [id])
  @@index([orgId, sku, status])
}
```
- FederationKey (for provider-side HMAC key registry)
```
model FederationKey {
  id String @id @default(cuid())
  tenantId String
  keyId String @unique
  secretHash String
  scope String // 'events'|'usage'
  createdAt DateTime @default(now())
  disabledAt DateTime?
}
```
Note: Idempotency/Nonce stores live in Redis/Vercel KV (not Prisma) with TTL.

## 4) Federation Ingestion Contracts
Endpoint: POST /api/federation/events
- Headers: x-provider-keyid, x-signature, x-nonce, x-timestamp, x-idempotency-key
- Body: { type, tenantId, occurredAt, data }
  - lead.created|lead.converted
  - subscription.created|updated|canceled
  - usage.reported (prefer POST /api/federation/usage)
  - addon.purchased|refunded
  - incident.opened|resolved
  - invoice.issued|paid|refunded
Validation:
- withRateLimit('api'), withIdempotencyRequired(), withHmacAuth(), withAuditLog()
- Canonical string: method + path + keyId + timestamp + nonce + sha256(body)
- Nonce TTL 10m, timestamp skew ±5m
Response: { ok: true, id } | error model with code

Endpoint: POST /api/federation/usage
- Body: [{ tenantId, meter, quantity, windowStart, windowEnd }...]
- Same wrappers and security

## 5) Provider Portal Information Architecture
- Dashboard: KPIs (Clients, Active Users, System Health, Leads, AI Credits, Revenue) → each clickable
- Leads: summary, filters, table, converted/invoiced states, bulk invoice
- AI: KPIs, top orgs, recent events, feature breakdown, alerts (75/90/100%)
- Subscriptions: list, MRR/ARR, churn, upgrades/downgrades
- Usage: meters, rated totals, billable windows
- Add-ons: purchases/refunds by SKU
- Incidents: open/resolved, SLA, escalations
- Billing: invoices/payments by stream, reconciliation, dunning
- Analytics: trends, funnels, cohorts, revenue mix
- Audit: event feed with filters, drill-down
- Federation: key management, webhook logs, replay tools
- Settings: pricing plans, feature flags, themes

## 6) Services Layer (server-only)
- provider/leads.service.ts → summary, list, detail, billing state
- provider/ai.service.ts → overview, per-org breakdown, recent
- provider/subscriptions.service.ts → list, mrr, churn
- provider/usage.service.ts → meters, rating summaries
- provider/addons.service.ts → purchases/refunds
- provider/incidents.service.ts → queues, SLA
- provider/billing.service.ts → revenue by stream, reconciliation gaps

## 7) Billing & Reconciliation Flows
- Leads: converted → LeadInvoiceLine; surface not-yet-invoiced conversions
- Subscriptions: monthly invoice; proration for plan changes
- Usage: nightly rating job → invoice lines by meter
- Add-ons: immediate invoice line or batched
- AI: credit sales vs usage reconciliation (creditsUsed vs remaining)
- Dunning: payment failures → retries → status in Billing

## 8) Background Jobs
- Nightly rating (usage → invoice lines)
- Monthly rollup (AiMonthlySummary already in place)
- Dunning retries
- Cleanup (nonce/idempotency KV TTL)
- Contract snapshot/diff CI (already present)

## 9) Env & Config (simplified)
- Provider: RS_PROVIDER_SECRET, FED_HMAC_KEYS (store), KV_URL/REDIS_URL
- Client: DATABASE_URL, NEXT_PUBLIC_* for UI flags
- AI: OPENAI_API_KEY, AI_MODEL_DEFAULT, AI_BUDGET_DEFAULT_CENTS
- Billing: STRIPE_SECRET_KEY (if Stripe), WEBHOOK_SECRET

## 10) Security & Compliance
- Strict audience separation in routing and auth
- HMAC signed ingestion; replay-protected; idempotent
- Least-privilege for keys; rotating key IDs
- Audit trail for every action/event

## 11) UX & Themes
- Futuristic provider theme + add 5 theme packs as variants
- Error/Loading/Empty patterns consistent across sections

## 12) Testing
- Unit: services per stream; wrappers for 401/403/409/429
- Integration: ingestion → persistence → UI
- E2E: KPI drill-downs, billing reconciliation, AI alerts

## 13) Rollout Plan
- Phase A: Leads + AI (done), Billing surfaces
- Phase B: Subscriptions + Usage + Add-ons
- Phase C: Incidents + Analytics + Audit + Federation tools
- Phase D: Background jobs + dunning + exports

