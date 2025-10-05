# Federation E2E Smoke: How to Run

These are lightweight HTTP checks (no Playwright/Cypress install) to validate federation guardrails.

## Prerequisites
- Node 22+
- A running dev server: `npm run dev` (defaults to http://localhost:5000)

## Environment
- Set `FED_ENABLED=true` in your env or `.env.local` to enable federation endpoints
- Optionally set `BASE_URL` (default `http://localhost:5000`)
- Optionally set `E2E_EXPECT_FED_ENABLED` to `true` or `false` to assert expectations

## Run
- Unit: `npm run test:unit`
- E2E Smoke: `npm run test:e2e`

## What it checks
- /api/fed/providers/tenants and /api/fed/developers/diagnostics
- Without cookies: expect 404 when disabled; 401/200 when enabled
- With cookies (rs_provider / rs_developer): expect 200 or 501 (stubbed) when enabled

Notes
- These tests do not spin up a server; they assume dev server is running in another terminal.
- When Sonnet implements services, diagnostics should return 200 with structured payload.

