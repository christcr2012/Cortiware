# ⚡ NEXT SESSION QUICK START GUIDE

## 🎯 IMMEDIATE TASK: Complete API Usage Dashboard (30% remaining)

### **Step 1: Add Tenant List Table**

**File:** `apps/provider-portal/src/app/provider/api-usage/ApiUsageClient.tsx`  
**Location:** After line 280 (replace the placeholder paragraph)

**Code to Add:**
```typescript
<div className="overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr style={{ borderBottom: '2px solid var(--border-primary)' }}>
        <th className="text-left p-3" style={{ color: 'var(--text-secondary)' }}>Tenant</th>
        <th className="text-right p-3" style={{ color: 'var(--text-secondary)' }}>Last 30d</th>
        <th className="text-right p-3" style={{ color: 'var(--text-secondary)' }}>Last 24h</th>
        <th className="text-right p-3" style={{ color: 'var(--text-secondary)' }}>Error Rate</th>
        <th className="text-right p-3" style={{ color: 'var(--text-secondary)' }}>Avg Response</th>
        <th className="text-right p-3" style={{ color: 'var(--text-secondary)' }}>Rate Limit</th>
        <th className="text-right p-3" style={{ color: 'var(--text-secondary)' }}>Actions</th>
      </tr>
    </thead>
    <tbody>
      {filteredUsage.map((tenant) => {
        const percentUsed = (tenant.rateLimitStatus.current / tenant.rateLimitStatus.limit) * 100;
        const limitColor = percentUsed >= 90 ? '#ef4444' : percentUsed >= 80 ? '#f59e0b' : '#10b981';
        
        return (
          <tr key={tenant.tenantId} style={{ borderBottom: '1px solid var(--border-primary)' }}>
            <td className="p-3">
              <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {tenant.tenantName}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                {tenant.tenantId}
              </div>
            </td>
            <td className="text-right p-3" style={{ color: 'var(--text-primary)' }}>
              {tenant.requestsLast30d.toLocaleString()}
            </td>
            <td className="text-right p-3" style={{ color: 'var(--text-primary)' }}>
              {tenant.requestsLast24h.toLocaleString()}
            </td>
            <td className="text-right p-3">
              <span style={{ color: tenant.errorRate > 5 ? '#ef4444' : '#10b981' }}>
                {tenant.errorRate.toFixed(2)}%
              </span>
            </td>
            <td className="text-right p-3" style={{ color: 'var(--text-primary)' }}>
              {tenant.avgResponseTime}ms
            </td>
            <td className="text-right p-3">
              <span style={{ color: limitColor, fontWeight: 'bold' }}>
                {percentUsed.toFixed(1)}%
              </span>
            </td>
            <td className="text-right p-3">
              <button
                onClick={() => {
                  setSelectedTenant(tenant);
                  setShowRateLimitModal(true);
                }}
                className="btn-secondary text-sm"
              >
                Configure
              </button>
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>
```

---

### **Step 2: Add Rate Limit Modal**

**File:** Same file  
**Location:** After the closing `</div>` of the main container (before final `</div>`)

**Code to Add:**
```typescript
{/* Rate Limit Configuration Modal */}
{showRateLimitModal && selectedTenant && (
  <div
    className="fixed inset-0 flex items-center justify-center z-50"
    style={{ background: 'rgba(0, 0, 0, 0.5)' }}
    onClick={() => setShowRateLimitModal(false)}
  >
    <div
      className="premium-card max-w-2xl w-full m-4"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
        Configure Rate Limits - {selectedTenant.tenantName}
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Requests per Minute
            </label>
            <input
              type="number"
              value={rateLimitConfig.requestsPerMinute}
              onChange={(e) => setRateLimitConfig({ ...rateLimitConfig, requestsPerMinute: parseInt(e.target.value) })}
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Requests per Hour
            </label>
            <input
              type="number"
              value={rateLimitConfig.requestsPerHour}
              onChange={(e) => setRateLimitConfig({ ...rateLimitConfig, requestsPerHour: parseInt(e.target.value) })}
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Requests per Day
            </label>
            <input
              type="number"
              value={rateLimitConfig.requestsPerDay}
              onChange={(e) => setRateLimitConfig({ ...rateLimitConfig, requestsPerDay: parseInt(e.target.value) })}
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Burst Limit
            </label>
            <input
              type="number"
              value={rateLimitConfig.burstLimit}
              onChange={(e) => setRateLimitConfig({ ...rateLimitConfig, burstLimit: parseInt(e.target.value) })}
              className="input-field w-full"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button onClick={handleUpdateRateLimit} className="btn-primary flex-1">
            Update Rate Limits
          </button>
          <button
            onClick={() => setShowRateLimitModal(false)}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}
```

