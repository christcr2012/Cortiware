# Provider Portal Implementation Plan

**Product**: Cortiware  
**Company**: Robinson AI Systems  
**Date**: 2025-10-06  
**Status**: ✅ Critical Fix Complete, 2 Features Remaining

---

## EXECUTIVE SUMMARY

I have completed comprehensive testing of the Provider Portal and fixed the critical monetization page issue. Here's the current status and implementation plan:

### Current Status
- ✅ **14 pages working** (including monetization - just fixed!)
- 🚧 **2 pages incomplete** (Client Accounts, Federation)
- 📊 **Total pages**: 16
- 🎯 **Completion**: 87.5%

### What Was Fixed
1. ✅ **Monetization page** - Fixed 500 error by adding fallback URL for development

### What Remains
1. 🚧 **Client Accounts page** - "Coming Soon" placeholder (6-8 hours)
2. 🚧 **Federation page** - "Coming Soon" placeholder (4-6 hours)

---

## PHASE 1: CRITICAL FIX ✅ COMPLETE

### 1.1 Fix Monetization Page
**Status**: ✅ COMPLETE  
**Time Taken**: 15 minutes  
**Priority**: 🔴 HIGH

**Issue**: 500 Internal Server Error due to missing `NEXT_PUBLIC_BASE_URL`

**Solution Implemented**:
```typescript
// src/app/(provider)/provider/monetization/page.tsx
async function fetchJSON(path: string) {
  // Use absolute URL for server-side fetching in development
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                  (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');
  const url = baseUrl ? `${baseUrl}${path}` : path;
  
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}
```

**Result**: Monetization page now loads successfully with all features:
- Global Defaults section
- Plans & Prices display
- Create Plan form
- Create Price form
- Generate Onboarding Invite form
- Global Defaults configuration
- Coupons management
- Offers management
- Tenant Price Overrides

**Screenshot**: `provider-monetization-fixed.png`

---

## PHASE 2: IMPLEMENT CLIENT ACCOUNTS PAGE

### 2.1 Client Accounts Page
**Status**: 🚧 TODO  
**Priority**: 🟡 MEDIUM  
**Estimated Time**: 6-8 hours

**Current State**:
- Page shows "Coming Soon" placeholder
- Referenced in dashboard KPI (2 Total Clients)

**Required Features**:

#### 2.1.1 Client List View (2-3 hours)
**Components**:
- Table with columns: Name, Users, Subscription, Status, Created, Actions
- Pagination (10/25/50/100 per page)
- Search by name/email
- Filter by status (active/inactive/suspended)
- Sort by name, created date, user count

**Data to Display**:
- Organization name
- Number of users
- Current subscription plan
- Subscription status (active/trialing/canceled)
- Created date
- Action buttons (View, Edit, Suspend, Delete)

**API Endpoint**:
```typescript
// GET /api/provider/clients
// Query params: page, limit, search, status, sortBy, sortOrder
{
  items: [
    {
      id: "org_123",
      name: "Acme Corp",
      userCount: 15,
      subscription: {
        plan: "Professional",
        status: "active",
        price: "$99/month"
      },
      createdAt: "2025-10-01T00:00:00.000Z",
      status: "active"
    }
  ],
  total: 100,
  page: 1,
  limit: 25
}
```

#### 2.1.2 Client Details Modal (2-3 hours)
**Sections**:
1. **Organization Info**
   - Name, ID, Created date
   - Owner email
   - Status (active/suspended)

2. **Users**
   - List of users with roles
   - User count
   - Last active dates

3. **Subscription**
   - Current plan
   - Price
   - Status
   - Next billing date
   - Trial end date (if applicable)

4. **Usage Metrics**
   - Active users (30d)
   - API calls (30d)
   - Storage used
   - AI credits used

5. **Billing History**
   - Recent invoices
   - Payment status
   - Total revenue

