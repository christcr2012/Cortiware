# Comprehensive Fix Plan for Provider Portal

## Root Causes Identified

### 1. **Server-Side Exceptions During Build**
- Pages are calling database queries during Next.js static generation
- Even with try-catch in pages, services throw errors
- Services need error handling to return empty data gracefully

### 2. **Missing Error Boundaries**
- Client-side pages don't have error boundaries
- When services fail, entire page crashes

### 3. **Inconsistent Error Handling Pattern**
- Some pages have try-catch, some don't
- Some services have error handling, most don't
- No consistent pattern across the codebase

## Systematic Fix Strategy

### Phase 1: Add Error Handling to ALL Services (PRIORITY 1)
Fix these services to return empty data on error:
1. ✅ leads.service.ts - DONE
2. ❌ ai.service.ts
3. ❌ billing.service.ts
4. ❌ audit.service.ts
5. ❌ revenue.service.ts
6. ❌ analytics.service.ts

### Phase 2: Ensure ALL Pages Have Try-Catch (PRIORITY 2)
Already done for most, verify:
1. ✅ subscriptions
2. ✅ addons
3. ✅ usage
4. ✅ audit
5. ✅ leads
6. ✅ ai
7. ✅ api-usage
8. ✅ branding
9. ✅ provisioning
10. ✅ revenue-intelligence
11. ❌ billing - CHECK
12. ❌ analytics - CHECK (client-side)
13. ❌ monetization - CHECK

### Phase 3: Fix Client-Side Pages (PRIORITY 3)
Client-side pages need error boundaries:
1. analytics/page.tsx - Add error boundary
2. revenue-intelligence/RevenueClient.tsx - Add error handling

### Phase 4: Fix API Route Issues (PRIORITY 4)
1. monetization - Fix API paths (already done)
2. analytics - Fix API path (already done)

## Implementation Order

1. Add error handling to all services (wrap all Prisma queries in try-catch)
2. Verify all server pages have try-catch
3. Add error boundaries to client pages
4. Test build locally with DATABASE_URL
5. Deploy and test in production
6. Create system-wide audit checklist

## Files to Fix

### Services (Add try-catch to all functions):
- apps/provider-portal/src/services/provider/ai.service.ts
- apps/provider-portal/src/services/provider/billing.service.ts
- apps/provider-portal/src/services/provider/audit.service.ts
- apps/provider-portal/src/services/provider/revenue.service.ts
- apps/provider-portal/src/services/provider/analytics.service.ts

### Pages (Verify try-catch exists):
- apps/provider-portal/src/app/provider/billing/page.tsx
- apps/provider-portal/src/app/provider/analytics/page.tsx (client-side)
- apps/provider-portal/src/app/provider/monetization/page.tsx

## Success Criteria

✅ All pages load without server-side exceptions
✅ All pages show empty states when data unavailable
✅ Build completes successfully with and without DATABASE_URL
✅ Production deployment works for all pages
✅ No JSON parse errors
✅ No client-side exceptions

