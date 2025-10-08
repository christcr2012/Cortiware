# GitHub Secrets Setup for Automated Deployment

## Overview

The enhanced GitHub Actions CI/CD workflow now includes **automated deployment to Vercel** when you push to the `main` branch. To enable this, you need to add three secrets to your GitHub repository.

---

## Required Secrets

You need to add these three secrets to GitHub:

1. **`VERCEL_TOKEN`** - Your Vercel API token
2. **`VERCEL_ORG_ID`** - Your Vercel organization/team ID
3. **`VERCEL_PROJECT_ID`** - Your Vercel project ID

---

## Step 1: Get Your Vercel Token

### Option A: Create New Token (Recommended)

1. Go to **Vercel Dashboard**: https://vercel.com/account/tokens
2. Click **"Create Token"**
3. **Name**: `GitHub Actions CI/CD`
4. **Scope**: Select your team/organization (or leave as personal)
5. **Expiration**: Choose "No Expiration" or set a long expiration
6. Click **"Create"**
7. **Copy the token immediately** (you won't see it again!)

### Option B: Use Existing Token

If you already have a Vercel token:
1. Go to https://vercel.com/account/tokens
2. Find your existing token
3. If you can't see the value, create a new one (tokens are only shown once)

**Save this token** - you'll add it to GitHub in Step 3.

---

## Step 2: Get Your Vercel Org ID and Project ID

### Method 1: From Vercel Dashboard (Easiest)

1. Open the dashboard: https://vercel.com/dashboard
2. For each app project, open it and go to **Settings** → **General**:
   - cortiware-provider-portal → copy its Project ID (e.g., `prj_vtuMi117XwV51s1fBd2rthPo4yZI`)
   - cortiware-tenant-app → copy its Project ID (e.g., `prj_mUQKeWPH4KMkY2XzIrAYdRUFv43Q`)
   - cortiware-marketing-cortiware → copy its Project ID (e.g., `prj_O5Fakz26Drew0V5tycIbwJSAYSQL`)
   - cortiware-marketing-robinson → copy its Project ID (e.g., `prj_VwnpJrIFFZN5t8gpHPSoH70YNIbF`)
3. Team/Organization ID (same for all projects):
   - Copy the Org ID from any project’s **Settings** → **General** (e.g., `team_PUafLQmqT7LYBaBs8lEOPYMG`)

### Method 2: From .vercel/project.json (If You've Deployed Before)

If you've run `vercel` CLI locally before:

1. Open `.vercel/project.json` in your project
2. You'll see:
   ```json
   {
     "orgId": "team_abc123xyz...",
     "projectId": "prj_abc123xyz..."
   }
   ```
3. Copy both values

### Method 3: Using Vercel CLI (Advanced)

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Link your project (if not already linked)
vercel link

# This creates .vercel/project.json with orgId and projectId
```

**Save these IDs** - you'll add them to GitHub in Step 3.

---

## Step 3: Add Secrets to GitHub

### Navigate to Repository Secrets

1. Go to your GitHub repository: https://github.com/christcr2012/Cortiware
2. Click **"Settings"** (top menu)
3. In the left sidebar, click **"Secrets and variables"** → **"Actions"**
4. You'll see the **"Repository secrets"** page

### Add Each Secret

For each of the three secrets:

1. Click **"New repository secret"**
2. Enter the **Name** (exactly as shown below)
3. Paste the **Value**
4. Click **"Add secret"**

#### Secret 1: VERCEL_TOKEN

- **Name**: `VERCEL_TOKEN`
- **Value**: Your Vercel API token from Step 1
- Example value: `abc123def456ghi789...` (long random string)

#### Secret 2: VERCEL_ORG_ID

- **Name**: `VERCEL_ORG_ID`
- **Value**: Your Vercel organization/team ID from Step 2
- Example value: `team_abc123xyz...` or `prj_abc123xyz...`

#### Secret 3: VERCEL_PROJECT_ID

- **Name**: `VERCEL_PROJECT_ID`
- **Value**: Your Vercel project ID from Step 2
- Example value: `prj_abc123xyz...`

### Verify Secrets Are Added

After adding all three, you should see:

```
VERCEL_TOKEN          Updated X minutes ago
VERCEL_ORG_ID         Updated X minutes ago
VERCEL_PROJECT_ID     Updated X minutes ago
```

---

## Step 4: Test the Workflow

### Trigger a Deployment

1. Make a small change to your code (e.g., update a comment)
2. Commit and push to `main`:
   ```bash
   git add .
   git commit -m "test: trigger automated deployment"
   git push
   ```

### Monitor the Workflow

1. Go to **Actions** tab in GitHub: https://github.com/christcr2012/Cortiware/actions
2. You should see a new workflow run: **"CI/CD"**
3. Click on it to see the progress
4. Watch the jobs:
   - ✅ **Quality Checks** - TypeScript, lint, build, tests
   - ✅ **Deploy to Vercel Production** - Automated deployment

### Verify Deployment

1. Once the workflow completes, go to Vercel dashboard
2. You should see a new deployment
3. Check that your apps are live:
   - Provider Portal: `https://your-domain.vercel.app`
   - Tenant App: `https://your-tenant-domain.vercel.app`

---

## Troubleshooting

### Error: "Invalid token"

- **Cause**: Wrong `VERCEL_TOKEN` or token expired
- **Fix**: Create a new token in Vercel and update the GitHub secret

### Error: "Project not found"

- **Cause**: Wrong `VERCEL_PROJECT_ID` or `VERCEL_ORG_ID`
- **Fix**: Double-check the IDs from Vercel dashboard or `.vercel/project.json`

### Error: "Unauthorized"

- **Cause**: Token doesn't have access to the organization/project
- **Fix**: Create a new token with the correct scope (select your team/org)

### Deployment Succeeds but Apps Don't Work

- **Cause**: Missing environment variables in Vercel
- **Fix**: Go to Vercel → Project Settings → Environment Variables
- Add all required env vars from `docs/USER_ACTION_GUIDE.md`

### Workflow Doesn't Run

- **Cause**: Secrets not added correctly
- **Fix**: 
  1. Check secret names are EXACTLY: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
  2. No typos, no extra spaces
  3. Re-add the secrets if needed

---

## What Happens Now?

### On Every Push to Main

1. **Quality Checks Run**:
   - TypeScript type checking
   - ESLint linting
   - Full monorepo build
   - Unit tests
   - Prisma client generation

2. **If Quality Checks Pass**:
   - Automated deployment to Vercel production
   - All apps deployed simultaneously
   - Deployment summary in GitHub Actions

3. **If Quality Checks Fail**:
   - Deployment is skipped
   - You get notified of the failure
   - Fix the issue and push again

### On Pull Requests

1. **Quality Checks Run** (same as above)
2. **Contract Validation Runs**:
   - Checks for breaking API changes
   - Fails if endpoints are removed
3. **No Deployment** (PRs don't deploy to production)

---

## Security Notes

### Secret Safety

- ✅ Secrets are encrypted by GitHub
- ✅ Secrets are never exposed in logs
- ✅ Only workflows in your repo can access them
- ✅ You can rotate tokens anytime

### Token Permissions

Your `VERCEL_TOKEN` can:
- ✅ Deploy to Vercel
- ✅ Read project settings
- ❌ Cannot delete projects (unless you give it that permission)
- ❌ Cannot access billing (unless you give it that permission)

### Best Practices

1. **Use a dedicated token** for CI/CD (not your personal token)
2. **Set expiration** if your organization requires it
3. **Rotate tokens** periodically (every 6-12 months)
4. **Revoke immediately** if compromised

---

## Next Steps

After adding secrets:

1. ✅ Push to `main` to test automated deployment
2. ✅ Verify deployment in Vercel dashboard
3. ✅ Check that all apps are working
4. ✅ Set up environment variables in Vercel (if not done already)
5. ✅ Follow `docs/USER_ACTION_GUIDE.md` for domain setup

---

## Summary

**What You Need**:
- Vercel API token
- Vercel organization ID
- Vercel project ID

**Where to Add Them**:
- GitHub → Settings → Secrets and variables → Actions

**What You Get**:
- ✅ Automated deployment on every push to `main`
- ✅ Quality checks on every commit
- ✅ Zero manual deployment steps
- ✅ Fast, reliable CI/CD pipeline

**Cost**: $0 (GitHub Actions is free for your usage level)

---

**Questions?** Check the troubleshooting section above or see `docs/CI_CD_STRATEGY.md` for more details.

