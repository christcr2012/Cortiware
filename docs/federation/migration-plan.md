# Federation Migration Plan

## Current State
- Provider/Developer auth: environment-based; isolated from tenant auth
- App Router handlers exist for auth cookies per audience

## Target State
- Federation layer exposing provider/dev APIs with guardrails and entitlements
- OIDC-capable auth wrappers; minimal route churn from MVP

## Steps
1) Introduce federation docs and route namespaces (`/api/fed/*`)
2) Implement GET-only MVP for providers, then developers
3) Add entitlements and audit stubs
4) Prepare OIDC configuration and docs; keep env-based in parallel
5) Cutover to OIDC when ready; remove env-based credentials gradually

## Rollback
- MVP routes are additive; disable via config if needed
- Keep env-based auth paths until OIDC proven in staging