**API Endpoint**:
```typescript
// GET /api/provider/clients/[id]
{
  id: "org_123",
  name: "Acme Corp",
  createdAt: "2025-10-01T00:00:00.000Z",
  owner: {
    email: "owner@acme.com",
    name: "John Doe"
  },
  users: [
    { id: "user_1", email: "user1@acme.com", role: "admin", lastActive: "..." },
    { id: "user_2", email: "user2@acme.com", role: "member", lastActive: "..." }
  ],
  subscription: {
    plan: "Professional",
    price: "$99/month",
    status: "active",
    nextBillingDate: "2025-11-01",
    trialEndDate: null
  },
  usage: {
    activeUsers30d: 12,
    apiCalls30d: 5000,
    storageUsedMB: 250,
    aiCreditsUsed: 100
  },
  billing: {
    totalRevenue: 990,
    invoices: [...]
  }
}
```

#### 2.1.3 Client Actions (1-2 hours)
**Actions**:
1. **View Details** - Open modal/page with full details
2. **Edit Organization** - Update name, settings
3. **Suspend Account** - Temporarily disable access
4. **Unsuspend Account** - Re-enable access
5. **Delete Account** - Permanently delete (with confirmation)

**API Endpoints**:
```typescript
// PATCH /api/provider/clients/[id]
// Body: { name?, status? }

// DELETE /api/provider/clients/[id]
// Requires confirmation
```

#### 2.1.4 Implementation Steps
1. Create API routes:
   - `src/app/api/provider/clients/route.ts` (GET list)
   - `src/app/api/provider/clients/[id]/route.ts` (GET, PATCH, DELETE)

2. Create page component:
   - `src/app/(provider)/provider/clients/page.tsx`

3. Create client components:
   - `ClientListTable.tsx` - Table with pagination
   - `ClientDetailsModal.tsx` - Modal with full details
   - `ClientFilters.tsx` - Search and filter controls
   - `ClientActions.tsx` - Action buttons

4. Add to navigation (already present)

5. Test all functionality

---

## PHASE 3: IMPLEMENT FEDERATION PAGE

### 3.1 Federation Management Page
**Status**: 🚧 TODO  
**Priority**: 🟢 LOW  
**Estimated Time**: 4-6 hours

**Current State**:
- Page shows "Coming Soon" placeholder
- Federation APIs already work (documented in `docs/federation/`)

**Required Features**:

#### 3.1.1 Federation Keys Management (2-3 hours)
**Components**:
- List of API keys with details
- Generate new key button
- Revoke key button
- Copy key to clipboard

**Data to Display**:
- Key ID
- Key prefix (first 8 chars)
- Created date
- Last used date
- Permissions/scopes
- Status (active/revoked)

**API Endpoints**:
```typescript
// GET /api/provider/federation/keys
{
  items: [
    {
      id: "key_123",
      prefix: "sk_live_",
      createdAt: "2025-10-01",
      lastUsed: "2025-10-06",
      scopes: ["tenants:read", "tenants:write"],
      status: "active"
    }
  ]
}

// POST /api/provider/federation/keys
// Body: { name, scopes[] }
// Returns: { id, key: "sk_live_..." }

// DELETE /api/provider/federation/keys/[id]
```

#### 3.1.2 OIDC Configuration (1-2 hours)
**Components**:
- OIDC provider settings form
- Test connection button
- Status indicator

**Fields**:
- OIDC Issuer URL
- Client ID
- Client Secret (masked)
- Redirect URI (read-only)
- Scopes (multi-select)
- Enabled/Disabled toggle

**API Endpoints**:
```typescript
// GET /api/provider/federation/oidc
{
  issuer: "https://auth.example.com",
  clientId: "client_123",
  redirectUri: "https://app.cortiware.com/api/auth/oidc/callback",
  scopes: ["openid", "profile", "email"],
  enabled: true
}

// PATCH /api/provider/federation/oidc
// Body: { issuer?, clientId?, clientSecret?, scopes?, enabled? }

// POST /api/provider/federation/oidc/test
// Tests OIDC connection
```

