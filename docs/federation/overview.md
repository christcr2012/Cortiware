# Federation (FedDocs) Overview

Goal: Evolve Provider/Developer authentication and cross-tenant operations into a formal Federation layer with strong isolation, contracts, and UX. This document introduces vision, scope, and guiding principles.

## Vision
- One Federation authority for provider/dev operators with cross-tenant context
- Zero cross-access between client (tenant), provider, developer, accountant systems
- Standards-aligned identity (OIDC/OAuth2-ready), but initially environment-based for dev
- Contract-first APIs, rate-limited and idempotent by default
- Progressive migration path from today's environment-based provider/dev auth

## Audiences & Portals
- Tenant Portal (clients): app-facing CRM/workflows, cookie `rs_user` (legacy `mv_user`)
- Provider Portal (federation ops): environment-based first, then OIDC; cookie `rs_provider`
- Developer Portal: environment-based first, then OIDC; cookie `rs_developer`
- Accountant Portal: environment-based; cookie `rs_accountant`

## Guiding Principles
- Separation: Physically and logically isolate audiences; no shared sessions
- Least Privilege: Entitlements per role; route-level guardrails
- Idempotency & Rate Limits: POSTs require idempotency; per-audience limits
- Contract Discipline: Stable envelopes, schemas, and contract snapshots
- Incremental Delivery: Ship MVP Federation for ops; migrate providers first, then devs

## Outcomes
- Well-documented contracts and guardrails
- Ready-to-implement build plan and roadmap
- Minimal scaffolding in codebase (non-breaking)

