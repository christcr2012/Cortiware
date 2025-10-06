# Cortiware Deployment & Setup Guide

**Last Updated:** 2025-10-06  
**Version:** Phase 1 & Phase 3 (Partial)  
**Status:** Living Document - Updated as features are implemented

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [External Services Setup](#external-services-setup)
4. [Database Setup](#database-setup)
5. [Initial Deployment](#initial-deployment)
6. [Account Creation](#account-creation)
7. [Domain Configuration](#domain-configuration)
8. [Verification & Testing](#verification--testing)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

**Required:**
- Node.js >= 22.x
- npm or pnpm
- PostgreSQL database (Neon recommended)
- Vercel account (for deployment)
- Git

**Optional:**
- Redis (for caching - falls back to in-memory if not configured)
- Stripe account (for billing features)
- SendGrid account (for email)
- Twilio account (for SMS)

---

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

### Database (Required)

```bash
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```

### Session Secrets (Required)

```bash
# Provider portal session secret (generate with: openssl rand -base64 32)
PROVIDER_SESSION_SECRET="your-provider-secret-here"

# Tenant/client session secret
TENANT_COOKIE_SECRET="your-tenant-secret-here"

# Developer portal session secret
DEVELOPER_SESSION_SECRET="your-developer-secret-here"

# Accountant portal session secret
ACCOUNTANT_SESSION_SECRET="your-accountant-secret-here"
```

### Provider Credentials (Required for Provider Portal Access)

```bash
# Environment-based provider authentication
# Format: username:bcrypt_hash
# Generate hash: node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
PROVIDER_CREDENTIALS="admin:$2a$10$your-bcrypt-hash-here"

# Developer credentials (same format)
DEVELOPER_CREDENTIALS="dev:$2a$10$your-bcrypt-hash-here"
```

### Federation (Required for Provider Operations)

```bash
# Master key for HMAC federation (generate with: openssl rand -hex 32)
FED_HMAC_MASTER_KEY="your-federation-master-key-here"
```

### Redis (Optional - Recommended for Production)

```bash
# Redis connection string (optional - falls back to in-memory)
REDIS_URL="redis://default:password@host:6379"
```

### Stripe (Optional - Required for Billing Features)

```bash
# Stripe secret key (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"

# Stripe webhook secret (get from https://dashboard.stripe.com/webhooks)
STRIPE_WEBHOOK_SECRET="whsec_your-webhook-secret"
```

### Email (Optional - Required for Notifications)

```bash
# SendGrid API key (get from https://app.sendgrid.com/settings/api_keys)
SENDGRID_API_KEY="SG.your-sendgrid-api-key"

# From email address
SENDGRID_FROM_EMAIL="noreply@cortiware.com"
```

### SMS (Optional - Required for 2FA/Notifications)

```bash
# Twilio credentials (get from https://console.twilio.com)
TWILIO_ACCOUNT_SID="ACyour-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"
```

### AI Features (Optional - Required for AI Features)

```bash
# OpenAI API key (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY="sk-your-openai-api-key"
```

### OIDC/OAuth (Optional - Required for Federation)

```bash
# OIDC provider configuration (if using external identity provider)
OIDC_ISSUER_URL="https://your-idp.com"
OIDC_CLIENT_ID="your-client-id"
OIDC_CLIENT_SECRET="your-client-secret"
```

### Next.js Configuration

```bash
# Base URL for the application
NEXT_PUBLIC_BASE_URL="http://localhost:5000"

# Environment (development, staging, production)
NODE_ENV="development"
```

---

## External Services Setup

### 1. PostgreSQL Database (Neon - Recommended)

**Steps:**
1. Go to https://neon.tech and create account
2. Create new project: "Cortiware Production"
3. Copy connection string from dashboard
4. Add to `.env.local` as `DATABASE_URL`
5. Run migrations: `npx prisma migrate deploy`
6. Generate Prisma client: `npx prisma generate`

**Alternative: Local PostgreSQL**
```bash
# Install PostgreSQL locally
# Create database: createdb cortiware
# Connection string: postgresql://localhost:5432/cortiware
```

### 2. Stripe (For Billing Features)

**Steps:**
1. Go to https://stripe.com and create account
2. Navigate to Developers → API Keys
3. Copy "Secret key" (starts with `sk_test_` or `sk_live_`)
4. Add to `.env.local` as `STRIPE_SECRET_KEY`
5. Set up webhook:
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Select events: `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy webhook secret and add as `STRIPE_WEBHOOK_SECRET`

### 3. SendGrid (For Email)

**Steps:**
1. Go to https://sendgrid.com and create account
2. Navigate to Settings → API Keys
3. Create new API key with "Full Access"
4. Copy key and add to `.env.local` as `SENDGRID_API_KEY`
5. Verify sender email:
   - Go to Settings → Sender Authentication
   - Verify your domain or single sender email
   - Add verified email as `SENDGRID_FROM_EMAIL`

### 4. Twilio (For SMS - Optional)

**Steps:**
1. Go to https://twilio.com and create account
2. Get phone number from Console → Phone Numbers
3. Copy Account SID and Auth Token from Console Dashboard
4. Add to `.env.local`:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`

### 5. Redis (Optional - Recommended for Production)

**Steps:**
1. **Option A: Upstash (Serverless Redis)**
   - Go to https://upstash.com
   - Create database
   - Copy connection string (starts with `redis://`)
   - Add as `REDIS_URL`

2. **Option B: Local Redis**
   ```bash
   # Install Redis locally
   # macOS: brew install redis
   # Ubuntu: sudo apt install redis-server
   # Start: redis-server
   # Connection: redis://localhost:6379
   ```

### 6. Analytics Snapshot Cron (Optional - Recommended for Production)

**Purpose:** Daily analytics snapshots for MRR/ARR tracking and reporting.

**Vercel Cron Setup:**
1. Create `vercel.json` in project root:
   ```json
   {
     "crons": [{
       "path": "/api/provider/analytics/snapshot",
       "schedule": "0 0 * * *"
     }]
   }
   ```
2. Deploy to Vercel
3. Cron will run daily at midnight UTC

**Manual Trigger (for testing):**
```bash
curl -X POST https://your-domain.com/api/provider/analytics/snapshot \
  -H "Cookie: provider-session=your-session-cookie"
```

---

## Database Setup

### Initial Migration

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Run migrations
npx prisma migrate deploy

# 4. (Optional) Seed initial data
npm run seed
```

### Verify Database

```bash
# Open Prisma Studio to inspect database
npx prisma studio
```

---

## Initial Deployment

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/christcr2012/Cortiware.git
cd Cortiware

# 2. Install dependencies
npm install

# 3. Set up environment variables (see above)
cp .env.example .env.local
# Edit .env.local with your values

# 4. Run database migrations
npx prisma migrate deploy
npx prisma generate

# 5. Start development server
npm run dev

# 6. Open browser to http://localhost:5000
```

### Vercel Deployment

**Steps:**
1. Push code to GitHub
2. Go to https://vercel.com and import project
3. Connect GitHub repository
4. Configure environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.local`
   - Set for Production, Preview, and Development environments
5. Deploy

**Important:** Set `outputFileTracingRoot` in `next.config.js` to silence lockfile warnings:
```js
module.exports = {
  outputFileTracingRoot: __dirname,
  // ... rest of config
}
```

---

## Account Creation

### Provider Account (Environment-Based)

Provider accounts are configured via environment variables, not database.

**Steps:**
1. Generate password hash:
   ```bash
   node -e "console.log(require('bcryptjs').hashSync('your-secure-password', 10))"
   ```

2. Add to `.env.local`:
   ```bash
   PROVIDER_CREDENTIALS="admin:$2a$10$your-bcrypt-hash-here"
   ```

3. Access provider portal:
   - Navigate to `/api/provider/login`
   - Username: `admin`
   - Password: `your-secure-password`

### Developer Account (Environment-Based)

Same process as provider account:
```bash
DEVELOPER_CREDENTIALS="dev:$2a$10$your-bcrypt-hash-here"
```

Access at `/api/developer/login`

### First Tenant/Organization

**Option A: Via Onboarding Flow**
1. Navigate to `/onboarding`
2. Fill out organization details
3. Create owner account
4. Complete setup

**Option B: Via Database Seed**
```bash
npm run seed
# Creates demo organization with test users
```

**Option C: Via Prisma Studio**
1. Open Prisma Studio: `npx prisma studio`
2. Create Org record
3. Create User record with `role: OWNER`
4. Link user to org via `orgId`

---

## Domain Configuration

### Current Status (Phase 1 & 3)

Single-domain deployment. Multi-domain routing will be configured in Phase 2.

**For Now:**
- All portals accessible from single domain
- Provider: `/provider/*`
- Developer: `/developer/*`
- Owner: `/owner/*`
- Tenant: `/dashboard`, `/settings/*`

### Future (Phase 2 - Monorepo)

**robinsonaisystems.com:**
- Marketing site (root)
- Provider portal at `/portal` (rewrite to provider-portal app)

**cortiware.com:**
- Product marketing (root)
- Tenant app at `/app` (rewrite to tenant-app)

**{tenant}.cortiware.com:**
- Wildcard subdomain for tenant isolation
- DNS: `*.cortiware.com` CNAME to Vercel

### Future (Phase 4 - Custom Domains)

**Custom Domain Verification:**
1. Tenant requests custom domain (e.g., `app.acme.com`)
2. System generates verification token
3. Tenant adds TXT record: `_cortiware-verification.app.acme.com` = `token`
4. System verifies DNS record
5. System adds domain to Vercel project via API
6. Domain becomes active with SSL

---

## Verification & Testing

### 1. Provider Portal Access

```bash
# Test provider login
curl -X POST http://localhost:5000/api/provider/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}'

# Should return: { "ok": true, "data": { "user": {...} } }
```

Navigate to `/provider` - should see dashboard.

### 2. Theme System

1. Navigate to any page
2. Open browser DevTools → Console
3. Check for theme attribute: `document.documentElement.getAttribute('data-theme')`
4. Should return `premium-dark` or `premium-light`
5. Test theme toggle (if ThemeToggle component is rendered)

### 3. Database Connection

```bash
# Test Prisma connection
npx prisma db pull

# Should succeed without errors
```

### 4. Federation Keys (Phase 3)

```bash
# Create federation key via API
curl -X POST http://localhost:5000/api/provider/federation/keys \
  -H "Content-Type: application/json" \
  -H "Cookie: provider-session=your-session-cookie" \
  -d '{"tenantId":"test-tenant","scope":"all"}'

# Should return key with secret (save secret - shown only once)
```

### 5. Audit Events

```bash
# Check audit events in database
npx prisma studio
# Navigate to AuditEvent table
# Should see events for federation key creation
```

---

## Troubleshooting

### Issue: "Failed to connect to database"

**Solution:**
- Verify `DATABASE_URL` is correct
- Check database is accessible (firewall, IP whitelist)
- For Neon: ensure connection pooling is enabled
- Test connection: `npx prisma db pull`

### Issue: "Provider login fails"

**Solution:**
- Verify `PROVIDER_CREDENTIALS` format: `username:bcrypt_hash`
- Regenerate bcrypt hash if needed
- Check `PROVIDER_SESSION_SECRET` is set
- Clear browser cookies and try again

### Issue: "Theme not applying"

**Solution:**
- Check `data-theme` attribute on `<html>` element
- Verify `src/styles/theme.css` is imported in `globals.css`
- Clear browser cache
- Check for JavaScript errors in console

### Issue: "Prisma Client not generated"

**Solution:**
```bash
npx prisma generate
# Restart dev server
npm run dev
```

### Issue: "Migration failed"

**Solution:**
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or apply migrations manually
npx prisma migrate deploy
```

### Issue: "Redis connection failed"

**Solution:**
- Redis is optional - app will fall back to in-memory storage
- To fix: verify `REDIS_URL` format
- Test connection: `redis-cli -u $REDIS_URL ping`

---

## Next Steps

After completing this setup:

1. **Phase 3 Completion:**
   - Incident tracking UI
   - OIDC provider configuration
   - Analytics snapshot job

2. **Phase 2 (Monorepo):**
   - Multi-domain routing
   - Separate Vercel projects
   - Domain configuration

3. **Phase 4 (Tenant Features):**
   - Custom domain verification
   - Per-tenant branding
   - Subdomain isolation

---

## Support

For issues or questions:
- Check GitHub Issues: https://github.com/christcr2012/Cortiware/issues
- Review architecture docs in `/docs`
- Check phase completion reports in `/ops/reports`

---

**Document Status:** ✅ Current through Phase 1 & Phase 3 (Complete)
**Next Update:** After Phase 2 (Monorepo & Multi-Domain)

