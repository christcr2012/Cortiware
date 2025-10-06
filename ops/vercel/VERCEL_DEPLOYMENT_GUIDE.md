# Vercel Multi-Domain Deployment Guide

**Last Updated:** 2025-10-06
**Phase:** Phase 2 - Monorepo & Multi-Domain

---

## Overview

This guide covers deploying the Cortiware monorepo to Vercel with separate projects for each app and multi-domain routing.

---

## Pre-Deployment Checklist

### Step 0.1: Rename Project Folder

**⚠️ IMPORTANT: Do this BEFORE any Vercel changes to avoid breaking existing deployments.**

1. **Close your IDE/editor completely**
2. **Commit and push all changes:**
   ```bash
   git add -A
   git commit -m "Pre-rename checkpoint"
   git push
   ```
3. **Rename the folder:**
   - **Windows File Explorer:** Navigate to `C:\Users\chris\Git Local\`, right-click `StreamFlow`, select Rename, type `Cortiware`
   - **PowerShell:**
     ```powershell
     cd "C:\Users\chris\Git Local"
     Rename-Item -Path "StreamFlow" -NewName "Cortiware"
     ```
4. **Reopen in your editor:**
   - Open VS Code
   - File → Open Folder
   - Navigate to `C:\Users\chris\Git Local\Cortiware`
5. **Verify git still works:**
   ```bash
   cd "C:\Users\chris\Git Local\Cortiware"
   git status
   git remote -v
   ```

### Step 0.2: Remove Old Logos and Favicons

**Search and remove all logo/favicon files:**

1. **Find all logo/favicon files:**
   ```bash
   # Search for common logo/favicon patterns
   Get-ChildItem -Recurse -Include *.ico,favicon.*,logo.*,*icon*.png,*icon*.svg -Exclude node_modules
   ```

2. **Common locations to check:**
   - `public/favicon.ico`
   - `public/logo.png`, `public/logo.svg`
   - `public/icons/*`
   - `public/images/logo*`
   - `src/assets/logo*`
   - `apps/*/public/favicon.ico`
   - `apps/*/public/logo*`

3. **Remove old branding files:**
   ```bash
   # Example - adjust paths based on what you find
   Remove-Item public/favicon.ico -ErrorAction SilentlyContinue
   Remove-Item public/logo.png -ErrorAction SilentlyContinue
   Remove-Item public/logo.svg -ErrorAction SilentlyContinue
   Remove-Item -Recurse public/icons -ErrorAction SilentlyContinue
   ```

4. **Commit the cleanup:**
   ```bash
   git add -A
   git commit -m "chore: remove old StreamFlow branding assets"
   git push
   ```

### Step 0.3: Vercel Project Naming Strategy

**⚠️ CRITICAL: Renaming Vercel projects can break authentication, tokens, and OIDC.**

**DO NOT rename your existing Vercel project.** Instead, use this strategy:

#### Option A: Keep Existing Project (Recommended)
- **Keep** your existing Vercel project name as-is
- **Update** its settings to point to `apps/provider-portal`
- **Create** 3 new projects with proper names:
  - `cortiware-marketing-robinson`
  - `cortiware-marketing-cortiware`
  - `cortiware-tenant-app`

**Why?** Renaming breaks:
- Authentication tokens (PROVIDER_SESSION_SECRET, etc.)
- Federation keys (FED_HMAC_MASTER_KEY)
- OIDC configurations (OIDC_ISSUER_URL, OIDC_CLIENT_ID)
- Stripe webhooks (STRIPE_WEBHOOK_SECRET)
- Any hardcoded URLs in your database

#### Option B: Fresh Start (If Absolutely Necessary)
If you MUST have clean project names:

1. **Before deleting anything:**
   - Export all environment variables from existing project
   - Document all domain configurations
   - Note all webhook URLs
   - Backup database connection strings

2. **Create new projects first:**
   - Deploy all 4 new projects
   - Configure all environment variables
   - Test thoroughly

3. **Update external services:**
   - Stripe: Update webhook URLs
   - OIDC providers: Update redirect URIs
   - Any APIs: Update callback URLs

4. **Only then delete old project**

**Recommendation:** Use Option A. The project name is internal to Vercel and doesn't affect your users.

---

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

## Step 1: Update Existing Vercel Project (Provider Portal)

**If you have an existing Vercel project deployed, update it instead of creating a new one.**

### 1.1 Update Existing Project Settings

1. Go to your existing Vercel project dashboard
2. **Settings → General:**
   - **Project Name:** Leave as-is (DO NOT rename - see Step 0.3)
   - **Root Directory:** Change to `apps/provider-portal`
   - **Framework Preset:** Next.js
   - **Build Command:** `cd ../.. && npm run build -- --filter=provider-portal`
   - **Output Directory:** `.next`
   - **Install Command:** `cd ../.. && npm install`
   - **Node.js Version:** 22.x

3. **Settings → Git:**
   - **Production Branch:** `main` (or your preferred branch)
   - Ensure GitHub repository is connected

4. **Settings → Environment Variables:**
   - Keep all existing variables (they should work with monorepo)
   - Verify these critical variables exist:
     ```
     DATABASE_URL
     PROVIDER_SESSION_SECRET
     TENANT_COOKIE_SECRET
     DEVELOPER_SESSION_SECRET
     ACCOUNTANT_SESSION_SECRET
     FED_HMAC_MASTER_KEY
     PROVIDER_CREDENTIALS
     DEVELOPER_CREDENTIALS
     ```

5. **Redeploy:**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Select "Redeploy"
   - Verify build succeeds with new monorepo structure

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

## Step 7: Add New Branding Assets

After removing old logos/favicons, add your new Cortiware branding:

### 7.1 Create New Favicons

1. **Generate favicons:**
   - Use a tool like https://realfavicongenerator.net/
   - Upload your Cortiware logo
   - Download the generated package

2. **Add to each app:**
   ```
   apps/provider-portal/public/favicon.ico
   apps/marketing-robinson/public/favicon.ico
   apps/marketing-cortiware/public/favicon.ico
   apps/tenant-app/public/favicon.ico
   ```

3. **Add to public directories:**
   ```
   apps/*/public/
   ├── favicon.ico
   ├── favicon-16x16.png
   ├── favicon-32x32.png
   ├── apple-touch-icon.png
   └── android-chrome-192x192.png
   ```

### 7.2 Update Metadata

Update each app's `layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: 'Cortiware Provider Portal', // or appropriate title
  description: 'Your description',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};
