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

Your current project is named "mountain-vista" which needs to be changed. Here's the safe approach:

#### Recommended: Create New, Migrate, Then Delete Old

**Why not just rename?** Renaming breaks:
- Authentication tokens (PROVIDER_SESSION_SECRET, etc.)
- Federation keys (FED_HMAC_MASTER_KEY)
- OIDC configurations (OIDC_ISSUER_URL, OIDC_CLIENT_ID)
- Stripe webhooks (STRIPE_WEBHOOK_SECRET)
- Any hardcoded URLs in your database
- Vercel deployment URLs that may be referenced elsewhere

**Safe Migration Process:**

1. **Export from "mountain-vista" project:**
   - Go to Settings → Environment Variables
   - Click "..." → Download as .env file
   - Save as `mountain-vista-backup.env`
   - Document current domain configurations
   - Note any webhook URLs

2. **Create 4 new projects with proper names:**
   - `cortiware-provider-portal` (replaces mountain-vista)
   - `cortiware-marketing-robinson`
   - `cortiware-marketing-cortiware`
   - `cortiware-tenant-app`

3. **Configure new provider-portal project:**
   - Import all environment variables from backup
   - Set Root Directory: `apps/provider-portal`
   - Set Build Command: `cd ../.. && npm run build -- --filter=provider-portal`
   - Deploy and test thoroughly

4. **Update external services (if any):**
   - Stripe: Update webhook URLs to new deployment URL
   - OIDC providers: Update redirect URIs
   - Any APIs: Update callback URLs
   - Database: Update any stored URLs

5. **Test new provider-portal deployment:**
   - Verify authentication works
   - Test federation keys
   - Check OIDC login
   - Verify all API endpoints
   - Test database connections

6. **Only after everything works, delete "mountain-vista":**
   - Go to mountain-vista project → Settings → Advanced
   - Scroll to "Delete Project"
   - Confirm deletion

**Timeline:** Plan for 1-2 hours to migrate safely. Don't rush this step.

#### Alternative: Keep "mountain-vista" Temporarily

If you want to deploy quickly:
1. Keep "mountain-vista" running as-is
2. Create 3 new projects (marketing-robinson, marketing-cortiware, tenant-app)
3. Migrate "mountain-vista" to proper name later when you have time

**Recommendation:** Do the full migration now while you're setting up the monorepo. It's the cleanest approach.

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

## Step 1: Export Environment Variables from "mountain-vista"

**Before creating new projects, export all your existing configuration.**

### 1.1 Download Environment Variables

1. Go to your "mountain-vista" project on Vercel
2. **Settings → Environment Variables**
3. Click "..." (three dots) at the top right
4. Select "Download as .env file"
5. Save as `mountain-vista-backup.env` in a safe location (NOT in your git repo)

### 1.2 Document Current Configuration

Make note of:
- **Domains:** Any custom domains attached
- **Webhooks:** Stripe webhook URLs, OIDC redirect URIs
- **Deployment URL:** Current production URL (e.g., `mountain-vista.vercel.app`)
- **Git Branch:** Which branch is set as production

### 1.3 Verify Critical Variables Exist

Open `mountain-vista-backup.env` and verify these exist:
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

If any are missing, copy them from Vercel dashboard before proceeding.

---

## Step 2: Create New Vercel Projects

**Create 4 new projects with proper names to replace "mountain-vista".**

### 2.1 Create Project: provider-portal (Replaces mountain-vista)

1. Go to https://vercel.com/new
2. Click "Add New" → "Project"
3. Select `Cortiware` repository
4. Configure:
   - **Project Name:** `cortiware-provider-portal`
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/provider-portal`
   - **Build Command:** `cd ../.. && npm run build -- --filter=provider-portal`
   - **Output Directory:** `.next`
   - **Install Command:** `cd ../.. && npm install`
   - **Node.js Version:** 22.x

5. **Import Environment Variables:**
   - Click "Environment Variables"
   - Click "Import .env"
   - Upload `mountain-vista-backup.env`
   - Ensure all variables are set for Production, Preview, and Development

6. Click "Deploy"
7. **Wait for deployment to complete**
8. **Test thoroughly before proceeding**

### 2.2 Create Project: marketing-robinson

1. Click "Add New" → "Project"
2. Select `Cortiware` repository
3. Configure:
   - **Project Name:** `cortiware-marketing-robinson`
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/marketing-robinson`
   - **Build Command:** `cd ../.. && npm run build -- --filter=marketing-robinson`
   - **Output Directory:** `.next`
   - **Install Command:** `cd ../.. && npm install`
4. Add Environment Variables (see Section 4)
5. Click "Deploy"

### 2.3 Create Project: marketing-cortiware

1. Click "Add New" → "Project"
2. Select `Cortiware` repository
3. Configure:
   - **Project Name:** `cortiware-marketing-cortiware`
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/marketing-cortiware`
   - **Build Command:** `cd ../.. && npm run build -- --filter=marketing-cortiware`
   - **Output Directory:** `.next`
   - **Install Command:** `cd ../.. && npm install`
4. Add Environment Variables (see Section 4)
5. Click "Deploy"

### 2.4 Create Project: tenant-app

1. Click "Add New" → "Project"
2. Select `Cortiware` repository
3. Configure:
   - **Project Name:** `cortiware-tenant-app`
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/tenant-app`
   - **Build Command:** `cd ../.. && npm run build -- --filter=tenant-app`
   - **Output Directory:** `.next`
   - **Install Command:** `cd ../.. && npm install`
