# Cortiware Architecture - Complete System Separation

## Critical Architectural Principle

**Provider, Developer, Accountant, and Client systems are COMPLETELY SEPARATE.**

This document explains the proper separation that has been implemented in the App Router migration.

---

## Authentication Systems (4 Separate Systems)

### 1. Client Tenant Users
- **Cookie**: `mv_user`
- **Storage**: PostgreSQL database (`User` table)
- **Authentication**: `/api/auth/login` (database lookup)
- **Authorization**: RBAC system (`src/lib/rbac.ts`)
- **Permissions**: `LEAD_READ`, `LEAD_CREATE`, `BILLING_MANAGE`, etc.
- **Routes**: `/(app)/*` - `/dashboard`, `/leads`, `/contacts`, etc.
- **Layout**: `AppShellClient` component
- **Navigation**: Dashboard, Leads, Contacts, Opportunities, Organizations, Fleet, Admin, Reports, Settings

### 2. Provider Users
- **Cookies**: `provider-session` OR `ws_provider`
- **Storage**: Environment variables (NOT database)
- **Authentication**: `/api/provider/login` (environment-based)
- **Authorization**: No RBAC - full cross-client access
- **Federation**: Can make machine-to-machine calls via `providerFederationVerify.ts`
- **Routes**: `/(provider)/*` - `/provider`, `/provider/clients`, `/provider/billing`, etc.
- **Layout**: `ProviderShellClient` component (green theme)
- **Navigation**: Dashboard, Client Accounts, Billing & Revenue, Analytics, Federation, Settings

### 3. Developer Users
- **Cookie**: `developer-session`
- **Storage**: Environment variables (NOT database)
- **Authentication**: `/api/developer/login` (environment-based)
- **Authorization**: Admin-level system access
- **Routes**: `/(developer)/*` - `/developer`, `/developer/logs`, `/developer/database`, etc.
- **Layout**: `DeveloperShellClient` component (purple theme)
- **Navigation**: Dashboard, System Logs, Database, API Explorer

### 4. Accountant Users
- **Cookie**: `accountant-session`
- **Storage**: Environment variables (NOT database)
- **Authentication**: `/api/accountant/login` (environment-based)
- **Authorization**: Financial operations access
- **Routes**: `/(accountant)/*` - `/accountant`, `/accountant/financials`, `/accountant/reports`
- **Layout**: `AccountantShellClient` component (yellow theme)
- **Navigation**: Dashboard, Financials, Reports

---

## What Was Wrong Before (The Contamination)

### Problem 1: Provider Pages Used Client Components
**File**: `src/pages/dashboard/provider.tsx`
```typescript
import AppShell from '@/components/AppShell';  // ❌ WRONG
import { useMe } from '@/lib/useMe';            // ❌ WRONG

export default function ProviderPortal() {
  const { me } = useMe();  // ❌ Fetches CLIENT user from database
  return (
    <AppShell>  {/* ❌ Shows CLIENT navigation */}
      ...
    </AppShell>
  );
}
```

**Why This Is Wrong**:
- `AppShell` shows client navigation (Dashboard, Leads, Contacts)
- `useMe()` fetches from `/api/me` which queries the database `User` table
- Provider users are NOT in the database - they're environment-based
- Provider portal should have its own navigation (Client Accounts, Billing, Federation)

### Problem 2: Provider API Endpoints Checked Client Cookies
**File**: `src/pages/api/provider/clients.ts`
```typescript
const cookies = req.headers.cookie;
if (!cookies?.includes('mv_user')) {  // ❌ WRONG - checking CLIENT cookie
  return res.status(401).json({ error: 'Unauthorized' });
}
```

**Why This Is Wrong**:
- Checking for `mv_user` (client cookie) instead of `provider-session` or `ws_provider`
- Provider endpoints should NEVER check client authentication
- This allows any logged-in client user to access provider APIs

