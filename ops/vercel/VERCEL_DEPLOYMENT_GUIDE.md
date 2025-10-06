# Vercel Multi-Domain Deployment Guide

**Last Updated:** 2025-10-06
**Phase:** Phase 2 - Monorepo & Multi-Domain

---

## Overview

This guide covers deploying the Cortiware monorepo to Vercel with separate projects for each app and multi-domain routing.

## Architecture

**4 Vercel Projects:**
1. **marketing-robinson** → robinsonaisystems.com
2. **marketing-cortiware** → cortiware.com
3. **tenant-app** → *.cortiware.com (wildcard subdomain)
4. **provider-portal** → provider-portal.vercel.app (internal, accessed via /portal rewrite)

**Domain Routing:**
- `robinsonaisystems.com` → marketing-robinson app
  - `/portal/*` → rewrites to provider-portal app
- `cortiware.com` → marketing-cortiware app
  - `/app/*` → rewrites to tenant-app
- `*.cortiware.com` → tenant-app (Phase 4 will add per-tenant routing)

---

## Step 1: Create Vercel Projects

### 1.1 Import Repository

1. Go to https://vercel.com/new
2. Import GitHub repository: `christcr2012/Cortiware`
3. **Do NOT deploy yet** - we'll configure each app separately

### 1.2 Create Project: marketing-robinson

1. Click "Add New" → "Project"
2. Select `Cortiware` repository
3. Configure:
   - **Project Name:** `cortiware-marketing-robinson`
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/marketing-robinson`
   - **Build Command:** `cd ../.. && npm run build -- --filter=marketing-robinson`
   - **Output Directory:** `.next`
   - **Install Command:** `cd ../.. && npm install`
4. Add Environment Variables (see Section 3)
5. Click "Deploy"

### 1.3 Create Project: marketing-cortiware

1. Click "Add New" → "Project"
2. Select `Cortiware` repository
3. Configure:
   - **Project Name:** `cortiware-marketing-cortiware`
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/marketing-cortiware`
   - **Build Command:** `cd ../.. && npm run build -- --filter=marketing-cortiware`
   - **Output Directory:** `.next`
   - **Install Command:** `cd ../.. && npm install`
4. Add Environment Variables (see Section 3)
5. Click "Deploy"

### 1.4 Create Project: tenant-app

1. Click "Add New" → "Project"
2. Select `Cortiware` repository
3. Configure:
   - **Project Name:** `cortiware-tenant-app`
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/tenant-app`
   - **Build Command:** `cd ../.. && npm run build -- --filter=tenant-app`
   - **Output Directory:** `.next`
   - **Install Command:** `cd ../.. && npm install`
4. Add Environment Variables (see Section 3)
5. Click "Deploy"

### 1.5 Create Project: provider-portal (Future)

**Note:** Provider portal will be moved to `apps/provider-portal` in a future step. For now, it remains at the root.

---

## Step 2: Configure Domains

### 2.1 Add Domain: robinsonaisystems.com

1. Go to `cortiware-marketing-robinson` project
2. Settings → Domains
3. Add Domain: `robinsonaisystems.com`
4. Add Domain: `www.robinsonaisystems.com` (redirect to apex)
5. Follow Vercel's DNS instructions:
   ```
   A     @     76.76.21.21
   CNAME www   cname.vercel-dns.com
   ```

### 2.2 Add Domain: cortiware.com

1. Go to `cortiware-marketing-cortiware` project
2. Settings → Domains
3. Add Domain: `cortiware.com`
4. Add Domain: `www.cortiware.com` (redirect to apex)
5. Follow Vercel's DNS instructions:
   ```
   A     @     76.76.21.21
   CNAME www   cname.vercel-dns.com
   ```

### 2.3 Add Wildcard Domain: *.cortiware.com

1. Go to `cortiware-tenant-app` project
2. Settings → Domains
3. Add Domain: `*.cortiware.com`
4. Follow Vercel's DNS instructions:
   ```
   CNAME *   cname.vercel-dns.com
   ```

**Note:** Wildcard domains require a Pro or Enterprise Vercel plan.

---

## Step 3: Environment Variables

### 3.1 Shared Variables (All Projects)

Add these to **all 4 projects**:

```bash
# Database
DATABASE_URL="postgresql://..."

# Session Secrets
PROVIDER_SESSION_SECRET="..."
TENANT_COOKIE_SECRET="..."
DEVELOPER_SESSION_SECRET="..."
ACCOUNTANT_SESSION_SECRET="..."

