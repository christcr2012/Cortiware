# Environment Variables Guide

This document lists all environment variables required for Option C Per-App Auth deployment.

## Shared Variables (Both Apps)

### AUTH_TICKET_HMAC_SECRET
**Required for:** provider-portal, tenant-app  
**Purpose:** HMAC secret for signing and verifying SSO tickets  
**Format:** Strong random string (32+ characters)  
**Example:** `openssl rand -base64 32`  
**Security:** Must be identical in both apps

```bash
AUTH_TICKET_HMAC_SECRET=your-strong-random-secret-here
```

## Provider-Portal Variables

### Provider Authentication

```bash
# Primary provider credentials
PROVIDER_EMAIL=provider@example.com
PROVIDER_PASSWORD=your-secure-password

# Breakglass provider credentials (fallback)
PROVIDER_BREAKGLASS_EMAIL=breakglass-provider@example.com
PROVIDER_BREAKGLASS_PASSWORD=your-breakglass-password

# Provider session secret
PROVIDER_SESSION_SECRET=your-provider-session-secret
```

### Developer Authentication

```bash
# Primary developer credentials
DEVELOPER_EMAIL=developer@example.com
DEVELOPER_PASSWORD=your-secure-password

# Breakglass developer credentials (fallback)
DEVELOPER_BREAKGLASS_EMAIL=breakglass-developer@example.com
DEVELOPER_BREAKGLASS_PASSWORD=your-breakglass-password

# Developer session secret
DEVELOPER_SESSION_SECRET=your-developer-session-secret

# Dev mode flag (ONLY for development)
DEV_ACCEPT_ANY_DEVELOPER_LOGIN=false
```

### Database

```bash
DATABASE_URL=postgresql://user:password@host:5432/database
```

## Tenant-App Variables

### Tenant Cookie Secret

```bash
TENANT_COOKIE_SECRET=your-tenant-cookie-secret
```

### Emergency Access (Provider/Developer)

```bash
# Enable emergency access
EMERGENCY_LOGIN_ENABLED=true

# Bcrypt hashes for emergency access
# Generate with: node scripts/generate-bcrypt-hash.js <password>
PROVIDER_ADMIN_PASSWORD_HASH=$2b$10$ywsP.VuvUKqHuJdHFHl.g.E2WKT1HXsDduq9xr7lUL.7.52WK7P/C
DEVELOPER_ADMIN_PASSWORD_HASH=$2b$10$923jbPJQKdyKQw/NosrNCuLIBiAjGvrgyLog4xFyAAXiRYdiDLlWq

# Optional: IP allowlist for emergency access (comma-separated)
EMERGENCY_IP_ALLOWLIST=1.2.3.4,5.6.7.8
```

### Database

```bash
# Same database as provider-portal
DATABASE_URL=postgresql://user:password@host:5432/database
```

### Dev Mode Flags (ONLY for development)

```bash
DEV_ACCEPT_ANY_TENANT_LOGIN=false
DEV_ACCEPT_ANY_ACCOUNTANT_LOGIN=false
DEV_ACCEPT_ANY_VENDOR_LOGIN=false
```

## Optional Variables

### App URLs (for SSO audience validation)

```bash
# Provider-portal
NEXT_PUBLIC_APP_URL=https://provider-portal.vercel.app

# Tenant-app
NEXT_PUBLIC_APP_URL=https://tenant-app.vercel.app
```

## Vercel Deployment Checklist

### Provider-Portal

1. Add to Vercel environment variables:
   - `AUTH_TICKET_HMAC_SECRET`
   - `PROVIDER_EMAIL`
   - `PROVIDER_PASSWORD`
   - `PROVIDER_BREAKGLASS_EMAIL`
   - `PROVIDER_BREAKGLASS_PASSWORD`
   - `PROVIDER_SESSION_SECRET`
   - `DEVELOPER_EMAIL`
   - `DEVELOPER_PASSWORD`
   - `DEVELOPER_BREAKGLASS_EMAIL`
   - `DEVELOPER_BREAKGLASS_PASSWORD`
   - `DEVELOPER_SESSION_SECRET`
   - `DATABASE_URL`

2. Set environment: Production, Preview, Development (as needed)

### Tenant-App

1. Add to Vercel environment variables:
   - `AUTH_TICKET_HMAC_SECRET` (same value as provider-portal)
   - `TENANT_COOKIE_SECRET`
   - `PROVIDER_ADMIN_PASSWORD_HASH`
   - `DEVELOPER_ADMIN_PASSWORD_HASH`
   - `EMERGENCY_LOGIN_ENABLED=true`
   - `EMERGENCY_IP_ALLOWLIST` (optional)
   - `DATABASE_URL` (same as provider-portal)

2. Set environment: Production, Preview, Development (as needed)

## Security Best Practices

1. **Never commit secrets to git**
2. **Use different secrets for each environment** (dev, staging, production)
3. **Rotate secrets regularly** (at least quarterly)
4. **Use strong random values** for all secrets (32+ characters)
5. **Limit emergency access** to specific IPs when possible
6. **Monitor emergency access logs** closely
7. **Disable dev mode flags** in production

## Generating Secrets

### Random Secret (for HMAC, session secrets)

```bash
openssl rand -base64 32
```

### Bcrypt Password Hash

```bash
node scripts/generate-bcrypt-hash.js <password>
```

## Troubleshooting

### SSO tickets failing

- Verify `AUTH_TICKET_HMAC_SECRET` is identical in both apps
- Check ticket expiry (default 120 seconds)
- Verify audience matches app URL

### Emergency access not working

- Verify `EMERGENCY_LOGIN_ENABLED=true`
- Check bcrypt hashes are correct
- Verify IP is in allowlist (if configured)
- Check rate limiting (3 attempts per hour)

### Database connection issues

- Verify `DATABASE_URL` is correct and accessible
- Check Prisma client is generated
- Verify database migrations are applied