```

### 7.3 Add Logo Components

Create logo components in `packages/ui/`:

```typescript
// packages/ui/Logo.tsx
export function Logo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100">
      {/* Your Cortiware logo SVG */}
    </svg>
  );
}
```

### 7.4 Commit New Assets

```bash
git add -A
git commit -m "feat: add Cortiware branding assets"
git push
```

---

## Troubleshooting

### Folder Rename Issues

**Problem:** Git not working after folder rename

**Fix:**
1. Verify you're in the correct directory: `pwd` or `cd`
2. Check git status: `git status`
3. If issues persist, the `.git` folder should be intact - try `git remote -v`

### Logo/Favicon Still Showing Old Branding

**Problem:** Old logos cached in browser

**Fix:**
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Check Vercel deployment logs to ensure new files deployed
4. Verify files exist in deployment: Check Vercel → Deployments → Source

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

### Pre-Deployment
- [ ] Project folder renamed from StreamFlow to Cortiware
- [ ] All old logos/favicons removed from codebase
- [ ] All changes committed and pushed to GitHub
- [ ] Git still works in renamed folder

### Vercel Configuration
- [ ] Existing project updated to use apps/provider-portal
- [ ] 3 new Vercel projects created (marketing-robinson, marketing-cortiware, tenant-app)
- [ ] Domains configured with DNS records
- [ ] Environment variables set for all projects
- [ ] All apps build successfully on Vercel

### Domain Routing
- [ ] robinsonaisystems.com loads marketing-robinson
- [ ] robinsonaisystems.com/portal rewrites to provider-portal
- [ ] cortiware.com loads marketing-cortiware
- [ ] cortiware.com/app rewrites to tenant-app
- [ ] *.cortiware.com routes to tenant-app (requires Pro plan)
- [ ] SSL certificates active for all domains

### Deployment & Testing
- [ ] Continuous deployment working on git push
- [ ] Provider portal authentication working
- [ ] Federation keys still valid
- [ ] OIDC configuration still working
- [ ] Stripe webhooks updated (if applicable)
- [ ] No broken authentication tokens

### Branding
- [ ] New Cortiware favicons added to all apps
- [ ] New logo components created
- [ ] Metadata updated in all layouts
- [ ] Old branding completely removed

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

