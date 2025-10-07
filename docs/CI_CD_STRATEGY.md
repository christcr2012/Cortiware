# CI/CD Strategy for Cortiware Monorepo

## Overview

The Cortiware repository uses **both GitHub Actions and CircleCI** for comprehensive CI/CD coverage. Each platform serves specific purposes in the testing and deployment pipeline.

---

## 1. GitHub Actions Workflows

Located in `.github/workflows/`, GitHub Actions provides fast, integrated CI checks for every commit and PR.

### 1.1 `ci.yml` - Main CI Pipeline

**Purpose**: Primary quality gate for all code changes

**Triggers**:
- Every push to `main` branch
- Every pull request

**Jobs**:

#### Job 1: `typecheck_lint_unit`
Runs on all pushes and PRs:
1. **Checkout** - Get the code
2. **Setup Node 22** - Install Node.js runtime
3. **Install dependencies** - `npm install --no-audit --no-fund`
4. **TypeScript Type Check** - `npx tsc --noEmit`
   - Validates TypeScript types across entire monorepo
   - Catches type errors before they reach production
5. **ESLint** - `npm run lint`
   - Runs Turbo lint across all packages and apps
   - Enforces code style and catches common errors
6. **Unit Tests** - `npm run test:unit`
   - Runs `tests/unit/run.ts`
   - Tests: federation config, services, middleware, auth, onboarding, validation

#### Job 2: `contracts` (PR only)
Runs only on pull requests:
1. **Checkout PR** - Fetch PR code with history
2. **Setup Node 22**
3. **Install dependencies**
4. **Generate contract snapshot** - `node scripts/generate-contract-snapshot.js`
   - Scans `Reference/repo-docs/docs/api/**/*.md` files
   - Creates SHA256 hashes of all API documentation
   - Writes to `contracts/current.json`
5. **Diff against base** - `node scripts/diff-contracts.js --fail-on-breaking`
   - Compares `current.json` vs `previous.json`
   - Detects: Added, Removed, Changed API contracts
   - **Fails if breaking changes detected** (removed endpoints)
   - Best-effort: doesn't fail if baseline missing

**What it validates**:
- ✅ TypeScript compilation
- ✅ Code style and linting
- ✅ Unit test coverage
- ✅ API contract stability (no breaking changes in PRs)

---

### 1.2 `e2e-smoke.yml` - Manual E2E Testing

**Purpose**: On-demand end-to-end smoke tests against any environment

**Triggers**:
- Manual dispatch only (`workflow_dispatch`)

**Inputs**:
- `base_url` - URL to test (e.g., Vercel preview URL)
- `fed_enabled` - Whether federation is expected to be enabled

**Jobs**:
1. **Checkout**
2. **Setup Node 22**
3. **Install dependencies**
4. **Run E2E Smoke** - `npm run test:e2e`
   - Runs `tests/e2e/run.ts`
   - Tests federation smoke scenarios
   - Uses provided `BASE_URL` and `E2E_EXPECT_FED_ENABLED`

**Use cases**:
- Test Vercel preview deployments before merging
- Validate staging environment
- Test production after deployment

---

### 1.3 `e2e-smoke-scheduled.yml` - Nightly E2E Monitoring

**Purpose**: Automated nightly health checks of production/staging

**Triggers**:
- **Scheduled**: Every night at 2 AM UTC (`cron: '0 2 * * *'`)
- **Manual dispatch**: Optional with custom `base_url`

**Jobs**:
1. **Checkout**
2. **Setup Node 22**
3. **Install dependencies**
4. **Run E2E Smoke** - `npm run test:e2e`
   - Tests against `STAGING_URL` or default Vercel URL
   - Expects federation enabled
   - Alerts if production is broken

**Use cases**:
- Catch production regressions overnight
- Monitor uptime and functionality
- Early warning system for issues

---

### 1.4 `promote-contracts.yml` - Contract Baseline Management

**Purpose**: Promote current API contracts to baseline after successful deployment

**Triggers**:
- Manual dispatch only (`workflow_dispatch`)

**Inputs**:
- `branch` - Branch to promote from (default: `main`)

**Jobs**:
1. **Checkout** specified branch
2. **Setup Node 22** with npm cache
3. **Install dependencies** - `npm ci`
4. **Promote contracts** - `npm run contracts:promote`
   - Copies `contracts/current.json` → `contracts/previous.json`
5. **Commit and push**
   - Commits `contracts/previous.json` with message: `chore(contracts): promote current to previous`
   - Only commits if changes detected

**Workflow**:
1. Merge PR to main
2. Deploy to production
3. Manually run this workflow to set new baseline
4. Future PRs will diff against this baseline

---

## 2. CircleCI Pipelines

Located in `.circleci/config.yml`, CircleCI provides **deployment automation** and **comprehensive build validation**.

### 2.1 Configuration Details

**Orbs**: `circleci/node@5.1.0`  
**Docker Image**: `cimg/node:20.11`  
**Resource Class**: `medium` (2 vCPUs, 4GB RAM)

### 2.2 Job: `test`

**Purpose**: Comprehensive build and test validation

