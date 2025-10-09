# Emergency Access Runbook (Provider/Developer)

This runbook documents how to use Cortiware's emergency access portals to log in directly to a tenant when the federation portal is unavailable.

## Overview
- Dedicated portals (tenant-app):
  - /emergency/provider — Provider emergency login
  - /emergency/developer — Developer emergency login
- Endpoint: POST /api/auth/emergency (rate-limited + IP allowlist + audit logging)
- Post-login flow: Tenant selection (/emergency/tenants) → Emergency Dashboard
- Session scope: Short-lived cookies (30 minutes), emergency flag cookie

## Preconditions
- EMERGENCY_LOGIN_ENABLED=true in tenant-app environments
- Bcrypt hashes configured:
  - PROVIDER_ADMIN_PASSWORD_HASH
  - DEVELOPER_ADMIN_PASSWORD_HASH
- Strong allowlist recommended:
  - EMERGENCY_IP_ALLOWLIST=1.2.3.4,5.6.7.8
- Optional TOTP (recommended):
  - PROVIDER_TOTP_SECRET
  - DEVELOPER_TOTP_SECRET

## How to Use
1. Navigate to the appropriate portal
   - Provider: https://<tenant-app-domain>/emergency/provider
   - Developer: https://<tenant-app-domain>/emergency/developer
2. Enter email + emergency password
3. Enter TOTP code (if required)
4. After success, select tenant on /emergency/tenants
5. Review audit info on /emergency/dashboard

## Security Controls
- Feature flag: EMERGENCY_LOGIN_ENABLED
- IP allowlist: EMERGENCY_IP_ALLOWLIST
- Rate limiting: strict category "auth-emergency"
- TOTP: required if *PROVIDER_TOTP_SECRET* or *DEVELOPER_TOTP_SECRET* is set
- Audit logging: every attempt (success/failure) with IP + UA + tenant
- Session: 30-minute HttpOnly cookies; SameSite=Strict; visible banner

## Audit Expectations
- Emergency access is logged via logEmergencyAccess(...)
- Tenant selection is logged with actor + tenantId
- Use logs to compile compliance reports if needed

## Incident Guardrails
- Rotate emergency passwords immediately after an incident
- Review audit logs for all emergency usage
- Keep IP allowlist minimal and time-bound

## Disable After Use
- Set EMERGENCY_LOGIN_ENABLED=false once the federation portal is restored
- Remove TOTP secrets from the environment if not needed

## Environment Variables
```
# Required
EMERGENCY_LOGIN_ENABLED=true
PROVIDER_ADMIN_PASSWORD_HASH="<bcrypt hash>"
DEVELOPER_ADMIN_PASSWORD_HASH="<bcrypt hash>"

# Recommended
EMERGENCY_IP_ALLOWLIST="203.0.113.10,203.0.113.11"

# Optional but recommended
PROVIDER_TOTP_SECRET="KZXW6YTBMFXG6==="
DEVELOPER_TOTP_SECRET="KB2W6YTBMFY62==="
```

## Support
Contact Security Engineering if access fails due to rate limit or IP allowlist. Provide correlation time and IP address for triage.

