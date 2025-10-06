# Vercel Routing & Projects Design (Phase 2)

Status: Design Spec (GPT‑5). Implementation deferred to Sonnet 4.5.

## Projects
- provider-portal (production + preview)
- tenant-app (production + preview)
- marketing-robinson (production + preview)
- marketing-cortiware (production + preview)

## Domains & Mapping
- robinsonaisystems.com → marketing-robinson (default)
  - /portal → rewrite to provider-portal
- cortiware.com → marketing-cortiware (default)
  - /app → rewrite to tenant-app
- *.cortiware.com → tenant-app (wildcard subdomain)
- Custom domains per tenant → tenant-app (verified then attached)

## Example vercel.json (per app)
marketing-robinson/vercel.json
```json
{
  "rewrites": [{ "source": "/portal/:path*", "destination": "https://provider-portal.vercel.app/:path*" }]
}
```
marketing-cortiware/vercel.json
```json
{
  "rewrites": [{ "source": "/app/:path*", "destination": "https://tenant-app.vercel.app/:path*" }]
}
```
tenant-app/vercel.json
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [{ "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }]
    }
  ]
}
```

## Environment Variables
Shared
- OPENAI_API_KEY, STRIPE_SECRET, REDIS_URL

Provider
- PROVIDER_SESSION_SECRET, FED_HMAC_MASTER_KEY, OIDC_*

Tenant
- TENANT_COOKIE_SECRET

## Deployment Notes
- Use Vercel env groups to share secrets across projects where applicable
- Add wildcard domain `*.cortiware.com` to tenant-app project
- Attach custom tenant domains only after TXT verification passes

## Smoke Tests (Playwright)
- robinsonaisystems.com loads; navigate to /portal → provider-portal renders
- cortiware.com loads; navigate to /app → tenant-app renders
- {slug}.cortiware.com renders tenant shell (demo)
- Sample custom domain renders HTTPS after verification

