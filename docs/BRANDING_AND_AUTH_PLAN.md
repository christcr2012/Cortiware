Robinson Solutions Rebrand + Auth Cookie Migration Plan

Scope
- Replace legacy branding (StreamFlow, WorkStream, Mountain Vista) with Robinson Solutions across UI, APIs, and docs
- Standardize cookies and headers to rs_* with a backward-compatible transition window
- Do not change database schema names yet (out of scope here)

Branding
- UI product/company references: "Robinson Solutions"
- Remove all references to: StreamFlow, WorkStream, Mountain Vista
- Default brand name in app shells now Robinson Solutions (tenant shells still support per-tenant brandConfig)

Cookies (canonical → accepted legacy during transition)
- Tenant (client user): rs_user → accept mv_user (legacy), ws_user (legacy)
- Provider: rs_provider → accept provider-session, ws_provider (legacy)
- Developer: rs_developer → accept developer-session, ws_developer (legacy)
- Accountant: rs_accountant → accept accountant-session, ws_accountant (legacy)
- Headers: x-rs-user → accept x-mv-user (legacy)

Implementation Notes (completed in this pass)
- App Router server redirects
  - src/app/page.tsx: added unified hasProvider/hasDeveloper/hasAccountant/hasTenant guards with rs_* + legacy acceptance
  - src/app/(app)/layout.tsx: guard uses rs_user OR mv_user
  - src/app/(provider)/layout.tsx: guard uses rs_provider OR provider-session OR ws_provider
- Login pages
  - src/app/login/page.tsx: display Robinson Solutions; tenant redirect shim
  - src/app/(provider)/login/page.tsx: provider redirect shim
- Shells
  - src/app/(app)/AppShellClient.tsx: default brand name → Robinson Solutions; fixed active() typing
  - src/app/(provider)/ProviderShellClient.tsx: provider brand header → Robinson Solutions; fixed active() typing
  - src/app/(developer)/DeveloperShellClient.tsx: brand header → Robinson Solutions; fixed active() typing
  - src/app/(accountant)/AccountantShellClient.tsx: brand header → Robinson Solutions; fixed active() typing
- Server RBAC extraction
  - src/lib/rbac.ts: read rs_user and x-rs-user, accept legacy mv variants
- Auth API (pages router)
  - src/pages/api/auth/login.ts: set rs_user / rs_provider / rs_developer / rs_accountant; redirects corrected to /developer

Validation
- Build: OK (Next.js build succeeded)
- Typecheck: Many pre-existing issues remain across legacy Pages API modules and missing libs; unrelated to rebrand; tracked separately

Next Steps
1) Update remaining branded UI strings in any other components/pages (search for StreamFlow/WorkStream/Mountain Vista)
2) Provider API auth checks: ensure they look for rs_provider OR federation headers (planned in separate task)
3) Roll forward with App Router-only migration plan (see docs/APP_ROUTER_MIGRATION_PLAN.md)

