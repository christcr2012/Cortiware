# TypeScript Error Inventory & Fix Plan
**Date:** 2025-10-10  
**Total Errors:** 147 TypeScript errors in provider-portal  
**Status:** 🔴 CRITICAL - Systematic remediation required

---

## Error Summary by Category

| Category | Count | Files | Priority | Est. Time |
|----------|-------|-------|----------|-----------|
| Prisma Schema Mismatches | 2 | 2 | P0 | 15 min |
| JSON Field Type Issues | 3 | 3 | P0 | 10 min |
| Service Type Mismatches | 120+ | 10 | P1 | 2 hours |
| Implicit Any Types | 22 | 6 | P2 | 30 min |
| **TOTAL** | **147** | **21** | - | **~3 hours** |

---

## P0: Prisma Schema Mismatches (2 errors)

### File: `prisma/seed-leads.ts`

**Error 1 (Line 23):**
```
Property 'slug' does not exist in type 'OrgCreateInput'
```

**Fix:**
```typescript
// BEFORE
{
  id: 'org_test_leads_' + Date.now(),
  name: 'Test Organization for Leads',
  slug: 'test-org-leads',  // ❌ Remove - not in provider schema
  tier: 'PROFESSIONAL',
}

// AFTER
{
  id: 'org_test_leads_' + Date.now(),
  name: 'Test Organization for Leads',
  // slug removed - field doesn't exist in provider-portal schema
}
```

**Error 2 (Line 127):**
```
Property 'publicId' is missing in type '...' but required in type 'LeadUncheckedCreateInput'
```

**Fix:**
```typescript
// Add publicId generation
{
  identityHash: `hash_${i}`,
  publicId: `lead_${Date.now()}_${i}`,  // ✅ Add this
  orgId: org.id,
  status: 'NEW',
  // ... rest of fields
}
```

---

## P0: JSON Field Type Issues (3 errors)

### File: `src/app/api/provider/leads/bulk-reclassify/route.ts` (Line 76)

**Error:**
```
Type 'null' is not assignable to type 'InputJsonValue | NullableJsonNullValueInput | undefined'
```

**Fix:**
```typescript
import { Prisma } from '@prisma/client-provider';

// BEFORE
metadata: null,  // ❌

// AFTER
metadata: Prisma.JsonNull,  // ✅
```

### File: `src/app/api/provider/leads/quality-score/route.ts` (Line 67)

**Error:**
```
Type 'number | null' is not assignable to type 'InputJsonValue | NullableJsonNullValueInput | undefined'
```

**Fix:**
```typescript
// BEFORE
qualityScore: score,  // where score can be null

// AFTER
qualityScore: score ?? Prisma.JsonNull,  // ✅
```

### File: `src/app/api/provider/leads/reclassify/route.ts` (Line 71)

**Error:**
```
Type 'ClassificationType | null' is not assignable to type 'InputJsonValue | NullableJsonNullValueInput | undefined'
```

**Fix:**
```typescript
// BEFORE
classificationType: type,  // where type can be null

// AFTER
classificationType: type ?? Prisma.JsonNull,  // ✅
```

---

## P1: Service Type Mismatches (120+ errors in 10 files)

### Pattern: Component expects different shape than service returns

**Root Cause:** Services were updated but component type expectations weren't

**Fix Strategy:** Update component type annotations to match service return types

### File 1: `src/app/provider/addons/page.tsx` (16 errors)

**Service Returns:**
```typescript
type AddonSummary = {
  totalPurchases: number;
  totalRefunds: number;
  totalRevenueCents: number;
  netRevenueCents: number;
  topSkus: { sku: string; count: number; revenueCents: number; }[];
};

type AddonPurchaseItem = {
  id: string;
  orgId: string;
  orgName: string;
  sku: string;
  amount: number;
  status: string;
  purchasedAt: Date;
};
```

**Component Expects:**
```typescript
let summary = { totalPurchases: 0, totalRefunds: 0, totalRevenueCents: 0, netRevenueCents: 0, topSkus: [] };
let purchases = { items: [], nextCursor: null };
```

**Fix:**
```typescript
// Add explicit types
let summary: AddonSummary = { totalPurchases: 0, totalRefunds: 0, totalRevenueCents: 0, netRevenueCents: 0, topSkus: [] };
let purchases: { items: AddonPurchaseItem[]; nextCursor: string | null } = { items: [], nextCursor: null };
```

### File 2: `src/app/provider/ai/page.tsx` (8 errors)

**Service Returns:**
```typescript
type AiOverview = {
  monthKey: string;
  totals: { creditsUsed: number; callCount: number; tokensIn: number; tokensOut: number; costUsd: number; };
  topOrgs: { orgId: string; orgName: string; creditsUsed: number; tokensIn: number; tokensOut: number; costUsd: number; }[];
  recent: AiUsageEvent[];
};
```

**Fix:**
```typescript
let overview: AiOverview = {
  monthKey: '',
  totals: { creditsUsed: 0, callCount: 0, tokensIn: 0, tokensOut: 0, costUsd: 0 },
  topOrgs: [],
  recent: []
};
```

### File 3: `src/app/provider/api-usage/page.tsx` (2 errors)

**Missing Property:** `avgRequestsPerTenant`

**Fix:**
```typescript
type GlobalMetrics = {
  totalRequests: number;
  totalTenants: number;
  avgRequestsPerTenant: number;  // ✅ Add this
  totalRequestsLast24h: number;
  avgErrorRate: number;
  avgResponseTime: number;
  topTenants: { tenantId: string; tenantName: string; requests: number; }[];
  approachingLimits: { tenantId: string; tenantName: string; usage: number; limit: number; }[];
};
```

### File 4: `src/app/provider/audit/page.tsx` (20 errors)

