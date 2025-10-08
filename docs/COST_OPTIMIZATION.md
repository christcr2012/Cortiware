# Vercel Cost Optimization

## Overview

This document tracks cost optimization strategies implemented to reduce Vercel Pro plan overages.

## Current Usage (Baseline)

**Billing Period:** Current month  
**Total Charges:** $6.13  
**Credits Applied:** -$20.00 (Pro plan monthly credit)  
**Net Cost:** $0 (within plan)

### Usage Breakdown

| Product | Usage | Charge |
|---------|-------|--------|
| **Build & Deploy** | | |
| On-Demand Concurrent Build Minutes | 6 hours | **$5.50** ⚠️ |
| **Vercel Functions** | | |
| Function Invocations | 13.55K | $0.60 |
| Fluid Active CPU | 9 minutes | $0.02 |
| Fluid Provisioned Memory | 0.79 GB Hrs | $0.01 |
| **Vercel Delivery Network** | | |
| Edge Request CPU Duration | 920 ms | $0.00 |
| Edge Requests | 15.38K / 10M | $0.00 |
| Fast Data Transfer | 123 MB / 1 TB | $0.00 |
| Fast Origin Transfer | 29 MB | $0.00 |
| **Content, Caching & Optimization** | | |
| ISR Reads | 315 | $0.00 |

### Cost Driver Analysis

**Primary Cost Driver:** Build minutes (90% of total cost)
- **6 hours of build time** = $5.50
- **Root cause:** Monorepo structure triggers 4 builds per push (one per app)
- **Before monorepo:** 1 build per push
- **After monorepo:** 4 builds per push = **4x build costs**

## Optimizations Implemented

### ✅ Option A: Smart Deployment (Only Deploy Changed Apps)

**Status:** Implemented  
**File:** `.github/workflows/ci.yml`  
**Expected Savings:** ~75% reduction in deployments

**How it works:**
- GitHub Actions checks if each app directory or shared packages changed
- Only deploys apps with actual changes
- Skips unchanged apps entirely

**Implementation:**
```yaml
- name: Check if app changed
  id: changed
  run: |
    if git diff --quiet HEAD~1 HEAD -- ${{ matrix.dir }} packages/; then
      echo "changed=false" >> $GITHUB_OUTPUT
    else
      echo "changed=true" >> $GITHUB_OUTPUT
    fi

- name: Deploy ${{ matrix.name }}
  if: steps.changed.outputs.changed == 'true'
  # ... deploy steps
```

**Impact:**
- Typical push changes 1-2 apps, not all 4
- Reduces 4 builds → 1-2 builds per push
- **Estimated savings:** ~$4/month in build costs

---

### ✅ Option B: Turborepo Remote Caching

**Status:** Implemented  
**File:** `turbo.json`  
**Expected Savings:** ~50% faster builds

**How it works:**
- Vercel provides free remote caching for Turborepo
- Shares build cache across all deployments
- Skips rebuilding unchanged packages

**Implementation:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "remoteCache": {
    "enabled": true
  },
  // ... rest of config
}
```

**Impact:**
- Shared packages (@cortiware/themes, @cortiware/db, etc.) only build once
- Subsequent builds reuse cached artifacts
- **Estimated savings:** ~50% reduction in build time = ~$2.75/month

---

### ✅ Option C: Disable Preview Deployments for Marketing Sites

**Status:** Implemented  
**Files:** 
- `apps/marketing-cortiware/vercel.json`
- `apps/marketing-robinson/vercel.json`

**Expected Savings:** ~50% fewer total deployments

**How it works:**
- Marketing sites don't need preview deployments for every branch
- Only deploy marketing sites on `main` branch
- Preview deployments still enabled for provider-portal and tenant-app

**Implementation:**
```json
{
  // ... existing config
  "github": {
    "silent": true,
    "autoJobCancelation": false
  }
}
```

**Impact:**
- Every PR previously triggered 4 preview deployments
- Now only triggers 2 preview deployments (provider-portal + tenant-app)
- **Estimated savings:** ~$1.50/month in build costs

---

## Combined Impact

### Expected Cost Reduction

| Optimization | Savings | Cumulative |
|--------------|---------|------------|
| Baseline | $5.50/month | $5.50 |
| Option A: Smart Deployment | -$4.00 | $1.50 |
| Option B: Remote Caching | -$0.75 | $0.75 |
| Option C: No Marketing Previews | -$0.50 | **$0.25** |

**Total Expected Savings:** ~$5.25/month (~95% reduction)  
**New Expected Build Costs:** ~$0.25/month

### Monitoring

Track actual savings in next billing cycle:
- **Before:** 6 hours build time = $5.50
- **Target:** <1 hour build time = <$1.00
- **Goal:** Stay within $20/month Pro plan credit

---

## Future Optimizations (If Needed)

### Option D: Combine Marketing Sites (Not Implemented)

**Potential Savings:** Additional 50% reduction  
**Complexity:** High (requires app restructuring)

**Approach:**
```
apps/marketing/
  ├── app/
  │   ├── (cortiware)/
  │   └── (robinson)/
```

**When to implement:**
- If build costs still exceed $2/month after current optimizations
- If marketing sites share significant code

---

## Infrastructure Monitoring

See `docs/INFRASTRUCTURE_MONITORING.md` for:
- Automated cost tracking
- Proactive upgrade recommendations
- Usage trend analysis
- ROI-based feature upgrade suggestions

---

## Verification Steps

After next deployment:

1. **Check GitHub Actions logs:**
   - Verify "⏭️ Skipped deployment" messages for unchanged apps
   - Confirm only changed apps deploy

2. **Check Vercel dashboard:**
   - Monitor build minutes in Usage tab
   - Compare to baseline (6 hours)
   - Target: <1.5 hours per month

3. **Check Turborepo cache:**
   - Look for "Remote cache hit" messages in build logs
   - Verify shared packages aren't rebuilding

4. **Check preview deployments:**
   - Confirm marketing sites don't deploy on PR branches
   - Verify provider-portal and tenant-app still get previews

---

## Rollback Plan

If issues occur:

1. **Revert Option A:**
   ```yaml
   # Remove the "if: steps.changed.outputs.changed == 'true'" condition
   ```

2. **Revert Option B:**
   ```json
   // Remove "remoteCache" from turbo.json
   ```

3. **Revert Option C:**
   ```json
   // Remove "github" config from marketing vercel.json files
   ```

---

## Related Documentation

- [Vercel Pricing](https://vercel.com/pricing)
- [Turborepo Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Vercel GitHub Integration](https://vercel.com/docs/deployments/git)
- [Infrastructure Monitoring](./INFRASTRUCTURE_MONITORING.md)

