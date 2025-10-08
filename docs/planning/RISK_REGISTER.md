# Risk Register & Mitigations (Phase-2+)

Cross-refs: ./ROADMAP.md, ./ARCHITECTURE.md

| ID | Risk | Phase | Impact | Likelihood | Mitigation | Rollback |
|----|------|-------|--------|------------|------------|----------|
| R1 | Route cap exceeded by inadvertent endpoint | All | High | Low | No new routes policy; contract snapshot CI | Revert offending commit; restore previous snapshot |
| R2 | Costed action accidental calls to paid providers | 2-6 | High | Medium | Wallet/402 gates; default to local; feature flags | Disable feature flags; switch to dry-run |
| R3 | Importer schema drift | 2 | Medium | Medium | Golden fixtures; schema validation | Re-generate outputs; update fixtures |
| R4 | Agreement eval bugs cause misbilling | 3 | High | Medium | Unit/integration tests; capped amounts in dev | Disable settlement; emit 402-only |
| R5 | Performance regressions (routing) | 4,6 | Medium | Medium | Benchmarks; property tests; simple heuristics | Revert optimizer changes |
| R6 | Multi-tenant data leakage | All | High | Low | RLS enforcement; isolation tests | Disable feature; sanitize datasets |
| R7 | Flaky CI due to environment | 5-6 | Medium | Medium | Mock providers; pin Node versions; cache deps | Rerun with cache cleared; pin versions |

Notes
- Provider baseline ≤ $100/month requires explicit opt-in for any paid integration.

