# Federation Architecture

## Components
- Federation AuthN/AuthZ: pluggable identity (env-based → OIDC)
- Federation API: provider/dev ops endpoints, cross-tenant read/write
- Tenant API: client-scoped endpoints (no federation cross-access)
- Shared Guardrails: rateLimit, idempotency, audit
- Data: Provider/Developer identities, Organizations, Tenants, Memberships, Entitlements

## Logical Flow (simplified)
1) Operator signs in to Provider/Developer portal (env-based initially)
2) Portal issues audience-specific cookie and session context
3) Federation API enforces audience, entitlements, and guardrails
4) Actions executed across tenant boundaries per entitlements

## App Router Integration
- Use composable wrappers (withTenantAuth, withRateLimit, withIdempotencyRequired); add `withProviderAuth`, `withDeveloperAuth` for federation routes
- Keep business logic in services; APIs are thin

## Contracts & Snapshots
- Maintain markdown contracts under docs/api/federation/*
- Generate snapshots via scripts/generate-contract-snapshot.js
- Diff in CI to detect breaking changes

## Migration Positioning
- Start with current env-based provider/dev auth; upgrade to OIDC with minimal route churn
- Preserve envelope ({ ok, data | error }) across all portals

