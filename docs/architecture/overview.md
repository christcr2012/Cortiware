# Robinson Solutions Platform Architecture (High-Level)

Status: Draft (GPT‑5)
Audience: Architects, Senior Devs; Sonnet implementers

## Goals
- Two-portal separation: Client-side (tenant/accountant/developer/vendors) and Provider-side
- App Router canonical; Pages Router quarantined under `src/_disabled`
- Separation of auth systems (env-based for provider; DB-backed for client-side users)
- Guardrails: rate limiting, idempotency, audience isolation
- RS branding and cookie scheme (`rs_*`) with backward compatibility

## Portal Architecture

### Client-Side Portal (Brand-Configurable Theme)
- **Users:** Tenant users, Accountants, Developers, Vendors
- **Authentication:** Database-backed (User table) for tenants; env-based for accountants/developers
- **Theme:** Configurable per organization (brandConfig)
- **Shell:** `AppShellClient` with dynamic branding
- **Routes:** `/dashboard`, `/leads`, `/contacts`, `/accountant`, `/developer`

### Provider-Side Portal (Masculine Green Theme)
- **Users:** Provider administrators only
- **Authentication:** Environment-based (NOT database)
- **Theme:** Fixed masculine futuristic green theme
- **Shell:** `ProviderShellClient` with green accents
- **Routes:** `/provider`, `/provider/clients`, `/provider/billing`

## Topology
- Next.js 15 App Router app
- PostgreSQL via Prisma (tenant data only)
- (Future) Background queue + audit/event stream (placeholders exist)

## Portals and Audiences
- Tenant: `rs_user` cookie; DB-backed users; RBAC.
- Provider: `rs_provider` cookie; environment-based auth; cross-client context; no DB coupling.
- Developer: `rs_developer` cookie; environment-based auth; admin capabilities; no DB coupling.
- Accountant: `rs_accountant` cookie; environment-based auth; finance-only scope.

## Auth Flows
- App Router endpoints:
  - Tenant: `/api/auth/login|logout` (implemented)
  - Provider: `/api/provider/login|logout` (implemented)
  - Developer: `/api/developer/login|logout` (implemented)
  - Accountant: `/api/accountant/login|logout` (implemented)
- Back-compat cookies accepted during transition: `mv_user`, `provider-session`, `ws_*`.

## API Surfaces (v2)
- Tenant APIs under `/api/v2/*` with RS naming and guardrails
  - `me`, `themes` (implemented)
  - CRM minimum viable: `leads`, `organizations`, `opportunities` (scaffolded to 501)

## Guardrails
- Rate limiting presets: `auth`, `api` (placeholders; to be wired into handlers)
- Idempotency: request header `Idempotency-Key` on mutating routes (placeholder wrapper)
- Audience isolation: do not allow cross-cookie access between portals; separate shells

## Data Model (minimum viable)
- Organization: id, name, ownerId
- User: id, orgId, email, name, roles (RBAC)
- Lead: id, orgId, createdBy, status, name, contact
- Opportunity: id, orgId, leadId?, stage, amount

(Exact Prisma schema to be finalized during Sonnet’s CRUD pass. Use soft‑deletes and createdAt/updatedAt.)

## Error Model
- JSON envelope: `{ ok: boolean, error?: { code, message, details? }, data?: any }`
- Standard codes: `Unauthorized`, `Forbidden`, `RateLimited`, `Conflict`, `NotFound`, `ValidationError`, `Internal`

## Contract Snapshots
- Maintain `/contracts/current.json` (generated) and `/contracts/previous.json`.
- Diff script must fail on breaking changes; additive allowed.

## UI & Themes
- Provider portal: Futuristic dark with green accents
- Additional 5 themes (planned), selection UI owned by provider; owner-only on tenant side

## Migration/Quarantine
- All legacy Pages router code in `src/_disabled` and excluded in `tsconfig.json`.
- Do not re‑enable Pages Router. Rebuild required endpoints under App Router only.

## Security Notes
- HttpOnly cookies; SameSite=Lax; `Secure` in production
- No DB access for provider/developer/accountant auth
- Tenant RBAC enforced at service layer once implemented

