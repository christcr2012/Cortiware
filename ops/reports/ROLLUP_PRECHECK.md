# Cortiware Rollup Pre‑Check (Phase 0)

Date: 2025-10-06
Branch: plan-epic/robinson-cortiware-rollup

## Summary
- Tree status: clean
- Node engine: >= 18 (package.json engines: 22.x) — OK
- Router: App Router primary, legacy Pages under src/_disabled kept
- DB: Prisma + PostgreSQL (DATABASE_URL); local Redis optional
- UI stack present: TailwindCSS, DaisyUI, Flowbite, Tremor, Recharts
- UI stack missing (for plan): shadcn/ui, Radix primitives (to add in Phase 1)

## src/ structure (top level)
- src/app (App Router groups)
- src/app/api (route handlers)
- src/components (shared)
- src/lib (auth, prisma, services, utils)
- src/services (domain services)
- src/server (service impl)
- src/styles (globals, theme.css, theme.ts)
- src/_disabled (legacy Pages remnants; to remain until migration complete)

## App Router groups
- (provider): provider portal shell + pages
- (owner): owner portal
- (developer): developer shell + pages
- (accountant): accountant shell + pages
- (app): tenant/client app shell

## Key provider routes observed
- /provider (dashboard)
- /provider/clients, /provider/analytics, /provider/federation, /provider/monetization,
  /provider/subscriptions, /provider/usage, /provider/addons, /provider/billing,
  /provider/incidents, /provider/audit, /provider/settings, /provider/leads, /provider/metrics

## API route namespaces
- /api/provider/* (analytics, billing, clients, federation, invoices, notifications, monetization)
- /api/owner/* (billing, payment-methods, subscription, usage)
- /api/onboarding/* (accept, accept-public, verify)
- /api/federation/* and /api/fed/* (external federation endpoints)
- /api/v2/* (client APIs)
- /api/webhooks/stripe

## Prisma datasource
- provider: postgresql
- url: env(DATABASE_URL)

## Prisma key models present (subset)
- Org, User (+login history, device fingerprints, recovery, breakglass)
- Lead, Customer, Opportunity, Invoice, Payment
- Activity (timeline), Subscription, UsageMeter, AddonPurchase
- AuditLog
- Monetization: PricePlan, PlanPrice, Offer, Coupon, TenantPriceOverride, GlobalMonetizationConfig,
  OnboardingInvite
- AI usage: AiUsageEvent, AiMonthlySummary
- RBAC: RbacPermission, RbacRole, RbacRolePermission, RbacUserRole
- Provider: ProviderConfig, FederationKey
- Incidents: Incident (+enums)

## UI dependencies (package.json)
- next ^15.1.0, react 18.3
- tailwindcss 3.4, tremor/react, daisyui, flowbite, preline
- recharts ^3.2.1
- prisma/@prisma/client ^6.16
- ioredis 5.8
- stripe/twilio/openai present

## Gaps vs plan
- shadcn/ui + Radix not configured (to add in Phase 1)
- Theme system exists (styles/theme.css & theme.ts) but will be refactored to premium tokens in Phase 1
- Federation UI backed by temp storage in parts; Phase 3 will persist and secure
- Incident page is summary-only; Phase 3 will add full models + CRUD + UI
- Analytics snapshots/caching not implemented; Phase 3 will add daily job and caches

## Next actions (Phase 1 entry)
- Introduce premium theme tokens, ThemeProvider, add shadcn/ui + Radix, write STYLE_GUIDE.md
- Keep minimized footprint; do not re‑expand binders or legacy pages

