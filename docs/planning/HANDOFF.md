# HANDOFF

You are entering the Cortiware repo fresh. This document tells you exactly where to start and how to verify progress.

Current State
- Phase-1 implementation complete; tests all green (49/49)
- Core artifacts for planning are under docs/planning/

Start Here
1) Read docs/planning/ROADMAP.md for the big picture
2) Read docs/planning/ARCHITECTURE.md and docs/planning/DEPENDENCIES.md
3) Follow the checklists in docs/planning/IMPLEMENTATION_CHECKLISTS.md starting from Phase-2

Verification
- Run: `npm run test:unit` — should be green after each batch
- Importers:
  - `node importers/excel/import_assets.mjs templates/assets.csv demo` → `out/assets.import.json`
  - `node importers/excel/import_landfills.mjs templates/landfills.csv` → `out/landfills.import.json`
- Settlement:
  - `npx tsx scripts/agreements/settle_charges.ts scripts/agreements/samples/charges.json` → out/charges.result.json (402 when wallet empty)

Constraints
- No new HTTP routes; 36-route cap must stay enforced
- Wallet/HTTP 402 for all costed actions
- Default to local/open implementations (provider ≤ $100/mo baseline)

CI & Contracts
- Use scripts/generate-contract-snapshot.js and scripts/diff-contracts.js
- Keep snapshots stable and avoid breaking removals

Where to Ask Questions
- Cross-reference artifacts in docs/planning/*. All needed context is self-contained.

