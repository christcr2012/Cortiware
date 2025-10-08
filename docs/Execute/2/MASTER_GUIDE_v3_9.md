# Cortiware — Unified Bundle v3.9
Generated: 2025-10-08 01:02:03

SYSTEM_MODE: AUTONOMOUS
DO_NOT_PROMPT_FOR_CONFIRMATION: true
EXECUTION_ORDER:
  1) Wire verticals registry updates
  2) Install and expose Import Wizard UI
  3) Add roofing takeoff prototype and HVAC memberships
  4) Hook monetization agreements and 402 payload
  5) Run acceptance tests

PROTECTED_PATHS: [".git", "node_modules", "dist"]
OUTPUT_PATHS: ["out", "logs"]

## Auto‑Wiring Tasks (for Augment)
- Update `packages/verticals/src/index.ts` to register new/renamed packs including **concrete-lifting-and-leveling** and generic templates.
- Place pack files under `packages/verticals/src/packs/*` (provided here).
- Add Import Wizard UI under `apps/provider-portal/import-wizard/` and mount in provider nav ("Imports"). No new HTTP routes: UI writes files to `out/*.import.json` client-side and calls existing batch jobs.
- Add Roofing Takeoff page under `apps/provider-portal/roofing-takeoff/` (client only) for demos.
- Add HVAC pricebook/memberships under `verticals/hvac/`.
- Connect `/monetization/examples/*` with Agreements engine. Use wallet/402 guard.
- Run `tests/acceptance/*.md.test` with the md-checker (included) to verify parity features present.

STOP_CHECKS:
- Vertical registry compiles and exports new keys.
- Import Wizard page builds.
- No new server routes created (>36 cap avoided).
- Tests pass: estimators + acceptance.

AUTO-ADVANCE:
- If STOP_CHECKS pass: commit/merge v3.9 changes.
