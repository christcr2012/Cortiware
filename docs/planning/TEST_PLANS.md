# Test Strategy & Plans (Phase-2+)

Cross-refs: ./ROADMAP.md, ./IMPLEMENTATION_CHECKLISTS.md, ./DATA_MODELS.md

Principles
- Smallest-scope runs first (unit → integration → e2e smoke)
- CI green required; no external paid services by default
- Enforce 36-route cap & 402 behavior

Phase-2
- Unit: verticals pack estimators (port-a-john + placeholders stable export)
- Integration: importers round-trip → golden JSON comparisons
- Smoke: CLI run of all importers on templates

Phase-3
- Unit: agreement rule eval math; wallet debit function
- Integration: settlement glue → 402 vs wallet debit branching
- Contract: invoice payload JSON shape compared to schema

Phase-4
- Unit: routing heuristics + landfill preference override
- Property tests: capacity simulation invariants (no negative cap)

Phase-5
- UX smoke (no new routes): basic flows load; 429/402 handling banners present

Phase-6
- Contract snapshot & route cap checks remain green
- Perf budget smoke: routing on 1k stops finishes < X sec locally

Phase-7
- Migration dry-run tests; checksum verification of transformations

Verification Commands (examples)
- npm run test:unit
- node importers/excel/import_assets.mjs templates/assets.csv demo
- npx tsx scripts/agreements/settle_charges.ts scripts/agreements/samples/charges.json

Acceptance Checklists
- Defined per phase in ./IMPLEMENTATION_CHECKLISTS.md

