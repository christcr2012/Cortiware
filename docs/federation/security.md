# Federation Security & Guardrails

## Isolation
- Separate audiences, cookies, and middleware: tenants vs providers vs developers vs accountants
- No cross-access via URL guessing; route-level wrappers

## Authentication
- Phase 1: Environment-based credentials for providers/devs
- Phase 4+: OIDC/OpenID Connect with standard flows (Auth Code + PKCE)

## Authorization / Entitlements
- Role → Entitlement mapping; enforce in service layer
- Deny-by-default; explicit allow lists

## Rate Limiting & Idempotency
- All POSTs require Idempotency-Key
- Per-audience presets (`api`/`auth`) with eventual KV/Redis backend

## Auditing
- Record who did what, where (route), when, and result (ok/error)
- Redact secrets; log correlation IDs

## Secrets & Config
- No secrets in git; `.env.example` documents required keys for OIDC

## Threats (non-exhaustive)
- Session fixation, CSRF, token leakage, elevation of privilege
- Mitigations: SameSite cookies, short TTLs, rotating keys, step-up auth for sensitive ops

