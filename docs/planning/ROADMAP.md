# Cortiware Master Roadmap (Binder v3.5+)

This document is the source of truth for remaining phases beyond Phase-1. It is self‑contained and references all related plans under ./

Related: ./ARCHITECTURE.md, ./DEPENDENCIES.md, ./DATA_MODELS.md, ./API_CONTRACTS.md, ./TEST_PLANS.md, ./IMPLEMENTATION_CHECKLISTS.md, ./RISK_REGISTER.md, ./HANDOFF.md, ./READY_FOR_SONNET.md

Constraints
- 36-route cap must remain intact; no new HTTP endpoints
- Costed actions must enforce wallet/HTTP 402
- Provider baseline ≤ $100/month; default local/open implementations
- Respect existing CI/CD, contract snapshots, and tests

Phases Overview
- Phase-1 (Complete): Routing core + vertical pack + agreements sample + importers + unit tests
- Phase-2: Vertical packs productionization & Importers hardening
- Phase-3: Agreements engine settlement pipeline & wallet flows
- Phase-4: Routing optimization & dispatcher utilities
- Phase-5: Tenant/Provider UX wiring (no new routes) & CI expansions
- Phase-6: Cost controls & route-cap verification; performance profiling
- Phase-7: Go-to-market enablement & data migration helpers

Milestones
1) M2: Packs+Importers hardened; golden fixtures; smoke CLI
2) M3: Settlement pipeline with wallet-first debit else 402 invoice artifacts
3) M4: Routing optimizer knobs, landfill catalog tools; capacity sim tests
4) M5: UX toggles and smoke flows behind existing routes; CI time ≤ 10 min
5) M6: Cost dashboard (local), 36-route check green, perf budget docs
6) M7: Migration templates, runbooks, and signoff checklist

Deliverables per Phase
- See ./IMPLEMENTATION_CHECKLISTS.md for per-phase, executable checklists
- Tests and acceptance per phase: ./TEST_PLANS.md
- Data models and contracts: ./DATA_MODELS.md, ./API_CONTRACTS.md
- Risks/rollback: ./RISK_REGISTER.md

Verification
- All phases must be independently verifiable via commands (no external services by default)
- Contract snapshots must not regress; route count must not exceed 36

Notes
- This roadmap avoids route sprawl by preferring job scripts, packages/* modules, and CI tooling.
- All costed actions must check wallet or return 402 payloads.

