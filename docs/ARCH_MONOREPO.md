# Phase 2 Architecture — Monorepo & Multi‑Domain Deployment

Status: Design Spec (GPT‑5). Implementation deferred to Sonnet 4.5.

## Objectives
- Create a light Turborepo with clear app boundaries and shared packages
- Map company/product domains to proper apps on Vercel
- Keep current minimized footprint; incremental migration, reversible at any point

## Top‑Level Structure
```
/ (repo root)
  turbo.json
  package.json
  apps/
    provider-portal/          # Provider federation/admin (App Router)
    tenant-app/               # Tenant runtime app (App Router)
    marketing-robinson/       # Company site (Robinson AI Systems)
    marketing-cortiware/      # Product site (Cortiware)
  packages/
    ui/                       # Shared UI (buttons, cards, charts, forms)
    config/                   # Tailwind, ESLint, TS, next config helpers
  ops/
    vercel/                   # Project notes, env mapping
    reports/
```

## Packages
- packages/ui
  - Re‑export shadcn/ui primitives + Radix bindings
  - Cortiware design‑system wrappers bound to tokens
- packages/config
  - tailwind preset (tokens + plugin)
  - tsconfig base + app/pack presets
  - eslint shared config

## Turbo Pipeline (example)
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
    "lint": {},
    "typecheck": {},
    "test": { "dependsOn": ["build"], "outputs": ["coverage/**"] }
  }
}
```

## Root package.json Scripts (example)
- dev (parallel): `turbo run dev --parallel`
- build all: `turbo run build`
- typecheck: `turbo run typecheck`
- lint: `turbo run lint`
- test: `turbo run test`

## App Responsibilities
- provider-portal: provider auth, federation admin, billing/analytics (provider view)
- tenant-app: tenant auth, dashboard, CRM stubs, consumes kept APIs
- marketing-robinson: corporate info, careers, provider portal link (/portal)
- marketing-cortiware: product pages, pricing, signup/onboarding

## Domain Routing (Vercel)
- robinsonaisystems.com → marketing-robinson (default)
  - /portal → rewrite to provider-portal
- cortiware.com → marketing-cortiware (default)
  - /app → rewrite to tenant-app
- Tenants: {tenant}.cortiware.com → tenant-app

## Per‑App next.config.js Rewrites (examples)
```ts
// apps/marketing-robinson/next.config.js
module.exports = {
  async rewrites() {
    return [ { source: "/portal/:path*", destination: "https://provider-portal.vercel.app/:path*" } ];
  }
};
```
```ts
// apps/marketing-cortiware/next.config.js
module.exports = {
  async rewrites() {
    return [ { source: "/app/:path*", destination: "https://tenant-app.vercel.app/:path*" } ];
  }
};
```
(Internal deployments can use project‑local rewrites; production uses Vercel project aliases.)

## Vercel Projects
- One project per app; shared env via Vercel env groups where applicable
- Map apex/aliases per app; set wildcard `*.cortiware.com` to tenant‑app

## Environment Strategy
- Shared: OPENAI_API_KEY, STRIPE_SECRET, REDIS_URL (scoped per app when needed)
- Provider app: PROVIDER_SESSION_SECRET, FED_HMAC_MASTER_KEY, OIDC_*
- Tenant app: TENANT_COOKIE_SECRET

## Incremental Migration Plan
1) Create `apps/` + `packages/` skeleton without moving code
2) Extract design tokens to packages/config (no runtime change)
3) Move provider portal into `apps/provider-portal` (preserve routes)
4) Create empty stubs for other apps (hello pages) + CI builds
5) Configure Turbo + root scripts; ensure `turbo run build` passes
6) Vercel: create projects, attach domains, test rewrites
7) Gradually move shared UI into packages/ui; refactor imports

## Rollback Plan
- Each step gated by build + smoke tests
- If build fails post‑move, revert that app move (single directory revert)
- Keep current root app operational until final cutover

## Success Gates
- `turbo run build` green for all apps
- Dev servers run concurrently without port conflicts
- Playwright smoke: marketing → /portal rewrite → provider, marketing → /app rewrite → tenant
- Zero runtime console errors in any app

