# CI/CD Guidelines and Best Practices

## Overview

This document outlines the CI/CD pipeline configuration, common issues, and prevention strategies for the Cortiware monorepo.

## Current CI/CD Status

✅ **All Quality Checks Passing** (as of 2025-10-09)
- TypeScript: 0 errors
- ESLint: 0 errors, 8 warnings (non-blocking)
- Build: Successful
- Unit Tests: Passing

## GitHub Actions Workflows

### 1. CI/CD Workflow (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**Jobs:**

#### Quality Checks Job
Runs on all pushes and PRs:
1. **Checkout** - Fetches repository code
2. **Setup Node 22** - Installs Node.js 22.x
3. **Install Dependencies** - Runs `npm ci --no-audit --no-fund`
4. **Generate Prisma Client** - Runs `npx prisma generate`
5. **TypeScript Type Check** - Runs `npm run typecheck`
6. **ESLint** - Runs `npm run lint`
7. **Build All Apps** - Runs `npm run build` (with `SKIP_ENV_VALIDATION: true`)
8. **Unit Tests** - Runs `npm run test:unit` (5-minute timeout)

#### Contract Validation Job
Runs only on PRs:
- Validates API contracts haven't broken

#### Deploy Job
Runs only on `main` branch after quality checks pass:
- Deploys to Vercel production for each app (provider-portal, tenant-app, marketing-cortiware, marketing-robinson)

### 2. Security Scan Workflow (`.github/workflows/security-scan.yml`)

**Status:** ✅ Passing consistently

Runs security scans on all pushes and PRs.

## Recent Issues and Fixes

### Issue #1: ESLint Errors (Fixed 2025-10-09)

**Problem:**
- ESLint was failing with 2 errors related to unescaped apostrophes in JSX
- Error locations:
  - `apps/provider-portal/src/app/login/page.tsx:124`
  - `apps/provider-portal/src/app/provider/provisioning/ProvisioningClient.tsx:716`

**Root Cause:**
- React/JSX requires apostrophes to be escaped using HTML entities (`&apos;`)
- Rule: `react/no-unescaped-entities`

**Fix:**
- Changed `We've` to `We&apos;ve`
- Changed `You'll` to `You&apos;ll`

**Commit:** `ce683df140136814ce4e92f84f57bd05352c186a`

**Remaining Warnings (Non-Blocking):**
1. React Hook `useEffect` missing dependencies (8 instances)
2. Using `<img>` instead of Next.js `<Image />` (1 instance)

These warnings don't fail the build and can be addressed incrementally.

## Prevention Strategy

### 1. Pre-Commit Hooks (Husky)

**Current Hooks (`.husky/pre-commit`):**
- ✅ Secret detection

**Recommended Additions:**
```bash
#!/usr/bin/env sh

# Secret detection
echo "🔍 Running secret detection..."
# ... existing secret detection code ...

# TypeScript type check
echo "🔍 Running TypeScript type check..."
npm run typecheck || exit 1

# ESLint
echo "🔍 Running ESLint..."
npm run lint || exit 1

echo "✅ All pre-commit checks passed"
```

**Note:** The current pre-commit hook has a deprecation warning about removing two lines for Husky v10.0.0 compatibility. This should be addressed when upgrading Husky.

### 2. Pre-Push Hook

Create `.husky/pre-push`:
```bash
#!/usr/bin/env sh

echo "🔍 Running pre-push validation..."

# Full build test
echo "🏗️  Building all apps..."
npm run build || exit 1

# Run tests
echo "🧪 Running tests..."
npm run test:unit || exit 1

echo "✅ All pre-push checks passed"
```

### 3. Local Validation Script

Add to `package.json`:
```json
{
  "scripts": {
    "validate-all": "npm run typecheck && npm run lint && npm run build && npm run test:unit",
    "validate-quick": "npm run typecheck && npm run lint"
  }
}
```

