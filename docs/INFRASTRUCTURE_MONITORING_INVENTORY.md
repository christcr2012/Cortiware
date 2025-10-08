# Infrastructure Monitoring — Service Inventory

Date: ${new Date().toISOString()}

This inventory lists all usage-priced services in the Cortiware stack and their current monitoring status.

## Legend
- ✅ Implemented and collecting metrics
- 🟨 Planned (schema in place; implementation pending)
- ⏳ Not applicable or deferred

## Services

- Vercel KV (Redis)
  - Status: ✅ (storage MB, commands/day, connections, latency)
  - Monitor: apps/provider-portal/src/services/infrastructure/vercel-kv-monitor.ts
  - Limits seeded: STORAGE_MB:30 (free), COMMANDS_PER_DAY:10000 (free)

- Vercel Platform (Build/Functions/Bandwidth/Edge/ISR)
  - Status: ✅ (build minutes, function invocations, bandwidth GB, edge req, ISR reads)
  - Monitor: apps/provider-portal/src/services/infrastructure/vercel-platform-monitor.ts
  - Limits seeded: BUILD_MINUTES:6000 (pro), INVOCATIONS:1,000,000 (pro), BANDWIDTH_GB:1000 (pro)

- Neon Postgres (Vercel Postgres)
  - Status: ✅ (storage GB, connections, latency ms)
  - Monitor: apps/provider-portal/src/services/infrastructure/neon-postgres-monitor.ts
  - Limits seeded: STORAGE_GB:1 (hobby), CONNECTIONS:20 (hobby)

- AI Usage (OpenAI costs + credits budget)
  - Status: ✅ (COST_USD aggregate per month, AI credits USAGE_PERCENT vs budget)
  - Monitor: apps/provider-portal/src/services/infrastructure/ai-usage-monitor.ts
  - Limits seeded: COST_USD:50 (budget soft cap), USAGE_PERCENT:100 (hard cap)

- Future (Anthropic, SMS, Maps, Email)
  - Status: 🟨 placeholders in schema; add when integrated

## Notes
- Cron job /api/cron/collect-metrics runs every 15 minutes (vercel.json)
- Recommendation engine consumes metrics to generate upgrade suggestions
- Dashboard at /provider/infrastructure now shows trends and export CSV