4. Add Environment Variables (see Section 4)
5. Click "Deploy"

---

## Step 3: Test New Provider Portal Deployment

**⚠️ CRITICAL: Test thoroughly before deleting "mountain-vista"**

### 3.1 Verify Build Success

1. Go to `cortiware-provider-portal` project
2. Check Deployments tab
3. Verify latest deployment shows "Ready"
4. Click on deployment URL

### 3.2 Test Authentication

1. Navigate to `/provider` route
2. Test provider login with credentials
3. Verify session cookies are set correctly
4. Test logout functionality

### 3.3 Test Federation & APIs

1. Test federation key endpoints: `/api/federation/keys`
2. Verify OIDC configuration: `/api/federation/oidc`
3. Test incident tracking: `/provider/incidents`
4. Check analytics: `/provider/analytics`

### 3.4 Test Database Connection

1. Verify Prisma client connects
2. Test reading data from database
3. Test writing data (create a test incident)
4. Verify audit logging works

### 3.5 Document New URLs

Make note of:
- **New Production URL:** `cortiware-provider-portal.vercel.app`
- **Any issues encountered:** Document for troubleshooting

---

## Step 4: Update External Services (If Applicable)

**Only if you have external integrations configured.**

### 4.1 Stripe Webhooks

If you have Stripe webhooks configured:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Find webhook pointing to `mountain-vista.vercel.app`
3. Update URL to `cortiware-provider-portal.vercel.app`
4. Test webhook delivery

### 4.2 OIDC Redirect URIs

If you have OIDC providers configured:

1. Go to your OIDC provider dashboard (Auth0, Okta, etc.)
2. Find redirect URIs containing `mountain-vista.vercel.app`
3. Update to `cortiware-provider-portal.vercel.app`
4. Test OIDC login flow

### 4.3 API Callbacks

If you have any APIs with callback URLs:

1. Update callback URLs from old to new deployment URL
2. Test API integrations

---

## Step 5: Delete "mountain-vista" Project

**⚠️ ONLY do this after everything is tested and working!**

### 5.1 Final Verification

- [ ] New provider portal fully functional
- [ ] Authentication working
- [ ] Database connections working
- [ ] All external services updated
- [ ] No errors in deployment logs
- [ ] Team members can access new URL

### 5.2 Delete Old Project

1. Go to "mountain-vista" project on Vercel
2. **Settings → Advanced**
3. Scroll to bottom: "Delete Project"
4. Type project name to confirm
5. Click "Delete"

### 5.3 Clean Up

1. Remove `mountain-vista-backup.env` from your local machine (contains secrets)
2. Update any documentation referencing old URLs
3. Notify team members of new URLs

---

## Step 6: Configure Domains

### 6.1 Add Domain: robinsonaisystems.com

1. Go to `cortiware-marketing-robinson` project
2. Settings → Domains
3. Add Domain: `robinsonaisystems.com`
4. Add Domain: `www.robinsonaisystems.com` (redirect to apex)
5. Follow Vercel's DNS instructions:
   ```
   A     @     76.76.21.21
   CNAME www   cname.vercel-dns.com
   ```

### 6.2 Add Domain: cortiware.com

1. Go to `cortiware-marketing-cortiware` project
2. Settings → Domains
3. Add Domain: `cortiware.com`
4. Add Domain: `www.cortiware.com` (redirect to apex)
5. Follow Vercel's DNS instructions:
   ```
   A     @     76.76.21.21
   CNAME www   cname.vercel-dns.com
   ```

### 6.3 Add Wildcard Domain: *.cortiware.com

1. Go to `cortiware-tenant-app` project
2. Settings → Domains
3. Add Domain: `*.cortiware.com`
4. Follow Vercel's DNS instructions:
   ```
   CNAME *   cname.vercel-dns.com
   ```

**Note:** Wildcard domains require a Pro or Enterprise Vercel plan.

---

## Step 7: Environment Variables

### 7.1 Shared Variables (All Projects)

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

### 7.2 App-Specific Variables

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

## Step 8: Test Rewrites

### 8.1 Test /portal Rewrite

1. Deploy marketing-robinson
2. Deploy provider-portal (when moved to apps/)
3. Visit: `https://robinsonaisystems.com/portal`
4. Should rewrite to provider-portal app
5. Verify: Provider login page loads

### 8.2 Test /app Rewrite

1. Deploy marketing-cortiware
2. Deploy tenant-app
3. Visit: `https://cortiware.com/app`
4. Should rewrite to tenant-app
5. Verify: Tenant app page loads

### 8.3 Test Wildcard Subdomain

1. Deploy tenant-app
2. Visit: `https://demo.cortiware.com`
3. Should route to tenant-app
4. Verify: Tenant app page loads

---

## Step 9: Vercel CLI Deployment (Optional)

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

## Step 10: Continuous Deployment

Vercel automatically deploys on git push:

- **Production:** Pushes to `main` branch
- **Preview:** Pushes to any other branch (e.g., `plan-epic/robinson-cortiware-rollup`)

**Branch Protection:**
1. Go to GitHub → Settings → Branches
2. Add rule for `main`
3. Require PR reviews before merge
4. Require status checks (Vercel deployments)

---

## Step 11: Add New Branding Assets

After removing old logos/favicons, add your new Cortiware branding:

### 11.1 Create New Favicons

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

### 11.2 Update Metadata

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

### 11.3 Add Logo Components

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

### 11.4 Commit New Assets

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