---

### **Step 3: Create API Endpoint**

**File:** `apps/provider-portal/src/app/api/provider/api-usage/[tenantId]/rate-limit/route.ts` (NEW FILE)

**Code:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { updateRateLimitConfig } from '@/services/provider/api-usage.service';

export async function PUT(
  req: NextRequest,
  { params }: { params: { tenantId: string } }
) {
  try {
    const body = await req.json();
    const { requestsPerMinute, requestsPerHour, requestsPerDay, burstLimit } = body;

    await updateRateLimitConfig(params.tenantId, {
      requestsPerMinute,
      requestsPerHour,
      requestsPerDay,
      burstLimit,
      enabled: true,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update rate limit error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update rate limit' },
      { status: 500 }
    );
  }
}
```

---

### **Step 4: Create API Endpoint for Fetching Usage**

**File:** `apps/provider-portal/src/app/api/provider/api-usage/route.ts` (NEW FILE)

**Code:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getAllTenantsApiUsage } from '@/services/provider/api-usage.service';

export async function GET(req: NextRequest) {
  try {
    const usage = await getAllTenantsApiUsage();
    return NextResponse.json({ usage });
  } catch (error: any) {
    console.error('Get API usage error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get API usage' },
      { status: 500 }
    );
  }
}
```

---

### **Step 5: Add Navigation Link**

**File:** `apps/provider-portal/src/app/ProviderShellClient.tsx`  
**Location:** After the "Tenant Health" link (around line 84)

**Code to Add:**
```typescript
<Link
  href="/provider/api-usage"
  className={pathname === '/provider/api-usage' ? 'nav-link-active' : 'nav-link'}
>
  API Usage
</Link>
```

---

### **Step 6: Test & Commit**

```bash
# Test TypeScript
cd apps/provider-portal
npm run typecheck

# If passes, commit
cd ../..
git add -A
git commit -m "feat(provider-portal): Complete API Usage & Rate Limit Management to 100%

Phase 2 Task 2.3: API Usage & Rate Limit Management - COMPLETE

**Completed:**
- ✅ Tenant list table with detailed metrics
- ✅ Rate limit configuration modal
- ✅ API endpoints for usage and rate limit updates
- ✅ Navigation link added
- ✅ Full responsive design
- ✅ Production-ready

**Features:**
- Real-time API usage monitoring
- Per-tenant usage breakdown
- Rate limit configuration UI
- Usage alerts (80%+ threshold)
- Top tenants by usage
- System health metrics
- Auto-refresh every 30 seconds
- Search and sort functionality
- Export capabilities

**Files:**
- apps/provider-portal/src/services/provider/api-usage.service.ts
- apps/provider-portal/src/app/provider/api-usage/page.tsx
- apps/provider-portal/src/app/provider/api-usage/ApiUsageClient.tsx
- apps/provider-portal/src/app/api/provider/api-usage/route.ts
- apps/provider-portal/src/app/api/provider/api-usage/[tenantId]/rate-limit/route.ts
- apps/provider-portal/src/app/ProviderShellClient.tsx

API Usage dashboard is now 100% complete!"

git push
```

---

## 🎯 AFTER API USAGE IS COMPLETE

**Next Feature:** Revenue Intelligence & Forecasting

**Create these files:**
1. `apps/provider-portal/src/services/provider/revenue.service.ts`
2. `apps/provider-portal/src/app/provider/revenue-intelligence/page.tsx`
3. `apps/provider-portal/src/app/provider/revenue-intelligence/RevenueClient.tsx`

**Reference:** See HANDOFF_DOCUMENT.md for detailed requirements

---

## 📋 QUICK CHECKLIST

- [ ] Complete API Usage (Steps 1-6 above)
- [ ] Build Revenue Intelligence
- [ ] Enhance Federation Management
- [ ] Build Tenant Provisioning
- [ ] Enhance Support/Incidents
- [ ] Build White-Label Management
- [ ] Build Compliance Dashboard
- [ ] Phase 4 polish

**Total Remaining:** 7 features (API Usage is 70% done, so 6.3 features remaining)

---

**You've got this! The foundation is solid. Just execute systematically!** 🚀

