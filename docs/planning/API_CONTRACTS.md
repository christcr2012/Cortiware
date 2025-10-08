# API & Job Contracts (Phase-2+)

No new HTTP routes are introduced. This doc specifies contracts for internal scripts/jobs and clarifies expectations for existing routes.

Cross-refs: ./DATA_MODELS.md, ./TEST_PLANS.md, ./IMPLEMENTATION_CHECKLISTS.md

## Internal Job/Script Contracts

### Settlement Glue (scripts/agreements/settle_charges.ts)
- Input: AgreementCharges JSON (see DATA_MODELS.md)
- Behavior: wallet-first debit; else 402 invoice payload
- Output: out/charges.result.json

OpenAPI-like (pseudo):
````json
{
  "operationId": "settleCharges",
  "requestBody": { "$ref": "./DATA_MODELS.md#agreement-charges" },
  "responses": {
    "200": { "description": "Wallet debit success", "content": { "application/json": {} } },
    "402": { "description": "Payment required", "content": { "application/json": { "schema": { "type": "object", "properties": { "invoice": { "type": "object" } } } } } }
  }
}
````

### Importers
- Excel/CSV Assets: importers/excel/import_assets.mjs
  - Input: CSV/XLSX header: id,type,size,idTag
  - Output: out/assets.import.json (array)
- Excel/CSV Landfills: importers/excel/import_landfills.mjs
  - Input: id,name,lat,lon,accepts (csv or xlsx)
  - Output: out/landfills.import.json (array)
- AllyPro Intake: importers/allypro/allypro_to_corti.mjs
  - Input dir: importers/allypro/inbox/*
  - Outputs: out/allypro.assets.json, out/allypro.stops.json, out/allypro.facilities.json, out/allypro.customers.json
- Routeware Intake: importers/routeware/routeware_to_corti.mjs
  - Input dir: importers/routeware/inbox/*
  - Outputs: out/routeware.assets.json, out/routeware.stops.json, out/routeware.facilities.json

## Existing HTTP Routes (Clarifications)
- Guardrails: withRateLimit presets; withIdempotencyRequired; wallet/402 must be enforced by downstream costed actions (not routes directly)
- Onboarding endpoints must avoid paid providers by default; Stripe paths only when configured

## Contract Snapshots
- Continue using scripts/generate-contract-snapshot.js and scripts/diff-contracts.js; ensure no breaking removals

