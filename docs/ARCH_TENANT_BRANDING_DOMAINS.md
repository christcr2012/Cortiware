# Phase 4 Architecture — Tenant Runtime, Branding, and Custom Domains

Status: Design Spec (GPT‑5). Implementation deferred to Sonnet 4.5.

## Objectives
- Deliver tenant runtime shell (App Router) with per‑tenant theming and domain resolution
- Support tenant subdomains `{tenant}.cortiware.com` and custom domains (`example.com`)
- Safe, auditable custom domain verification flow

## Data Model (Prisma additions)
(Expressed as schema excerpts for reference; do not implement in this step.)

```prisma
model Tenant {
  id           String   @id @default(cuid())
  slug         String   @unique    // subdomain key, e.g. "acme"
  orgId        String
  displayName  String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  org          Org      @relation(fields: [orgId], references: [id])
  domains      TenantDomain[]
  branding     BrandingProfile?
}

model TenantDomain {
  id            String   @id @default(cuid())
  tenantId      String
  hostname      String   @unique // "acme.cortiware.com" or "app.acme.com"
  type          String            // "managed_subdomain" | "custom_domain"
  status        String   @default("pending") // "pending" | "verifying" | "active" | "failed" | "disabled"
  verification  String?           // token or dns value we expect
  verifiedAt    DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  @@index([tenantId, status])
}

model BrandingProfile {
  id            String   @id @default(cuid())
  tenantId      String   @unique
  name          String?  // marketing label
  logoUrl       String?
  faviconUrl    String?
  colorsJson    Json?    // { primary: "#44D1A6", ... }
  tokensJson    Json?    // optional overrides of CSS variables
  typography    String?  // "system" | "inter" | ...
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)
}
```

## Resolution Flow (Requests → Tenant)
1. Identify host from `request.headers.host`
2. Lookup `TenantDomain.hostname == host` (or wildcard `{slug}.cortiware.com`)
3. If found and `status == active`, resolve `tenantId`
4. Load `BrandingProfile` (if exists) and attach to request context
5. Inject theme tokens (see Middleware) and render tenant app
6. If not found or pending:
   - For managed subdomain pending: show setup placeholder
   - For custom domain pending: show verification instructions to owner (if authenticated)

## Managed Subdomains
- On tenant create, provision `slug.cortiware.com`
- DNS: wildcard `*.cortiware.com` points to tenant‑app Vercel project
- Activation in DB marks `{slug}.cortiware.com` as `type = managed_subdomain`, `status = active`

## Custom Domain Verification (Safe Flow)
We avoid premature Vercel API calls until proof of control.

1) Request: Provider or tenant owner POST `/api/provider/tenants/{id}/domains`
   - payload: `{ hostname: "app.acme.com" }`
   - create `TenantDomain` with `type = custom_domain`, `status = pending`, generate `verification` token

2) DNS Step: Instruct user to add TXT record
   - `host: _cortiware-verification.app.acme.com`
   - `value: <verification-token>`

3) Verification Endpoint (server):
   - POST `/api/provider/tenants/{id}/domains/{domainId}/verify`
   - Server does DNS TXT lookup for `_cortiware-verification.<hostname>` and compares
   - On success, set `status = verifying` and call Vercel Domain API to add the domain to the tenant‑app project
   - Poll Vercel until ready; then set `status = active`, `verifiedAt = now()`

4) Failure Paths
   - DNS mismatch or timeout → `status = failed`, return guidance; allow retry
   - Audit events emitted for each step

## Middleware: Theme Injection per Tenant
- At request start, resolve tenant + branding
- Set `<html data-tenant="{slug}" data-theme="premium-dark">` (or chosen)
- Inject CSS custom properties via a small inline `<style>` with overrides from `BrandingProfile.tokensJson`
- Cache branding resolution per hostname (Redis 5‑15m)

## APIs (Provider / Tenant Owner)
- POST `/api/provider/tenants` → create tenant (slug, orgId)
- GET `/api/provider/tenants/:id` → details (domains, branding)
- POST `/api/provider/tenants/:id/domains` → request custom domain
- POST `/api/provider/tenants/:id/domains/:domainId/verify` → trigger verification
- PATCH `/api/provider/tenants/:id/branding` → set branding tokens, logo, typography

All write endpoints wrapped with `withProviderAuth()` (provider) or tenant‑owner auth; additionally `withAudit()` records action and redacts secrets.

## Security & Limits
- Rate limit domain ops (5/min by IP + user)
- Prevent mixed‑tenant host collisions
- Verify hostnames via RFC 1123 rules, punycode normalization
- Enforce CORS policy: only allow expected origins for owner tools

## Observability
- Audit events for domain request, verification success/failure, activation/deactivation
- Metrics: verification latency, failure rate, active custom domains

## Success Gates
- For a sample tenant, `{slug}.cortiware.com` resolves and renders branded UI
- TXT‑based custom domain verification succeeds; Vercel domain ready; HTTPS green lock
- Branding changes reflect within 1 refresh; cached within 5–15 minutes

