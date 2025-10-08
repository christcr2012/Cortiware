# Cortiware Import Assistant — v4.1U (DB-backed, deployment-ready)
Generated: 2025-10-08 16:28:43

**This overlay replaces the stubs with production DB reads/writes.**
Extract at the **root** of Cortiware v4.1U. Then:
1) Install API deps (adds `pg`): `pnpm --filter @cortiware/api add pg`
2) Run migration: `psql $DATABASE_URL -f DB/migrations/2025_10_08_imports.sql`
3) Register routes in `services/api/src/server.ts` using the two patches:
   - `src/server.import.patch`
   - `src/server.provider.patch`
4) Start API/Admin/Worker. Admin → Imports / Provider Analytics / Monetization.

Environment:
- DATABASE_URL, REDIS_URL, JWT_SECRET already in your monorepo `.env`.
- Optional S3 for file storage (not required for these endpoints).

Tables created:
- imp_runs, imp_summaries, imp_suggestions, imp_overrides, imp_results, imp_costs
- provider_import_pricing (global provider pricing controls)
- tenant_wallets (per-tenant wallet for AI features)

Provider controls (in-app):
- Set retail cents for Light/Standard/Complex tiers.
- Analytics view (per day: imports, AI$, Infra$, Billed$).