**Runs on**: All branches, every push

**Steps**:
1. **Checkout** - Get code
2. **Restore cache** - Restore `node_modules` from cache (keyed by `package-lock.json`)
3. **Install Dependencies** - `npm ci`
4. **Save cache** - Cache `node_modules` and `~/.npm`
5. **Generate Prisma Client** - `npx prisma generate`
   - Required for database access
6. **TypeScript Type Check** - `npm run typecheck`
7. **ESLint Check** - `npm run lint`
8. **Build Application** - `npm run build`
   - Full Turbo build of all apps and packages
   - 10-minute timeout
9. **Run Unit Tests** - `npm run test:unit`
10. **Store test results** - Save to `test-results/`
11. **Store artifacts** - Save `.next` build output

**What it validates**:
- ✅ Full monorepo build succeeds
- ✅ All apps compile successfully
- ✅ TypeScript types are valid
- ✅ Code passes linting
- ✅ Unit tests pass
- ✅ Prisma schema is valid

---

### 2.3 Job: `deploy`

**Purpose**: Deploy to Vercel production

**Runs on**: `main` branch only, after `test` job passes

**Steps**:
1. **Checkout**
2. **Install Vercel CLI** - `npm i -g vercel`
3. **Deploy to Vercel**:
   - `vercel pull --yes --environment=production --token=$VERCEL_TOKEN`
   - `vercel build --prod --token=$VERCEL_TOKEN`
   - `vercel deploy --prebuilt --prod --token=$VERCEL_TOKEN`
4. **Notify deployment success**

**Required Environment Variables** (set in CircleCI):
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - From `.vercel/project.json`
- `VERCEL_PROJECT_ID` - From `.vercel/project.json`

---

### 2.4 Workflows

#### Workflow 1: `test-all-branches`
- Runs `test` job on **every branch**
- Validates all commits before merge

#### Workflow 2: `deploy-production`
- Runs on `main` branch only
- Sequence:
  1. Run `test` job
  2. If tests pass → run `deploy` job
  3. Deploy to Vercel production

---

## 3. CircleCI Status for Cortiware

**Current Status**: ❌ **NOT CONFIGURED**

**Finding**: The CircleCI configuration file exists (`.circleci/config.yml`), but the Cortiware repository is **not connected to CircleCI**.

**Evidence**:
- CircleCI API shows only 1 followed project: "AIO SaaS"
- Cortiware repository is not in the followed projects list
- No CircleCI builds are running for this repo

**Why the config exists**:
- Template/boilerplate from initial setup
- Prepared for future CircleCI integration
- Currently unused

**To activate CircleCI**:
1. Log in to CircleCI
2. Connect GitHub repository: `christcr2012/Cortiware`
3. Set environment variables:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
4. CircleCI will automatically detect `.circleci/config.yml`

---

## 4. Comparison: GitHub Actions vs CircleCI

### GitHub Actions (Currently Active)

**Strengths**:
- ✅ **Integrated** - Native GitHub integration
- ✅ **Fast** - Runs immediately on push/PR
- ✅ **Free** - Generous free tier for public/private repos
- ✅ **Contract validation** - API contract diffing on PRs
- ✅ **Scheduled E2E** - Nightly production monitoring

**Current responsibilities**:
- Pre-merge quality gates (typecheck, lint, unit tests)
- API contract validation
- E2E smoke testing (manual + scheduled)
- Contract baseline promotion

### CircleCI (Configured but Inactive)

**Strengths**:
- ✅ **Deployment automation** - Built-in Vercel deployment
- ✅ **Caching** - Sophisticated dependency caching
- ✅ **Resource control** - Configurable compute resources
- ✅ **Artifacts** - Build output storage

**Intended responsibilities** (when activated):
- Full monorepo build validation
- Automated Vercel production deployments
- Build artifact storage
- Comprehensive test execution

---

## 5. Overall CI/CD Strategy

### Current Strategy (GitHub Actions Only)

```
┌─────────────────────────────────────────────────────────────┐
│                    Developer Workflow                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Push to Branch │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  GitHub Actions │
                    │   ci.yml (PR)   │
                    └─────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
          ┌──────────────────┐  ┌──────────────────┐
          │ typecheck_lint   │  │   contracts      │
          │     _unit        │  │  (PR only)       │
          │                  │  │                  │
          │ • TypeScript     │  │ • Generate       │
          │ • ESLint         │  │   snapshot       │
          │ • Unit tests     │  │ • Diff vs base   │
          │                  │  │ • Fail on break  │
          └──────────────────┘  └──────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Merge to main │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Manual Deploy  │
                    │   to Vercel     │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Manual: Promote │
                    │   Contracts     │
                    └─────────────────┘
```

### Intended Strategy (with CircleCI)