# Federation
FED_HMAC_MASTER_KEY="..."

# Optional: Redis
REDIS_URL="redis://..."

# Optional: Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Optional: SendGrid
SENDGRID_API_KEY="SG...."
SENDGRID_FROM_EMAIL="noreply@cortiware.com"

# Optional: Twilio
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1..."

# Optional: OpenAI
OPENAI_API_KEY="sk-..."
```

### 3.2 App-Specific Variables

**marketing-robinson:**
```bash
PROVIDER_PORTAL_URL="https://provider-portal.vercel.app"
NEXT_PUBLIC_BASE_URL="https://robinsonaisystems.com"
```

**marketing-cortiware:**
```bash
TENANT_APP_URL="https://cortiware-tenant-app.vercel.app"
NEXT_PUBLIC_BASE_URL="https://cortiware.com"
```

**tenant-app:**
```bash
NEXT_PUBLIC_BASE_URL="https://cortiware.com"
```

**provider-portal (future):**
```bash
PROVIDER_CREDENTIALS="admin:$2a$10$..."
DEVELOPER_CREDENTIALS="dev:$2a$10$..."
NEXT_PUBLIC_BASE_URL="https://robinsonaisystems.com"
```

---

## Step 4: Test Rewrites

### 4.1 Test /portal Rewrite

1. Deploy marketing-robinson
2. Deploy provider-portal (when moved to apps/)
3. Visit: `https://robinsonaisystems.com/portal`
4. Should rewrite to provider-portal app
5. Verify: Provider login page loads

### 4.2 Test /app Rewrite

1. Deploy marketing-cortiware
2. Deploy tenant-app
3. Visit: `https://cortiware.com/app`
4. Should rewrite to tenant-app
5. Verify: Tenant app page loads

### 4.3 Test Wildcard Subdomain

1. Deploy tenant-app
2. Visit: `https://demo.cortiware.com`
3. Should route to tenant-app
4. Verify: Tenant app page loads

---

## Step 5: Vercel CLI Deployment (Optional)

For local testing and CI/CD:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy specific app
vercel --cwd apps/marketing-robinson

# Deploy to production
vercel --prod --cwd apps/marketing-robinson
```

---

## Step 6: Continuous Deployment

Vercel automatically deploys on git push:

- **Production:** Pushes to `main` branch
- **Preview:** Pushes to any other branch (e.g., `plan-epic/robinson-cortiware-rollup`)

**Branch Protection:**
1. Go to GitHub → Settings → Branches
2. Add rule for `main`
3. Require PR reviews before merge
4. Require status checks (Vercel deployments)

---

## Troubleshooting

### Build Fails: "Cannot find module"

**Cause:** Turborepo not finding workspace dependencies

**Fix:** Ensure `installCommand` includes `cd ../.. && npm install`

### Rewrite Not Working

**Cause:** Destination URL incorrect or app not deployed

**Fix:**
1. Verify destination app is deployed
2. Check Vercel project URL in rewrite config
3. Update `PROVIDER_PORTAL_URL` / `TENANT_APP_URL` env vars

### Wildcard Domain Not Working

**Cause:** Requires Vercel Pro/Enterprise plan

**Fix:** Upgrade plan or use subdomains manually (e.g., `demo.cortiware.com`, `acme.cortiware.com`)

### Environment Variables Not Loading

**Cause:** Not set for correct environment (Production/Preview/Development)

**Fix:**
1. Go to Project Settings → Environment Variables
2. Ensure variables are checked for all 3 environments
3. Redeploy after adding variables

---

## Success Checklist

- [ ] All 4 Vercel projects created
- [ ] Domains configured with DNS records
- [ ] Environment variables set for all projects
- [ ] All apps build successfully
- [ ] robinsonaisystems.com loads marketing-robinson
- [ ] robinsonaisystems.com/portal rewrites to provider-portal
- [ ] cortiware.com loads marketing-cortiware
- [ ] cortiware.com/app rewrites to tenant-app
- [ ] *.cortiware.com routes to tenant-app
- [ ] SSL certificates active for all domains
- [ ] Continuous deployment working on git push

---

## Next Steps

After Vercel is configured:

1. **Phase 2 Completion:** Move provider portal to `apps/provider-portal`
2. **Phase 4:** Implement per-tenant subdomain routing and branding
3. **Monitoring:** Set up Vercel Analytics and error tracking
4. **Performance:** Configure Edge Functions and caching strategies

---

**Document Status:** ✅ Complete for Phase 2
**Last Verified:** 2025-10-06

