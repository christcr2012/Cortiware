## Cortiware Phase-1 Implementation Plan (Binder v3.5)

Scope summary (A–F):
- Verticals: ensure registry includes cleaning, appliance-rental, concrete-leveling, fencing, roll-off, port-a-john; wire port-a-john pack (forms, pricebook, estimator) and keep index stable.
- Routing: implement packages/routing/src/engine.ts with planSimple (nearest neighbor, capacity-based dump insertion) and chooseLandfill (filter by material, least-detour, allow preferred ID). Add unit tests.
- Agreements: add example AGREEMENTS_examples/rolloff_grace_30days.json. Settlement glue: convert evaluated charges into wallet debits or invoice payload; no new HTTP routes.
- Seeds & Templates: dev dataset from SEEDS/assets_landfills.json; CSV templates in /templates.
- Importers: Excel/XLSX/CSV, Routeware, AllyPro scripts that write out/*.json and log counts.
- Guardrails: wallet/HTTP 402 for costed actions; no new endpoints; stubs only for compliance; RLS smoke placeholder if DB present.

---

Tasks & File Map

1) Verticals registry and port-a-john wiring
- Create: packages/verticals/src/index.ts
  - Export types: VerticalPack, EstimateResult
  - Export registry object with keys: cleaning, appliance-rental, concrete-leveling, fencing, roll-off, port-a-john
  - For missing packs, provide minimal placeholders in index.ts (title-only) to keep index stable
- Move/link: packages/verticals/src/packs/port-a-john.ts (source content from docs/Execute/packages/verticals/src/packs/port-a-john.ts) and export via index.ts

2) Routing engine
- Create: packages/routing/src/engine.ts (copy+adapt from docs/Execute/packages/routing/src/engine.ts)
  - planSimple(route, landfills): nearest-neighbor ordering; decrement capacity on pickup/exchange; when capacity <= 0, auto-insert dump stop at landfill from chooseLandfill; reset capacity
  - chooseLandfill(stop, landfills, route): filter by material (accepts[]); prefer stop.preferredLandfillId if provided and matches; otherwise pick least-detour (closest to stop for phase-1)

3) Agreements settlement glue
- Create: scripts/agreements/settle_charges.ts
  - Input: charges[] JSON (lines: {sku, qty, unit_cents?}, orgId, wallet {balance_cents})
  - Behavior: if wallet has sufficient balance → produce debit record and reduced wallet balance; else generate HTTP 402-compliant invoice payload (do not POST by default; dry-run output)
  - Output: writes out/charges.result.json; logs a summary
- Add example sample at scripts/agreements/samples/charges.json (small dataset)

4) Importers (out-of-the-box)
- Create/move to repo root:
  - importers/excel/import_assets.mjs (from docs/Execute)
  - importers/excel/import_landfills.mjs
  - importers/routeware/routeware_to_corti.mjs
  - importers/allypro/allypro_to_corti.mjs
- Ensure each writes out/*.json and logs counts; no external calls

5) Seeds & Templates
- Keep: SEEDS/assets_landfills.json (from docs/Execute/SEEDS)
- Create: templates/
  - templates/assets.csv: id,type,size,idTag
  - templates/landfills.csv: id,name,lat,lon,accepts
  - templates/allypro.assets.csv, templates/allypro.stops.csv, templates/allypro.facilities.csv, templates/allypro.customers.csv (headers only)
- Optional seed loader (if Prisma dev DB available): scripts/seeds/load_assets_landfills.ts (reads SEEDS/assets_landfills.json and prints/validates; no writes by default)

6) Tests (Unit)
- Create: tests/unit/routing.test.ts
  - Asserts:
    1. Capacity-triggered dump insertion after pickups/exchanges
    2. Landfill choice among candidates respects material filter; falls back to closest when multiple
- Create: tests/unit/agreements_rolloff.test.ts
  - Asserts:
    1. Idle-days → no fees at ≤30 days
    2. Fees accrue starting day 31 at configured daily amount
- Update: tests/unit/run.ts to import and run both tests via their exported run() methods

7) Guardrails & DX
- Ensure no new HTTP routes added; use only scripts/modules
- Document commands in README:
  - pnpm test (or npm test)
  - node importers/excel/import_assets.mjs templates/assets.csv demo-fleet
  - node importers/allypro/allypro_to_corti.mjs (ensure out/*.json)
  - tsx scripts/agreements/settle_charges.ts scripts/agreements/samples/charges.json (outputs 402 when wallet empty)
- RLS smoke placeholder: scripts/smoke/rls.ts printing a message if Prisma not configured

---

Acceptance Criteria Mapping
- AC1 (tests pass): Implement tests/unit/routing.test.ts and tests/unit/agreements_rolloff.test.ts; update tests/unit/run.ts to include them
- AC2 (assets importer): Run `node importers/excel/import_assets.mjs templates/assets.csv demo-fleet` → out/assets.import.json with 2+ assets
- AC3 (AllyPro importer): Run `node importers/allypro/allypro_to_corti.mjs` → out/allypro.*.json
- AC4 (settlement glue): Provide sample charges.json and run settle_charges; when wallet empty → output 402-compliant payload; no new routes
- AC5 (no route sprawl): No new API endpoints; 36-route cap check remains untouched (contracts scripts intact)
- AC6 (docs/cost): README additions for commands, seed preview; default to local/offline and dry-run invoice outputs; no paid services by default

---

Test List (names and assertions)
1) tests/unit/routing.test.ts
   - test('inserts dump stop when capacity hits zero')
   - test('chooseLandfill respects material and picks nearest candidate')
2) tests/unit/agreements_rolloff.test.ts
   - test('no fees for ≤30 idle days')
   - test('fees accrue starting day 31')

---

Risk & Rollback Notes
- Importer dependencies: xlsx and csv-parse are required; if missing, document installation or run CSV-only paths. Scripts designed to fail-fast with clear usage lines.
- Monorepo packages: creating packages/verticals and packages/routing adds source-only modules; they are referenced only by tests/scripts, not exposed as routes.
- Contracts & route cap: existing scripts remain unchanged; no new Next.js API routes are added.
- DB presence optional: seed loader and RLS smoke are no-ops if Prisma not configured; safe dry-run behavior.
- Rollback: delete new files/directories and revert tests/unit/run.ts import lines.

---

36-route cap confirmation
- No new HTTP endpoints will be added in this phase.
- All implementation is behind scripts and packages; CI contract snapshot/checks remain unchanged.