**Usage:**
```bash
# Before committing
npm run validate-quick

# Before pushing
npm run validate-all
```

### 4. CI/CD Workflow Improvements

**Current Configuration:**
- ✅ Runs on all pushes and PRs
- ✅ Parallel job execution
- ✅ Caching for dependencies
- ✅ Separate quality checks and deployment jobs

**Recommended Enhancements:**
1. Add branch protection rules requiring CI to pass before merge
2. Set up Slack/Discord notifications for CI failures
3. Add performance budgets for build times
4. Implement automatic retry for transient Vercel deployment failures

### 5. Branch Protection Rules

**Recommended Settings for `main` branch:**
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging:
  - Quality Checks (TypeScript, Lint, Tests, Build)
  - Security Scan
- ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging
- ❌ Do not allow force pushes
- ❌ Do not allow deletions

### 6. Monitoring and Alerts

**GitHub Actions:**
- Monitor workflow run history at: https://github.com/christcr2012/Cortiware/actions
- Set up email notifications for failed workflows
- Review failed runs immediately

**Vercel Deployments:**
- Monitor deployments at Vercel dashboard
- Set up deployment notifications
- Review build logs for warnings

## Common Issues and Solutions

### TypeScript Errors

**Symptoms:**
- `npm run typecheck` fails
- Red squiggly lines in IDE

**Solutions:**
1. Run `npx prisma generate` after schema changes
2. Check for missing imports
3. Verify type annotations
4. Check for implicit `any` types

### ESLint Errors

**Symptoms:**
- `npm run lint` fails
- Linting errors in CI

**Solutions:**
1. Fix unescaped characters in JSX (use `&apos;`, `&quot;`, etc.)
2. Add missing dependencies to `useEffect` hooks
3. Use Next.js `<Image />` instead of `<img>`
4. Run `npm run lint -- --fix` for auto-fixable issues

### Build Failures

**Symptoms:**
- `npm run build` fails
- Compilation errors

**Solutions:**
1. Check for TypeScript errors first
2. Verify all dependencies are installed
3. Check for missing environment variables
4. Review build logs for specific errors

### Vercel Deployment Failures

**Symptoms:**
- Quality checks pass but deployment fails
- "Unexpected error" from Vercel

**Solutions:**
1. Check Vercel dashboard for detailed logs
2. Verify environment variables are set in Vercel
3. Check for Vercel platform status issues
4. Retry deployment (often transient issues)
5. Verify Vercel project configuration

## Validation Checklist

Before pushing code, ensure:

- [ ] `npm run typecheck` passes locally
- [ ] `npm run lint` passes locally (0 errors)
- [ ] `npm run build` succeeds locally
- [ ] `npm run test:unit` passes locally
- [ ] All new files are committed
- [ ] Commit message follows conventional commits format
- [ ] No secrets or sensitive data in code
- [ ] Environment variables documented if added

## Continuous Improvement

### Metrics to Track

1. **Build Success Rate:** Target 95%+
2. **Build Time:** Monitor for increases
3. **Test Coverage:** Maintain or improve
4. **Deployment Frequency:** Track velocity
5. **Mean Time to Recovery:** Minimize downtime

### Regular Reviews

- **Weekly:** Review failed builds and address patterns
- **Monthly:** Review and update CI/CD configuration
- **Quarterly:** Audit dependencies and update as needed

## Resources

- **GitHub Actions Documentation:** https://docs.github.com/en/actions
- **Vercel Documentation:** https://vercel.com/docs
- **Turborepo Documentation:** https://turbo.build/repo/docs
- **Next.js Documentation:** https://nextjs.org/docs
- **Prisma Documentation:** https://www.prisma.io/docs

## Support

For CI/CD issues:
1. Check this document first
2. Review GitHub Actions logs
3. Check Vercel deployment logs
4. Consult team members
5. Create an issue in the repository

---

**Last Updated:** 2025-10-09
**Maintained By:** Development Team

