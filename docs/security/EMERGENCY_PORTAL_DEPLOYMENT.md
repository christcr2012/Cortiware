# Emergency Portals: Deployment & Configuration

This guide covers deploying the emergency Provider/Developer portals in the tenant-app and configuring the required environment variables.

## Scope
- App: apps/tenant-app
- Routes:
  - /emergency/provider (login form)
  - /emergency/developer (login form)
  - /emergency/tenants (tenant selection)
  - /emergency/dashboard (read-only view)
  - POST /api/auth/emergency (auth)
  - POST /api/emergency/select-tenant (set active tenant)

## Prerequisites
- Prisma schema generated and database reachable
- Vercel project configured for apps/tenant-app

## Environment Variables (tenant-app)
Required:
- EMERGENCY_LOGIN_ENABLED=true
- PROVIDER_ADMIN_PASSWORD_HASH
- DEVELOPER_ADMIN_PASSWORD_HASH

Recommended:
- EMERGENCY_IP_ALLOWLIST="203.0.113.10,203.0.113.11"

Optional (enables TOTP requirement):
- PROVIDER_TOTP_SECRET
- DEVELOPER_TOTP_SECRET

## Steps
1. Set the variables in Vercel (development, preview, production)
2. Redeploy tenant-app
3. Validate endpoints:
   - GET /emergency/provider  page loads
   - POST /api/auth/emergency (invalid creds)  redirect with error
   - POST /api/auth/emergency (valid)  redirect to /emergency/tenants
   - POST /api/emergency/select-tenant  sets rs_active_tenant cookie and redirects to /emergency/dashboard

## Security Review Checklist
- [ ] EMERGENCY_LOGIN_ENABLED=false by default in all envs
- [ ] TOTP secrets set for Provider and Developer
- [ ] IP allowlist configured for office/VPN IPs
- [ ] Rate limiting confirmed (429 after repeated attempts)
- [ ] Cookies are HttpOnly, SameSite=Strict, 30-minute TTL
- [ ] Audit logs observed for success/failure and tenant selection

## Rollback
- Set EMERGENCY_LOGIN_ENABLED=false; redeploy
- Clear emergency cookies from the browser if needed

## Notes
- These portals are intended as break-glass only. Normal operations should use the federation portal.