#### 3.1.3 Cross-Provider Integrations (1-2 hours)
**Components**:
- List of connected providers
- Add provider button
- Configure provider modal
- Test connection button

**Data to Display**:
- Provider name
- Provider type (OIDC, SAML, etc.)
- Status (connected/disconnected)
- Last sync date

**API Endpoints**:
```typescript
// GET /api/provider/federation/providers
{
  items: [
    {
      id: "prov_123",
      name: "External Provider",
      type: "oidc",
      status: "connected",
      lastSync: "2025-10-06"
    }
  ]
}

// POST /api/provider/federation/providers
// Body: { name, type, config }

// PATCH /api/provider/federation/providers/[id]
// Body: { name?, config? }

// DELETE /api/provider/federation/providers/[id]
```

#### 3.1.4 Implementation Steps
1. Create API routes:
   - `src/app/api/provider/federation/keys/route.ts`
   - `src/app/api/provider/federation/keys/[id]/route.ts`
   - `src/app/api/provider/federation/oidc/route.ts`
   - `src/app/api/provider/federation/oidc/test/route.ts`
   - `src/app/api/provider/federation/providers/route.ts`
   - `src/app/api/provider/federation/providers/[id]/route.ts`

2. Create page component:
   - `src/app/(provider)/provider/federation/page.tsx`

3. Create client components:
   - `FederationKeysList.tsx` - List of keys
   - `GenerateKeyModal.tsx` - Generate new key
   - `OIDCConfigForm.tsx` - OIDC settings
   - `ProvidersList.tsx` - List of providers
   - `AddProviderModal.tsx` - Add new provider

4. Test all functionality

---

## PHASE 4: ENHANCEMENTS (OPTIONAL)

### 4.1 Add Monetization to Sidebar
**Status**: 🟡 TODO  
**Priority**: 🟢 LOW  
**Estimated Time**: 15 minutes

**Issue**: Monetization page exists but is not in sidebar navigation

**Solution**:
Add "Monetization" link to sidebar under "Revenue Streams" section

**File to Modify**: `src/components/provider/ProviderSidebar.tsx` (or equivalent)

**Change**:
```typescript
// Add after "Billing & Revenue"
<Link href="/provider/monetization">
  Monetization
</Link>
```

---

### 4.2 Improve Analytics Page
**Status**: 🟡 TODO  
**Priority**: 🟢 LOW  
**Estimated Time**: 3-4 hours

**Issue**: Analytics page is primarily theme selector, not analytics

**Solution**:
1. Move theme selector to Settings page only
2. Add real analytics to Analytics page:
   - Revenue trends (MRR/ARR over time)
   - User growth (new users, active users)
   - Conversion funnels (invite → signup → active)
   - Top clients by revenue
   - Top features by usage
   - Charts/graphs for visual representation

---

### 4.3 Implement Full Incident Tracking
**Status**: 🟡 TODO  
**Priority**: 🟢 LOW  
**Estimated Time**: 6-8 hours

**Issue**: Incidents page shows summary metrics but full system not implemented

**Solution**:
1. Create Incident model in Prisma schema
2. Implement incident CRUD operations
3. Add incident list/detail pages
4. Add SLA tracking
5. Add escalation workflows
6. Add incident timeline
7. Add incident comments/notes

---

## SUMMARY

### Completed ✅
1. **Monetization page fix** - 15 minutes

### Remaining Work 🚧
1. **Client Accounts page** - 6-8 hours
2. **Federation page** - 4-6 hours
3. **Optional enhancements** - 10-13 hours

### Total Estimated Time
- **Required**: 10-14 hours
- **Optional**: 10-13 hours
- **Total**: 20-27 hours

### Priority Order
1. **Immediate** (✅ DONE): Fix monetization page
2. **High** (6-8 hours): Implement Client Accounts page
3. **Medium** (4-6 hours): Implement Federation page
4. **Low** (10-13 hours): Optional enhancements

---

**End of Implementation Plan**