```
┌─────────────────────────────────────────────────────────────┐
│                    Developer Workflow                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Push to Branch │
                    └─────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
          ┌──────────────────┐  ┌──────────────────┐
          │  GitHub Actions  │  │    CircleCI      │
          │   (Fast checks)  │  │  (Full build)    │
          │                  │  │                  │
          │ • TypeScript     │  │ • npm ci         │
          │ • ESLint         │  │ • Prisma gen     │
          │ • Unit tests     │  │ • TypeScript     │
          │ • Contracts      │  │ • ESLint         │
          │                  │  │ • Full build     │
          │                  │  │ • Unit tests     │
          └──────────────────┘  └──────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Merge to main │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │    CircleCI     │
                    │  Auto-Deploy    │
                    │   to Vercel     │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Nightly E2E     │
                    │ (GitHub Actions)│
                    └─────────────────┘
```

---

## 6. Gaps and Redundancies

### Current Gaps (GitHub Actions Only)

1. **No Automated Deployment**
   - Manual Vercel deployments required
   - No CD (Continuous Deployment)
   - Risk of forgetting to deploy

2. **No Full Build Validation**
   - GitHub Actions runs typecheck/lint/unit tests
   - Does NOT run `npm run build` on all apps
   - Build failures could reach main branch

3. **No Prisma Generation in CI**
   - GitHub Actions doesn't run `prisma generate`
   - Could miss Prisma schema errors

### Redundancies (if CircleCI activated)

1. **Duplicate TypeScript Checks**
   - Both run `npm run typecheck`
   - Wastes CI minutes

2. **Duplicate Linting**
   - Both run `npm run lint`
   - Redundant validation

3. **Duplicate Unit Tests**
   - Both run `npm run test:unit`
   - Same tests, different platforms

### Recommendations

#### Option A: GitHub Actions Only (Current)
**Pros**: Simple, free, integrated  
**Cons**: No automated deployment, missing full build validation

**Improvements needed**:
1. Add `npm run build` to `ci.yml`
2. Add `prisma generate` to `ci.yml`
3. Add automated Vercel deployment to `ci.yml` (on main branch)

#### Option B: Hybrid (GitHub + CircleCI)
**Pros**: Best of both worlds  
**Cons**: More complex, costs money

**Division of labor**:
- **GitHub Actions**: Fast pre-merge checks (typecheck, lint, contracts)
- **CircleCI**: Full build + automated deployment

**Remove redundancies**:
- GitHub Actions: Keep typecheck, lint, unit tests, contracts
- CircleCI: Remove typecheck/lint, keep full build + deploy

#### Option C: CircleCI Only
**Pros**: Single platform, powerful features  
**Cons**: Lose GitHub integration, costs money

**Not recommended** - GitHub Actions integration is valuable

---

## 7. Recommended Next Steps

### Immediate (Fix Current Setup)

1. **Add full build to GitHub Actions**:
   ```yaml
   - name: Build All Apps
     run: npm run build
   ```

2. **Add Prisma generation**:
   ```yaml
   - name: Generate Prisma Client
     run: npx prisma generate
   ```

3. **Add automated deployment** (optional):
   ```yaml
   deploy:
     runs-on: ubuntu-latest
     if: github.ref == 'refs/heads/main'
     needs: typecheck_lint_unit
     steps:
       - uses: actions/checkout@v4
       - uses: amondnet/vercel-action@v25
         with:
           vercel-token: ${{ secrets.VERCEL_TOKEN }}
           vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
           vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
           vercel-args: '--prod'
   ```

### Future (Activate CircleCI)

1. **Connect CircleCI** to Cortiware repository
2. **Set environment variables** in CircleCI
3. **Test deployment** on a feature branch
4. **Enable for main** branch deployments
5. **Remove redundant checks** from GitHub Actions

---

## 8. Summary

| Feature | GitHub Actions | CircleCI | Status |
|---------|---------------|----------|--------|
| **TypeScript Check** | ✅ Yes | ✅ Yes (config) | ⚠️ Redundant if both active |
| **ESLint** | ✅ Yes | ✅ Yes (config) | ⚠️ Redundant if both active |
| **Unit Tests** | ✅ Yes | ✅ Yes (config) | ⚠️ Redundant if both active |
| **Full Build** | ❌ No | ✅ Yes (config) | ⚠️ Gap in current setup |
| **Prisma Generate** | ❌ No | ✅ Yes (config) | ⚠️ Gap in current setup |
| **Contract Validation** | ✅ Yes | ❌ No | ✅ Unique to GH Actions |
| **E2E Smoke Tests** | ✅ Yes | ❌ No | ✅ Unique to GH Actions |
| **Nightly Monitoring** | ✅ Yes | ❌ No | ✅ Unique to GH Actions |
| **Automated Deployment** | ❌ No | ✅ Yes (config) | ⚠️ Gap in current setup |
| **Dependency Caching** | ⚠️ Basic | ✅ Advanced | CircleCI better |
| **Build Artifacts** | ❌ No | ✅ Yes (config) | CircleCI better |
| **Currently Active** | ✅ Yes | ❌ No | CircleCI not connected |

**Current Reality**: Only GitHub Actions is active. CircleCI config exists but is not connected.

**Biggest Gap**: No automated deployment to Vercel from CI/CD.

**Recommended Action**: Either activate CircleCI OR enhance GitHub Actions with build + deployment steps.

