# Integration with Client-Side Multitenant System

This document defines boundaries and integration points between the Tenant (client) system and the Federation layer (provider/developer).

## Principles
- Hard separation: No cross-session reuse; distinct cookies and middleware
- Org scoping: Tenant data always constrained by `orgId`; federation may cross orgs only via entitlements
- Contract discipline: Both layers use the same JSON envelope; errors standardized

## Data & Identity Mapping
- Tenants: Users belong to an Organization; requests scoped to `orgId`
- Providers/Developers: Operator identities live outside tenant DB; federation services resolve target orgs via IDs
- Mapping tables (Sonnet): `Organization`, `Tenant`, `Membership`, `Entitlement`

## Flows
- Tenant CRUD: continues under `/api/v2/*` with `withTenantAuth`
- Federation Reads: `/api/fed/*` guarded by provider/dev wrappers; return aggregates spanning multiple orgs
- Federation Writes: (later) require entitlements, idempotency, and audit

## UI Composition
- Keep portals separate: Provider/Developer portals distinct apps or Next.js subtrees
- Reuse shared components where safe; avoid importing tenant pages into federation trees

## Eventing (Optional/Future)
- Emit domain events on key actions; provider dashboards subscribe to summaries
- Transport: Webhooks or internal queue; out of scope for MVP

## Migration Strategy
- Add federation routes additively; no tenant route churn
- Gradually expose provider UI once federation endpoints stabilize

## Acceptance
- No tenant endpoint behavior change
- Federation endpoints cannot be accessed with tenant cookies
- Contract snapshot diff shows additive only

