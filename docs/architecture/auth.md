# Authentication & Audience Separation

Status: Draft (GPT‑5)

## Cookies
- Tenant: `rs_user` (accept legacy `mv_user`, `ws_user`)
- Provider: `rs_provider` (accept `provider-session`, `ws_provider`)
- Developer: `rs_developer` (accept `developer-session`, `ws_developer`)
- Accountant: `rs_accountant` (accept `accountant-session`, `ws_accountant`)

All cookies: HttpOnly; SameSite=Lax; add `Secure` in production.

## Endpoints
- Tenant: `/api/auth/login` (POST), `/api/auth/logout` (GET/POST)
- Provider: `/api/provider/login` (POST), `/api/provider/logout` (GET/POST)
- Developer: `/api/developer/login` (POST), `/api/developer/logout` (GET/POST)
- Accountant: `/api/accountant/login` (POST), `/api/accountant/logout` (GET/POST)

## Validation
- Tenant: DB‑backed (future). Interim: env‑backed `TENANT_LOGIN_EMAIL/PASSWORD` or `DEV_ACCEPT_ANY_TENANT_LOGIN=true`.
- Provider: `PROVIDER_USERNAME/PASSWORD` or `DEV_ACCEPT_ANY_PROVIDER_LOGIN=true`.
- Developer: `DEVELOPER_USERNAME/PASSWORD` or `DEV_ACCEPT_ANY_DEVELOPER_LOGIN=true`.
- Accountant: `ACCOUNTANT_USERNAME/PASSWORD` or `DEV_ACCEPT_ANY_ACCOUNTANT_LOGIN=true`.

## Audience Isolation
- Never reuse tenant cookie to authorize provider/dev/accountant routes (and vice‑versa).
- Shells and navigation are audience‑specific. Middleware should redirect unauthorized users to the correct login page.

## Next.js 15 specifics
- `cookies()` returns a Promise; await it in handlers and server components.
- `searchParams` in page components is Promise‑typed; await before use.

## TODO (Sonnet)
- Replace tenant env login with DB lookup (Prisma) with secure password handling.
- Implement provider/dev/accountant env management UI in provider portal.
- Add middleware helpers to DRY auth checks across routes.

