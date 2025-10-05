# Federation Roadmap (6-week plan)

Milestones with responsibilities split (GPT‑5 vs Sonnet 4.5) and acceptance.

## M0 (Week 0): Foundations
- GPT‑5: Author docs (overview, architecture), extend middleware design, seed contract skeletons
- Sonnet: Review and annotate TODOs for OIDC/Prisma touchpoints
- Acceptance: Typecheck green, docs reviewed

## M1 (Week 1–2): Provider Federation MVP
- GPT‑5: Implement /api/fed/providers/* GET stubs, wrapper guards
- Sonnet: Wire service calls to Prisma (read-only), add unit tests
- Acceptance: E2E smoke passes; 401/429 covered

## M2 (Week 2–3): Developer Federation MVP
- GPT‑5: Implement /api/fed/developers/* GET stubs; contracts
- Sonnet: Services + tests
- Acceptance: E2E smoke passes

## M3 (Week 3–4): Entitlements & Audit
- GPT‑5: Define entitlement model and checks; audit stubs
- Sonnet: Prisma schema + persistence + tests
- Acceptance: 403 coverage; audit entries visible in logs

## M4 (Week 4–5): OIDC Upgrade Readiness
- GPT‑5: Config toggles, .env.example updates, docs for IdP integration
- Sonnet: Prototype OIDC provider integration (behind flag)
- Acceptance: Dual-mode doc verified; no route churn required

## M5 (Week 6): Rollout & Migration
- GPT‑5: Migrate docs and scripts; finalize contract snapshot for v1
- Sonnet: Execute cutover; CI green
- Acceptance: UX smoke checklist green across portals

