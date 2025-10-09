# Provider Portal Implementation Plan

**Date**: 2025-10-09  
**Based On**: PROVIDER_PORTAL_AUDIT.md  
**Goal**: Achieve full end-to-end functionality for all provider portal features

---

## IMPLEMENTATION PHASES

### PHASE 1: CRITICAL FIXES (Immediate - Week 1)
**Goal**: Fix broken features and restore core functionality

#### Task 1.1: Fix Monetization Page Crash 🔴
**Priority**: CRITICAL  
**Complexity**: Simple  
**Estimated Time**: 30 minutes

**Problem**: Page crashes with 500 error due to missing `NEXT_PUBLIC_BASE_URL`

**Files to Modify**:
- `.env.local` (create if doesn't exist)
- `apps/provider-portal/src/app/provider/monetization/page.tsx`

**Steps**:
1. Add to `.env.local`:
   ```
   NEXT_PUBLIC_BASE_URL=http://localhost:5000
   ```
2. Update `monetization/page.tsx` to use relative URLs instead of `NEXT_PUBLIC_BASE_URL`
3. Change:
   ```typescript
   fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/provider/monetization/plans`)
   ```
   To:
   ```typescript
   fetch('/api/provider/monetization/plans')
   ```
4. Repeat for all API calls in the file
5. Test page loads without errors

**Acceptance Criteria**:
- [ ] Page loads without 500 error
- [ ] Plans, prices, offers, and coupons display correctly
- [ ] All API calls return data
- [ ] No console errors

**Testing**:
```bash
npm run dev
# Navigate to http://localhost:5000/provider/monetization
# Verify all sections load
```

---

#### Task 1.2: Create Invoice Management Page 🔴
**Priority**: CRITICAL  
**Complexity**: Moderate  
**Estimated Time**: 3 hours

**Problem**: Invoice APIs exist but no frontend page

**Files to Create**:
- `apps/provider-portal/src/app/provider/invoices/page.tsx`
- `apps/provider-portal/src/app/provider/invoices/InvoiceListTable.tsx`
- `apps/provider-portal/src/app/provider/invoices/InvoiceDetailsModal.tsx`

**Files to Modify**:
- `apps/provider-portal/src/app/ProviderShellClient.tsx` (add nav link)

**Implementation Pattern**: Copy from `/provider/clients` page

**Steps**:
1. Create main page component:
   ```typescript
   // apps/provider-portal/src/app/provider/invoices/page.tsx
   'use client';
   import { useState, useEffect } from 'react';
   
   export default function InvoicesPage() {
     const [invoices, setInvoices] = useState([]);
     const [loading, setLoading] = useState(true);
     
     useEffect(() => {
       fetchInvoices();
     }, []);
     
     const fetchInvoices = async () => {
       const res = await fetch('/api/invoices');
       const data = await res.json();
       setInvoices(data.items || []);
       setLoading(false);
     };
     
     // ... rest of component
   }
   ```

2. Create table component with columns:
   - Invoice ID
   - Client Name
   - Amount
   - Status
   - Due Date
   - Actions (View Details)

3. Create details modal showing:
   - Full invoice data
   - Line items
   - Payment status
   - Download PDF button (if available)

4. Add navigation link to sidebar:
   ```typescript
   <ProviderNavLink href="/provider/invoices" active={active('/provider/invoices')}>
     Invoices
   </ProviderNavLink>
   ```

**Acceptance Criteria**:
- [ ] Page displays invoice list
- [ ] Search and filter work
- [ ] Details modal shows full invoice data
- [ ] Pagination works
- [ ] Responsive design (mobile-friendly)
- [ ] Navigation link appears in sidebar

**Testing**:
```bash
# Navigate to http://localhost:5000/provider/invoices
# Verify invoice list displays
# Click invoice to view details
# Test search and filter
```

---

#### Task 1.3: Add Client Edit/Delete UI 🔴
**Priority**: CRITICAL  
**Complexity**: Moderate  
**Estimated Time**: 2 hours

**Problem**: PATCH and DELETE endpoints exist but no UI

**Files to Modify**:
- `apps/provider-portal/src/app/provider/clients/page.tsx`
- `apps/provider-portal/src/app/provider/clients/ClientListTable.tsx`
- `apps/provider-portal/src/app/provider/clients/ClientDetailsModal.tsx`

**Files to Create**:
- `apps/provider-portal/src/app/provider/clients/ClientEditModal.tsx`

**Steps**:
1. Create edit modal component:
   ```typescript
   // ClientEditModal.tsx
   export default function ClientEditModal({ client, onClose, onSave }) {
     const [formData, setFormData] = useState({
       name: client.name,
       email: client.email,
       status: client.status,
       // ... other fields
     });
     
     const handleSubmit = async () => {
       const res = await fetch(`/api/clients/${client.id}`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(formData)
       });
       
       if (res.ok) {
         onSave();
         onClose();
       }
     };
     
     // ... form UI
   }
   ```

2. Add "Edit" button to details modal
3. Add "Delete" button with confirmation dialog:
   ```typescript
   const handleDelete = async () => {
     if (!confirm('Are you sure you want to delete this client?')) return;
     
     const res = await fetch(`/api/clients/${client.id}`, {
       method: 'DELETE'
     });
     
     if (res.ok) {
       onDelete();
       onClose();
     }
   };
   ```

4. Add edit icon to table rows (optional)

**Acceptance Criteria**:
- [ ] Edit button opens edit modal
- [ ] Edit form pre-fills with current data
- [ ] Save updates client successfully
- [ ] Delete button shows confirmation
- [ ] Delete removes client successfully
- [ ] Table refreshes after edit/delete
- [ ] Error handling for failed operations

**Testing**:
```bash
# Open client details
# Click "Edit" button
# Modify fields and save
# Verify changes persist
# Click "Delete" button
# Confirm deletion
# Verify client removed from list
```

---

### PHASE 2: HIGH PRIORITY FEATURES (Week 2)
**Goal**: Complete core CRUD operations and critical workflows

#### Task 2.1: Add Incident Edit/Delete UI 🟠
**Priority**: HIGH  
**Complexity**: Moderate  
**Estimated Time**: 2 hours

**Problem**: Update and delete endpoints exist but no UI

**Files to Modify**:
- `apps/provider-portal/src/app/provider/incidents/IncidentsClient.tsx`

**Files to Create**:
- `apps/provider-portal/src/app/provider/incidents/IncidentEditModal.tsx`
- `apps/provider-portal/src/app/provider/incidents/IncidentDetailsModal.tsx`

**Implementation Pattern**: Same as Client Edit/Delete (Task 1.3)

**Steps**:
1. Create edit modal for incidents
2. Create details modal (if doesn't exist)
3. Add edit/delete buttons
4. Wire up PATCH and DELETE API calls
5. Add confirmation dialogs
6. Refresh list after operations

**Acceptance Criteria**:
- [ ] Edit modal opens with current data
- [ ] Save updates incident
- [ ] Delete removes incident
- [ ] Audit log records changes
- [ ] Error handling works

---

#### Task 2.2: Implement Federation Provider Edit/Delete 🟠
**Priority**: HIGH  
**Complexity**: Complex  
**Estimated Time**: 4 hours

**Problem**: PATCH/DELETE endpoints are mocks, need real implementation + UI

**Files to Modify**:
- `apps/provider-portal/src/app/api/federation/providers/[id]/route.ts`
- `apps/provider-portal/src/app/provider/federation/ProviderIntegrations.tsx`

**Files to Create**:
- `apps/provider-portal/src/app/provider/federation/ProviderEditModal.tsx`

**Steps**:
1. Implement real PATCH handler:
   ```typescript
   const patchHandler = async (req: NextRequest, { params }: { params: { id: string } }) => {
     const body = await req.json();
     const { name, type, config, enabled } = body;
     
     const provider = await prisma.providerIntegration.update({
       where: { id: params.id },
       data: { name, type, config, enabled }
     });
     
     return jsonOk({ provider });
   };
   ```

2. Implement real DELETE handler:
   ```typescript
   const deleteHandler = async (req: NextRequest, { params }: { params: { id: string } }) => {
     await prisma.providerIntegration.delete({
       where: { id: params.id }
     });
     
     return jsonOk({ success: true });
   };
   ```

3. Create edit modal UI
4. Add edit/delete buttons to provider list
5. Wire up API calls
6. Add confirmation dialogs

**Acceptance Criteria**:
- [ ] PATCH endpoint updates database
- [ ] DELETE endpoint removes from database
- [ ] Edit modal opens with current config
- [ ] Save updates provider integration
- [ ] Delete removes provider integration
- [ ] List refreshes after operations

---

#### Task 2.3: Add OIDC Test Button 🟠
**Priority**: HIGH  
**Complexity**: Simple  
**Estimated Time**: 1 hour

**Problem**: Test endpoint exists but no UI trigger

**Files to Modify**:
- `apps/provider-portal/src/app/provider/federation/OIDCConfig.tsx`

**Steps**:
1. Add "Test Connection" button to OIDC form
2. Wire up to `POST /api/federation/oidc/test`
3. Show loading state during test
4. Display success/error message
5. Show connection details on success

**Implementation**:
```typescript
const handleTestConnection = async () => {
  setTesting(true);
  try {
    const res = await fetch('/api/federation/oidc/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const result = await res.json();
    
    if (result.ok) {
      setTestResult({ success: true, message: 'Connection successful!' });
    } else {
      setTestResult({ success: false, message: result.error });
    }
  } finally {
    setTesting(false);
  }
};
```

**Acceptance Criteria**:
- [ ] Test button appears on OIDC form
- [ ] Button disabled during test
- [ ] Success message shows on valid config
- [ ] Error message shows on invalid config
- [ ] Connection details displayed

---

#### Task 2.4: Add Federation Key Delete 🟠
**Priority**: HIGH  
**Complexity**: Simple  
**Estimated Time**: 1 hour

**Problem**: Delete endpoint exists but no UI

**Files to Modify**:
- `apps/provider-portal/src/app/provider/federation/FederationKeys.tsx`

**Steps**:
1. Add delete button to each key row
2. Add confirmation dialog
3. Wire up DELETE API call
4. Refresh list after deletion

**Implementation**:
```typescript
const handleDeleteKey = async (keyId: string) => {
  if (!confirm('Are you sure you want to delete this federation key?')) return;
  
  const res = await fetch(`/api/federation/keys/${keyId}`, {
    method: 'DELETE'
  });
  
  if (res.ok) {
    fetchKeys(); // Refresh list
  }
};
```

**Acceptance Criteria**:
- [ ] Delete button appears for each key
- [ ] Confirmation dialog shows
- [ ] Delete removes key from database
- [ ] List refreshes after deletion

---

#### Task 2.5: Implement Settings Page 🟠
**Priority**: HIGH  
**Complexity**: Complex  
**Estimated Time**: 6 hours

**Problem**: Page shows "Coming Soon" placeholder

**Files to Modify**:
- `apps/provider-portal/src/app/provider/settings/page.tsx`

**Files to Create**:
- `apps/provider-portal/src/app/api/provider/settings/route.ts`
- `apps/provider-portal/src/app/provider/settings/GeneralSettings.tsx`
- `apps/provider-portal/src/app/provider/settings/SecuritySettings.tsx`
- `apps/provider-portal/src/app/provider/settings/NotificationSettings.tsx`

**Settings Categories**:
1. **General Settings**:
   - Provider name
   - Contact email
   - Support URL
   - Logo upload

2. **Security Settings**:
   - Password change
   - Two-factor authentication
   - API key management
   - Session timeout

3. **Notification Settings**:
   - Email notifications
   - Webhook URLs
   - Alert thresholds

4. **Integration Settings**:
   - Third-party integrations
   - Webhook endpoints
   - API rate limits

**Steps**:
1. Create API endpoint for settings CRUD
2. Create tabbed settings page
3. Implement each settings category
4. Add save/cancel buttons
5. Add validation
6. Show success/error messages

**Acceptance Criteria**:
- [ ] Settings page loads without errors
- [ ] All tabs work
- [ ] Settings save successfully
- [ ] Validation prevents invalid data
- [ ] Changes persist across sessions

---

### PHASE 3: MEDIUM PRIORITY ENHANCEMENTS (Week 3)
**Goal**: Enhance existing features and add useful functionality

#### Task 3.1: Add Billing Update Form 🟡
**Priority**: MEDIUM  
**Complexity**: Moderate  
**Estimated Time**: 2 hours

**Files to Modify**:
- `apps/provider-portal/src/app/provider/billing/page.tsx`

**Files to Create**:
- `apps/provider-portal/src/app/provider/billing/BillingUpdateForm.tsx`

**Steps**:
1. Create billing update form component
2. Add fields for billing info
3. Wire up POST /api/billing
4. Add validation
5. Show success/error messages

---

#### Task 3.2: Implement/Merge Metrics Page 🟡
**Priority**: MEDIUM  
**Complexity**: Moderate  
**Estimated Time**: 3 hours

**Decision**: Merge with Analytics or create separate page?

**Option A**: Merge with Analytics
- Add metrics to existing analytics page
- Simpler, less duplication

**Option B**: Create separate Metrics page
- Dedicated page for system metrics
- More focused view

**Recommendation**: Option A (merge with analytics)

**Steps**:
1. Add system metrics section to analytics page
2. Add API calls for metrics data
3. Add charts for metrics visualization
4. Update navigation (remove metrics link or redirect)

---

#### Task 3.3: Fix Monetization Offer Creation 🟡
**Priority**: MEDIUM  
**Complexity**: Simple  
**Estimated Time**: 1 hour

**Problem**: POST endpoint exists but page was broken (now fixed in Task 1.1)

**Files to Modify**:
- `apps/provider-portal/src/app/provider/monetization/MonetizationClient.tsx`

**Steps**:
1. Verify offer creation form exists
2. Test POST /api/monetization/offers
3. Add validation
4. Show success/error messages
5. Refresh list after creation

---

#### Task 3.4: Enhance Analytics Dashboard 🟡
**Priority**: MEDIUM  
**Complexity**: Moderate  
**Estimated Time**: 4 hours

**Enhancements**:
1. Add date range picker
2. Add more chart types (pie, bar, area)
3. Add export to CSV/PDF
4. Add real-time updates
5. Add drill-down capabilities

**Files to Modify**:
- `apps/provider-portal/src/app/provider/analytics/page.tsx`

---

#### Task 3.5: Verify Notification Center 🟡
**Priority**: MEDIUM  
**Complexity**: Simple  
**Estimated Time**: 1 hour

**Steps**:
1. Check if notification bell exists in header
2. Verify GET /api/notifications works
3. Add notification center dropdown
4. Add mark as read functionality
5. Add notification preferences

---

#### Task 3.6: Enhance Audit Log Filtering 🟡
**Priority**: MEDIUM  
**Complexity**: Moderate  
**Estimated Time**: 2 hours

**Enhancements**:
1. Add date range picker
2. Add user filter
3. Add action type filter
4. Add entity type filter
5. Add export functionality

**Files to Modify**:
- `apps/provider-portal/src/app/provider/audit/page.tsx`

---

#### Task 3.7: Verify Monetization Coupon Management 🟡
**Priority**: MEDIUM  
**Complexity**: Simple  
**Estimated Time**: 1 hour

**Steps**:
1. Verify coupon list displays (after Task 1.1 fix)
2. Test coupon creation
3. Test coupon editing
4. Test coupon deletion
5. Add validation

---

### PHASE 4: LOW PRIORITY & CLEANUP (Week 4)
**Goal**: Polish and prepare for production

#### Task 4.1: Review Dev Aids Page 🟢
**Priority**: LOW  
**Complexity**: Simple  
**Estimated Time**: 30 minutes

**Decision**: Keep or remove?

**Steps**:
1. Review dev aids page functionality
2. Decide if needed in production
3. Either remove or add production guard

---

#### Task 4.2: Investigate Infrastructure Page 🟢
**Priority**: LOW  
**Complexity**: Unknown  
**Estimated Time**: 1 hour

**Steps**:
1. Navigate to infrastructure page
2. Document current state
3. Decide if needed
4. Implement or remove

---

#### Task 4.3: Enhance Login Page 🟢
**Priority**: LOW  
**Complexity**: Moderate  
**Estimated Time**: 2 hours

**Enhancements**:
1. Add "Remember Me" checkbox
2. Add password reset link
3. Add better error messages
4. Add loading states
5. Add responsive design improvements

---

## IMPLEMENTATION SUMMARY

### Total Estimated Time
- **Phase 1 (Critical)**: 5.5 hours
- **Phase 2 (High)**: 16 hours
- **Phase 3 (Medium)**: 14 hours
- **Phase 4 (Low)**: 3.5 hours
- **Total**: ~39 hours (~1 week of focused work)

### Priority Order
1. Fix monetization page crash (30 min)
2. Create invoice management page (3 hrs)
3. Add client edit/delete UI (2 hrs)
4. Add incident edit/delete UI (2 hrs)
5. Implement federation provider edit/delete (4 hrs)
6. Add OIDC test button (1 hr)
7. Add federation key delete (1 hr)
8. Implement settings page (6 hrs)
9. Continue with medium/low priority tasks...

### Success Metrics
- [ ] All critical gaps closed
- [ ] All high priority gaps closed
- [ ] 80%+ of medium priority gaps closed
- [ ] No broken pages
- [ ] All API endpoints have UI
- [ ] All UI elements have working APIs
- [ ] Comprehensive testing completed
- [ ] Documentation updated

---

## TESTING REQUIREMENTS

### For Each Task
1. **Unit Tests**: Test individual components
2. **Integration Tests**: Test API + UI together
3. **E2E Tests**: Test full user workflows
4. **Manual Testing**: Verify in browser
5. **Responsive Testing**: Test on mobile/tablet
6. **Error Handling**: Test failure scenarios

### Test Checklist Template
```
- [ ] Feature works as expected
- [ ] Error handling works
- [ ] Loading states display
- [ ] Success messages show
- [ ] Data persists correctly
- [ ] Responsive on mobile
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Follows design system
- [ ] Accessible (keyboard nav, screen readers)
```

---

## NEXT STEPS

1. Review this plan with stakeholders
2. Prioritize tasks based on business needs
3. Assign tasks to developers
4. Set up task tracking (GitHub Issues, Jira, etc.)
5. Begin Phase 1 implementation
6. Conduct daily standups to track progress
7. Review and adjust plan as needed

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-09  
**Status**: Ready for Implementation

