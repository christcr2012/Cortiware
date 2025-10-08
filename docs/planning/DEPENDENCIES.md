# Dependency Graph & Critical Path

Cross-refs: ./ROADMAP.md, ./ARCHITECTURE.md

## Mermaid Dependency Graph
```mermaid
graph TD
  P1[Phase-2 Packs+Importers] --> P3[Phase-3 Agreements+Wallet]
  P1 --> P4[Phase-4 Routing Opt]
  P3 --> P5[Phase-5 UX Wiring]
  P4 --> P5
  P5 --> P6[Phase-6 Cost+RouteCap]
  P6 --> P7[Phase-7 GTM+Migrations]
```

## Critical Path
1. Phase-2: finalize stable data shapes for packs/importers
2. Phase-3: implement agreements eval + wallet settlement (relies on stable shapes)
3. Phase-4: routing optimization (independent but benefits from Phase-2 catalogs)
4. Phase-5: UX wiring consuming outputs from Phases 2-4
5. Phase-6: cost guards + route cap verification across the whole system
6. Phase-7: migration templates after models stabilize

## Blockers & Decision Points
- DB model alignment for wallet and agreements (DATA_MODELS.md)
- Perf thresholds for routing (TEST_PLANS.md)
- CI time budgets and caching strategy

