# Provider Federation v3+ — Design & Rationale
**Repo:** Cortiware — `apps/provider-portal`  
**Date:** 2025-10-10

## Why this design
- **Versioned API (`/api/v1/federation/*`)**: gives you a stable contract for external integrators while allowing future changes via `/v1.1` headers or `/v2` paths.
- **HMAC with timestamp & path**: matches your original contract (no body in the string to sign), avoids canonicalization bugs, and is trivial to generate from any platform.
- **Replay protection & idempotency**: 5‑minute timestamp window plus per‑POST `Idempotency-Key` means integrators can safely retry without creating duplicate tickets/invoices.
- **Operational—not PII—analytics**: keeps the provider portal focused on platform health and revenue signals while respecting tenant data boundaries.
- **Webhook gateway**: enables provider→client notifications with signed messages, retries, and a DLQ hook—crucial for reliable federated workflows.
- **RBAC & approvals**: separates concerns (provider_admin vs. provider_analyst vs. developer/AI developer); supports JIT elevation and immutable audit to meet compliance expectations.
- **Minimal, explicit edits**: instructions are scoped to precise files and new modules under `src/lib/federation/*` to reduce regression risk in the monorepo.

## Key trade‑offs
- **Body excluded from signature**: preserves your current contract and ease of use; optional `X-Provider-Content-SHA256` can be added in `/v1.1` if stronger integrity is desired.
- **Redis rate‑limit optional**: local/dev runs fine without Redis; production should use Redis for accurate multi-instance limiting.
- **Stripe adapter first**: focuses on a common PSP. The adapter pattern keeps it replaceable if you bring another gateway later.
- **Separate admin APIs**: thin read/write endpoints simplify the dashboard wiring without coupling to federation API contracts.

## Security posture
- **Least privilege**: provider_admin required for writes; analysts read-only.
- **Secrets**: encrypted at rest; never returned in GET responses; one‑time reveal patterns for OIDC client secrets.
- **Audit**: redact sensitive fields; record actor, action, entity, outcome; index by org and time for investigations.
- **SLOs/alerts**: observability is first-class—latency and failure spikes surface fast; 429s are monitored to catch abusive clients.

## Performance
- Minimize DB round trips using Prisma select/aggregate patterns in analytics.
- Use indexes on `(orgId,keyId)`, `escalationId`, and `IdempotencyKey.key` for fast lookups.
- Keep payloads under 1MB; enforce with Next bodyParser and preflight header checks.

## Multi‑tenant considerations
- All federation paths and metrics are **org-scoped**.
- Webhook registrations and client keys are per‑org.
- Billing and analytics aggregate by org with no tenant PII exposure.

## How this aligns with your roadmap
- **Phase 0** gives immediate correctness (the API path mismatch fix), security (wrappers, redactions, rate‑limits), and observability.
- **Phases 1–3** deliver business value (onboarding, action center, revenue intelligence) while the federation platform supports it in parallel.
- The legacy root `src/app/*` is preserved early to avoid deployment risk, then cleanly removed after migration validation.

## Future extensions
- Optional body hash header for internal clients.
- DLQ persistence and operator UI for webhook retries.
- Add canary orchestration hooks so the escalation state machine can trigger progressive delivery automatically.
- Pluggable billing adapters with reconciliation jobs and dispute syncing.