**Service Returns:**
```typescript
type AuditSummary = {
  totalEvents: number;
  uniqueEntities: number;
  uniqueOrgs: number;
  topEntities: { entity: string; count: number; }[];
  topUsers: { entity: string; count: number; }[];
  recentEvents: AuditEventItem[];
};
```

**Fix:** Add explicit types matching service returns

### File 5: `src/app/provider/branding/page.tsx` (6 errors)

**Service Returns:**
```typescript
type BrandingStats = {
  totalOrgs: number;
  orgsWithBranding: number;
  orgsWithLogo: number;
  orgsWithCustomColors: number;
  brandingAdoptionRate: number;
};
```

**Component Expects:**
```typescript
let stats = { total: 0, withBranding: 0, templates: 0 };  // ❌ Wrong shape
```

**Fix:**
```typescript
let stats: BrandingStats = {
  totalOrgs: 0,
  orgsWithBranding: 0,
  orgsWithLogo: 0,
  orgsWithCustomColors: 0,
  brandingAdoptionRate: 0
};
```

### File 6: `src/app/provider/leads/page.tsx` (4 errors)

**Missing Properties:** `qualified`, `conversionRate`

**Fix:**
```typescript
type LeadSummary = {
  total: number;
  newToday: number;
  qualified: number;  // ✅ Add
  converted: number;
  conversionRate: number;  // ✅ Add
  byStatus: { status: string; count: number; }[];
};
```

### File 7: `src/app/provider/provisioning/page.tsx` (6 errors)

**Missing Properties:** `inProgress`, `awaitingApproval`, `successRate`, `avgCompletionTimeMinutes`

**Fix:**
```typescript
type WorkflowStats = {
  total: number;
  active: number;
  completed: number;
  inProgress: number;  // ✅ Add
  awaitingApproval: number;  // ✅ Add
  failed: number;
  successRate: number;  // ✅ Add
  avgCompletionTimeMinutes: number;  // ✅ Add
};
```

### File 8: `src/app/provider/revenue-intelligence/page.tsx` (20 errors)

**Multiple Type Mismatches:**
- `RevenueMetrics` - missing 8 properties
- `ExpansionMetrics` - missing 6 properties
- `ChurnImpact` - missing 5 properties
- `LtvCacMetrics` - missing 5 properties
- `RevenueWaterfall` - wrong type entirely

**Fix:** Update all type definitions to match service returns

### File 9: `src/app/provider/subscriptions/page.tsx` (14 errors)

**Service Returns:**
```typescript
type SubscriptionListItem = {
  id: string;
  orgId: string;
  orgName: string;
  plan: string;
  status: string;
  priceCents: number;
  startedAt: Date;
  renewsAt: Date | null;
};
```

**Fix:** Add explicit type annotation

### File 10: `src/app/provider/usage/page.tsx` (14 errors)

**Service Returns:**
```typescript
type UsageSummary = {
  totalMeters: number;
  totalQuantity: number;
  uniqueOrgs: number;
  topMeters: { meter: string; quantity: number; }[];
};

type UsageMeterItem = {
  id: string;
  orgId: string;
  orgName: string;
  meter: string;
  quantity: number;
  windowStart: Date;
  windowEnd: Date;
};
```

**Fix:** Add explicit type annotations

---

## P2: Implicit Any Types (22 errors in 6 files)

### Pattern: Variables initialized without type annotations

**Files:**
1. `src/app/provider/branding/page.tsx` - `configs`, `templates`
2. `src/app/provider/provisioning/page.tsx` - `templates`, `workflows`
3. `src/app/provider/revenue-intelligence/page.tsx` - `forecast`, `cohorts`

**Fix Pattern:**
```typescript
// BEFORE
let configs = [];  // ❌ Implicit any[]

// AFTER
let configs: BrandingConfig[] = [];  // ✅ Explicit type
```

---

## Fix Execution Plan

### Phase 1: P0 Fixes (25 minutes)

1. **Prisma Schema Fixes** (15 min)
   - Remove `slug` field from seed-leads.ts
   - Add `publicId` generation to seed-leads.ts
   - Verify: `npm run typecheck -- --filter=provider-portal`

2. **JSON Field Fixes** (10 min)
   - Import `Prisma` from `@prisma/client-provider`
   - Replace `null` with `Prisma.JsonNull` in 3 files
   - Verify: `npm run typecheck -- --filter=provider-portal`

### Phase 2: P1 Fixes (2 hours)

3. **Service Type Mismatches** (2 hours)
   - Fix each of 10 page components systematically
   - Add explicit type annotations
   - Match service return types
   - Verify after each file: `npm run typecheck -- --filter=provider-portal`

### Phase 3: P2 Fixes (30 minutes)

4. **Implicit Any Types** (30 min)
   - Add explicit type annotations to 6 files
   - Verify: `npm run typecheck -- --filter=provider-portal`

### Phase 4: Verification (15 minutes)

5. **Final Checks**
   - `npm run typecheck` (all apps)
   - `npm run build -- --filter=provider-portal`
   - `npm run test:unit`
   - Verify CI/CD pipeline

---

## Success Criteria

✅ **Phase Complete When:**
- Zero TypeScript errors in provider-portal
- `npm run typecheck -- --filter=provider-portal` passes
- `npm run build -- --filter=provider-portal` succeeds
- All 71/71 tests still pass
- Ready to remove `ignoreBuildErrors: true`

---

**Estimated Total Time:** 3 hours 10 minutes  
**Priority:** CRITICAL - Blocks all other work  
**Next Step:** Begin Phase 1 - P0 Fixes

---

**Report Generated:** 2025-10-10  
**Author:** Augment Agent (TypeScript Error Inventory)

