# Provider Portal Build Plan (Post-Completion Roadmap)

Status: Implementation complete and validated (typecheck/build/tests). This plan captures follow-up epics for hardening, persistence, and observability.

## 0. Validation snapshot
- TypeScript: 0 errors
- Build: success
- Unit tests: 42/42 passing
- Manual QA: all provider routes load (dev data is mostly empty)

## 1. Federation persistence & security (Priority: P0)
- Models (Prisma)
  - FederationKey { id, name, hashedKey, createdAt, lastUsedAt, revokedAt, createdBy }
  - OIDCConfig { id, issuer, clientId, clientSecretEncrypted, redirectUri, enabled }
  - ProviderIntegration { id, name, type, status, createdAt, lastSyncAt, configEncrypted }
- API updates: replace in-memory with DB; return stable shapes; add pagination
- Security: hash keys (prefix + one-time display); encrypt secrets at rest; rotate
- Audit: emit events on create/update/revoke; include actor
- Tests: unit + 403/401 negative; rate limit + idempotency

## 2. Incident tracking MVP (Priority: P1)
- Models
  - Incident { id, title, severity, orgId?, status, openedAt, resolvedAt? }
  - IncidentEvent { id, incidentId, at, type, message, actor }
  - SLA { id, severity, targetResponseMins, targetResolveMins }
  - EscalationPolicy { id, name, rulesJson }
- APIs: CRUD + list with filters (status, severity, orgId)
- UI: create/edit, timeline, comments, close/reopen, SLA widgets
- Tests: unit + smoke E2E

## 3. Real analytics pipeline (Priority: P1)
- Aggregations: MRR/ARR, user growth, funnels, top clients/features
- Strategy: read-time queries → daily snapshots via cron (Vercel Cron) → caching (Redis)
- Endpoints: stable schema per chart; export CSV; plan for PDF later
- Tests: snapshot correctness, perf assertions where feasible

## 4. Unified audit logging middleware (Priority: P1)
- Event schema: { ts, actor, actorType, entityType, entityId, action, before?, after?, ip, ua }
- Middleware helpers: withAudit(handler, { entityType, action })
- Apply to all write endpoints (federation, incidents, monetization writes)
- UI: provider audit drill-down (link from entity pages)

## 5. Provider auth conformance + tests (Priority: P1)
- Ensure compose(withProviderAuth()) everywhere under /provider
- Negative-path tests for 401/403
- Verify provider/developer/client isolation

## 6. E2E coverage with Playwright (Priority: P2)
- Nav smoke: sidebar links and page loads
- Clients: open details modal, edit name
- Federation: generate/revoke key happy path
- Analytics: charts visible, export CSV works
- CI config: record video/trace on failure

## 7. Next.js tracing & lockfile hygiene (Priority: P2)
- Add outputFileTracingRoot to next.config.js (repo root)
- Remove stray lockfile in user profile folder

## 8. Billing & dunning hardening (Priority: P2)
- Verify webhook signature handling & retries
- End-to-end PDF generation (HTML→PDF) with sample data
- Dunning queue idempotency and safety guardrails

## Milestones
- M1 (Week 1): Federation P0 + E2E nav smoke + tracing/lockfile fix
- M2 (Week 2): Incidents MVP + Audit middleware + Auth tests
- M3 (Week 3): Analytics snapshots + Billing/dunning hardening + E2E expansion

## Definition of Done
- Green: typecheck, unit tests, build, E2E smoke in CI
- Security: secrets encrypted, tokens non-recoverable, audit on all writes
- Performance: analytics endpoints ≤300ms p95 with cache warm
- Docs: updated API contracts + admin runbooks (rotation, incident playbook)

