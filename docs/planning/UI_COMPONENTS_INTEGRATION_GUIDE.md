# UI Components Integration Guide

This guide explains how to integrate the UI components from `packages/ui-components` into actual application pages.

## Available Components

### 1. PaymentRequiredBanner
Displays HTTP 402 (Payment Required) state with invoice details and "Add Funds" CTA.

**Location:** `packages/ui-components/src/PaymentRequiredBanner.tsx`

**Usage:**
```tsx
import { PaymentRequiredBanner } from '@cortiware/ui-components';

function MyPage() {
  const [invoice, setInvoice] = useState(null);

  // When API returns 402
  const handleApiCall = async () => {
    const response = await fetch('/api/some-action');
    if (response.status === 402) {
      const data = await response.json();
      setInvoice(data.invoice);
    }
  };

  return (
    <>
      {invoice && (
        <PaymentRequiredBanner
          invoice={invoice}
          onPayNow={() => router.push('/billing')}
          onDismiss={() => setInvoice(null)}
        />
      )}
      {/* Rest of page content */}
    </>
  );
}
```

**Props:**
- `invoice`: Object with `{ amount_cents: number, memo?: string, due_date?: string }`
- `onPayNow`: Callback when "Add Funds" button clicked
- `onDismiss`: Callback when "Dismiss" button clicked

### 2. RateLimitBanner
Displays HTTP 429 (Rate Limit) state with countdown timer.

**Location:** `packages/ui-components/src/RateLimitBanner.tsx`

**Usage:**
```tsx
import { RateLimitBanner } from '@cortiware/ui-components';

function MyPage() {
  const [retryAfter, setRetryAfter] = useState(null);

  // When API returns 429
  const handleApiCall = async () => {
    const response = await fetch('/api/some-action');
    if (response.status === 429) {
      const retryHeader = response.headers.get('Retry-After');
      setRetryAfter(parseInt(retryHeader || '60'));
    }
  };

  return (
    <>
      {retryAfter && (
        <RateLimitBanner
          retryAfter={retryAfter}
          onDismiss={() => setRetryAfter(null)}
        />
      )}
      {/* Rest of page content */}
    </>
  );
}
```

**Props:**
- `retryAfter`: Number of seconds until retry allowed
- `onDismiss`: Callback when "Dismiss" button clicked

### 3. FeatureToggle
Conditionally renders content based on feature flags.

**Location:** `packages/ui-components/src/FeatureToggle.tsx`

**Usage:**
```tsx
import { FeatureToggle, useFeatureFlag, setFeatureFlag } from '@cortiware/ui-components';

// Set flags programmatically (e.g., from config/database)
setFeatureFlag('new-dashboard', true);
setFeatureFlag('beta-features', false);

// Component-based toggle
function MyPage() {
  return (
    <>
      <FeatureToggle feature="new-dashboard">
        <NewDashboard />
      </FeatureToggle>
      
      <FeatureToggle feature="new-dashboard" fallback={<OldDashboard />}>
        <NewDashboard />
      </FeatureToggle>
    </>
  );
}

// Hook-based toggle
function MyComponent() {
  const showBeta = useFeatureFlag('beta-features', false);
  
  return (
    <div>
      {showBeta && <BetaFeature />}
    </div>
  );
}
```

**API:**
- `setFeatureFlag(key: string, enabled: boolean)`: Set flag value
- `useFeatureFlag(key: string, defaultValue?: boolean)`: React hook to read flag
- `<FeatureToggle feature={string} fallback={ReactNode}>`: Component wrapper

## Integration Checklist

### For Tenant App (`apps/tenant-app`)

- [ ] Add PaymentRequiredBanner to pages that call costed APIs
  - [ ] `/app/(tenant)/routing/optimize` - routing optimization
  - [ ] `/app/(tenant)/agreements/settle` - settlement actions
  - [ ] `/app/(tenant)/imports/run` - importer execution
  