### Problem 3: Provider Billing Page Had No Layout
**File**: `src/pages/provider/billing/index.tsx`
- No layout wrapper at all
- Used `useMe()` to check RBAC permissions (wrong - providers don't have RBAC)
- Bare HTML with inline styles
- No provider-specific navigation

---

## The Correct Solution (App Router Implementation)

### Separate Route Groups
```
src/app/
├── (app)/              # Client tenant users
│   ├── layout.tsx      # Checks mv_user cookie
│   ├── AppShellClient.tsx
│   ├── dashboard/
│   ├── leads/
│   ├── contacts/
│   └── ...
├── (provider)/         # Provider users
│   ├── layout.tsx      # Checks provider-session/ws_provider cookies
│   ├── ProviderShellClient.tsx
│   ├── clients/
│   ├── billing/
│   └── ...
├── (developer)/        # Developer users
│   ├── layout.tsx      # Checks developer-session cookie
│   ├── DeveloperShellClient.tsx
│   └── ...
└── (accountant)/       # Accountant users
    ├── layout.tsx      # Checks accountant-session cookie
    ├── AccountantShellClient.tsx
    └── ...
```

### Separate Layouts
Each system has its own layout component:
- **Client**: `AppShellClient` - Blue theme, client navigation
- **Provider**: `ProviderShellClient` - Green theme, provider navigation
- **Developer**: `DeveloperShellClient` - Purple theme, developer navigation
- **Accountant**: `AccountantShellClient` - Yellow theme, accountant navigation

### Separate Authentication Checks
Each layout checks the correct cookie:
```typescript
// Client layout
if (!cookieStore.get('mv_user')) redirect('/login');

// Provider layout
if (!cookieStore.get('provider-session') && !cookieStore.get('ws_provider')) {
  redirect('/provider/login');
}

// Developer layout
if (!cookieStore.get('developer-session')) redirect('/developer/login');

// Accountant layout
if (!cookieStore.get('accountant-session')) redirect('/accountant/login');
```

### No Shared Components Between Systems
- Client pages use `useMe()` hook - Provider/Developer/Accountant pages DO NOT
- Client pages check RBAC - Provider/Developer/Accountant pages DO NOT
- Each system has its own navigation, theme, and layout
- Only truly generic utilities (like error boundaries) are shared

---

## API Endpoint Separation

### Client API Endpoints
- **Path**: `/api/auth/*`, `/api/leads/*`, `/api/dashboard/*`, etc.
- **Authentication**: Check `mv_user` cookie
- **Authorization**: Use `assertPermission()` from `src/lib/rbac.ts`
- **Example**:
```typescript
import { assertPermission, PERMS } from '@/lib/rbac';

export default async function handler(req, res) {
  if (!await assertPermission(req, res, PERMS.LEAD_READ)) return;
  // ... handle request
}
```

### Provider API Endpoints
- **Path**: `/api/provider/*`
- **Authentication**: Check `provider-session` or `ws_provider` cookies
- **Authorization**: No RBAC - providers have full access
- **Federation**: Can use `verifyFederation()` for machine-to-machine calls
- **Example**:
```typescript
import { verifyFederation, federationOverridesRBAC } from '@/lib/providerFederationVerify';

export default async function handler(req, res) {
  // Check provider authentication
  const cookies = req.headers.cookie || '';
  const hasProviderAuth = cookies.includes('provider-session') || cookies.includes('ws_provider');
  
  // OR check federation for machine-to-machine calls
  const fed = await verifyFederation(req);
  
  if (!hasProviderAuth && !federationOverridesRBAC(fed)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // ... handle request
}
```

### Developer/Accountant API Endpoints
- **Path**: `/api/developer/*`, `/api/accountant/*`
- **Authentication**: Check respective session cookies
- **Authorization**: System-level access (no RBAC)

---

## Migration Checklist

When migrating or creating new features, ensure:

- [ ] Client pages use `(app)` route group and `AppShellClient` layout
- [ ] Provider pages use `(provider)` route group and `ProviderShellClient` layout
- [ ] Developer pages use `(developer)` route group and `DeveloperShellClient` layout
- [ ] Accountant pages use `(accountant)` route group and `AccountantShellClient` layout
- [ ] Client pages can use `useMe()` hook
- [ ] Provider/Developer/Accountant pages DO NOT use `useMe()` hook
- [ ] Client API endpoints check `mv_user` cookie and use RBAC
- [ ] Provider API endpoints check `provider-session`/`ws_provider` cookies
- [ ] Developer API endpoints check `developer-session` cookie
- [ ] Accountant API endpoints check `accountant-session` cookie
- [ ] No mixing of authentication systems
- [ ] No mixing of navigation components
- [ ] No mixing of authorization logic

---

## Future: Provider Federation System

The provider federation system (`src/lib/providerFederationVerify.ts`) allows the Provider Portal to make secure machine-to-machine API calls to client instances.

**How It Works**:
1. Provider Portal signs requests with HMAC-SHA256
2. Client instance verifies signature using shared secret
3. If valid, request bypasses RBAC and is treated as provider-level authority

**Headers**:
- `X-Provider-KeyId`: Key identifier
- `X-Provider-Timestamp`: ISO-8601 UTC timestamp
- `X-Provider-Signature`: `sha256:<hex>` or `h31:<hex>`
- `X-Provider-Scope`: `provider` or `read`

**Environment Variables**:
- `PROVIDER_FEDERATION_ENABLED=1` - Enable federation
- `PROVIDER_KEYS_JSON={"key-1":"secret"}` - Shared secrets
- `PROVIDER_FEDERATION_SIG_SHA256=1` - Use SHA-256 (recommended)

This is for API-level federation, NOT for provider portal UI authentication.

---

## Summary

**The Golden Rule**: Provider, Developer, Accountant, and Client systems are COMPLETELY SEPARATE.

- Separate cookies
- Separate authentication
- Separate authorization
- Separate layouts
- Separate navigation
- Separate API endpoints
- NO mixing of components or hooks

This architecture ensures security, maintainability, and clear separation of concerns.

