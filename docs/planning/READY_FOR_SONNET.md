# READY FOR SONNET — Phase-2 Kickoff

This file marks the plan as complete and ready for autonomous implementation (Phase-2).

Implement First (exact order)
1) Packs Productionization
   - Ensure packages/verticals exports stable pack entries for all Phase-1 verticals
   - Add minimal placeholder packs if missing; keep index stable
2) Importers Hardening
   - Add schema validation for CSV/XLSX headers (throw with clear message)
   - Create tests/fixtures/importers/** with small golden inputs and expected JSON
   - Add unit/integration tests to compare outputs against goldens

Verification
- Run `npm run test:unit` — should include new importer tests and remain green
- Run `node importers/excel/import_assets.mjs templates/assets.csv demo` — still outputs out/assets.import.json

Guardrails
- No new HTTP routes
- No paid services by default
- Contract snapshots remain stable

References
- Roadmap: ./ROADMAP.md
- Architecture: ./ARCHITECTURE.md
- Data Models: ./DATA_MODELS.md
- Test Plans: ./TEST_PLANS.md
- Checklists: ./IMPLEMENTATION_CHECKLISTS.md
- Risks: ./RISK_REGISTER.md