- [ ] Add RateLimitBanner to high-traffic pages
  - [ ] `/app/(tenant)/dashboard` - main dashboard
  - [ ] `/app/(tenant)/leads` - leads list
  - [ ] `/app/(tenant)/api/*` - API route handlers
  
- [ ] Add FeatureToggle for experimental features
  - [ ] New dashboard layouts
  - [ ] Beta routing algorithms
  - [ ] Experimental importers

### For Provider Portal (`apps/provider-portal`)

- [ ] Add PaymentRequiredBanner to admin actions
  - [ ] `/provider/billing` - billing management
  - [ ] `/provider/usage` - usage monitoring
  
- [ ] Add RateLimitBanner to API-heavy pages
  - [ ] `/provider/analytics` - analytics dashboard
  - [ ] `/provider/clients` - client list
  
- [ ] Add FeatureToggle for provider features
  - [ ] Beta monitoring tools
  - [ ] Experimental analytics

## Implementation Steps

1. **Install Package** (if not already in workspace)
   ```bash
   # Already available in monorepo
   # Import from @cortiware/ui-components
   ```

2. **Create Error Boundary** (recommended)
   ```tsx
   // components/ErrorBoundary.tsx
   export function ApiErrorBoundary({ children }) {
     const [error, setError] = useState(null);
     
     return (
       <>
         {error?.status === 402 && <PaymentRequiredBanner invoice={error.invoice} />}
         {error?.status === 429 && <RateLimitBanner retryAfter={error.retryAfter} />}
         {children}
       </>
     );
   }
   ```

3. **Wrap API Calls**
   ```tsx
   async function callApi(endpoint, options) {
     const response = await fetch(endpoint, options);
     
     if (response.status === 402) {
       const data = await response.json();
       throw { status: 402, invoice: data.invoice };
     }
     
     if (response.status === 429) {
       const retryAfter = response.headers.get('Retry-After');
       throw { status: 429, retryAfter: parseInt(retryAfter || '60') };
     }
     
     return response.json();
   }
   ```

4. **Initialize Feature Flags** (on app startup)
   ```tsx
   // app/layout.tsx or _app.tsx
   import { setFeatureFlag } from '@cortiware/ui-components';
   
   // Load from config/database
   const flags = await loadFeatureFlags();
   Object.entries(flags).forEach(([key, value]) => {
     setFeatureFlag(key, value);
   });
   ```

## Testing

### Manual Testing
1. Trigger 402 response (empty wallet)
2. Verify PaymentRequiredBanner appears
3. Click "Add Funds" → redirects to billing
4. Click "Dismiss" → banner disappears

5. Trigger 429 response (rate limit)
6. Verify RateLimitBanner appears with countdown
7. Wait for countdown → banner auto-dismisses

8. Toggle feature flags
9. Verify FeatureToggle shows/hides content

### Automated Testing
```tsx
import { render, screen } from '@testing-library/react';
import { PaymentRequiredBanner } from '@cortiware/ui-components';

test('displays invoice amount', () => {
  render(
    <PaymentRequiredBanner
      invoice={{ amount_cents: 1000, memo: 'Test' }}
    />
  );
  expect(screen.getByText(/\$10.00/)).toBeInTheDocument();
});
```

## Notes

- **In-Memory Flags**: Current implementation uses in-memory feature flags. Replace with database/config lookup for production.
- **Styling**: Components use Tailwind CSS classes. Ensure Tailwind is configured in consuming apps.
- **Accessibility**: All components include ARIA attributes (`role="alert"`, etc.)
- **No New Routes**: These components work with existing routes/pages (no route sprawl)

## See Also

- `docs/planning/PHASE5_COMPLETE.md` - Phase 5 completion details
- `docs/planning/ALL_PHASES_COMPLETE.md` - Overall project status
- `packages/ui-components/src/` - Component source code
- `tests/unit/ui_components.test.ts` - Component tests

