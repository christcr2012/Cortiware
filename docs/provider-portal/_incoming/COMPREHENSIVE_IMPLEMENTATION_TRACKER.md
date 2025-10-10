# Comprehensive Provider Portal Implementation Tracker
**Date:** 2025-10-10  
**Scope:** Full implementation of Provider Portal features across provider-portal and tenant-app  
**Methodology:** System-aware implementation with cross-app dependency tracking

---

## 🎯 IMMEDIATE PRIORITY: Leads Management APIs (Option A)

### Provider Portal - Leads APIs (IMPLEMENTING NOW)

#### 1. `/api/provider/leads/dispute` (POST)
**Status:** ⏳ Creating  
**Purpose:** Handle individual lead dispute from client  
**Request Body:**
```typescript
{
  leadId: string;
  resolution: 'approve' | 'reject';
  disputeReason: string;
  notes: string;
}
```
**Database Changes:**
- Add `Lead.disputeStatus` enum: 'none' | 'pending' | 'approved' | 'rejected'
- Add `Lead.disputeReason` string?
- Add `Lead.disputeResolvedAt` DateTime?
- Add `Lead.disputeResolvedBy` string? (provider user ID)

**Tenant-App Impact:**
- ⏳ Tenant needs UI to submit disputes
- ⏳ Tenant needs API endpoint to create dispute
- ⏳ Webhook notification when dispute resolved
- 🔗 Provider→Tenant webhook: `lead.dispute.resolved`

---

#### 2. `/api/provider/leads/reclassify` (POST)
**Status:** ⏳ Creating  
**Purpose:** Reclassify lead type (employee referral, duplicate, etc.)  
**Request Body:**
```typescript
{
  leadId: string;
  classificationType: 'employee_referral' | 'duplicate' | 'invalid_contact' | 'out_of_service_area' | 'spam';
  reason: string;
}
```
**Database Changes:**
- Add `Lead.classificationType` enum?
- Add `Lead.classificationReason` string?
- Add `Lead.classifiedAt` DateTime?
- Add `Lead.classifiedBy` string?

**Tenant-App Impact:**
- ⏳ Tenant sees reclassification in lead details
- ⏳ Reclassified leads excluded from billing
- 🔗 Provider→Tenant webhook: `lead.reclassified`

---

#### 3. `/api/provider/leads/quality-score` (POST)
**Status:** ⏳ Creating  
**Purpose:** Score lead quality (1-10)  
**Request Body:**
```typescript
{
  leadId: string;
  qualityScore: number; // 1-10
  qualityNotes: string;
}
```
**Database Changes:**
- Add `Lead.qualityScore` int?
- Add `Lead.qualityNotes` string?
- Add `Lead.qualityScoredAt` DateTime?
- Add `Lead.qualityScoredBy` string?

**Tenant-App Impact:**
- ⏳ Tenant sees quality scores in analytics
- ⏳ Quality trends dashboard
- 🔗 No immediate webhook needed

---

#### 4. `/api/provider/leads/bulk-dispute` (POST)
**Status:** ⏳ Creating  
**Purpose:** Bulk approve/reject disputes  
**Request Body:**
```typescript
{
  leadIds: string[];
  action: 'approve' | 'reject';
}
```
**Database Changes:**
- Same as individual dispute

**Tenant-App Impact:**
- Same as individual dispute (multiple webhooks)

---

#### 5. `/api/provider/leads/bulk-reclassify` (POST)
**Status:** ⏳ Creating  
**Purpose:** Bulk reclassify leads  
**Request Body:**
```typescript
{
  leadIds: string[];
  classificationType: string;
}
```
**Database Changes:**
- Same as individual reclassify

**Tenant-App Impact:**
- Same as individual reclassify (multiple webhooks)

---

## 📋 FEDERATION V3+ IMPLEMENTATION STATUS

### Phase 0: Hotfix & Hardening
- ❌ Fix Federation UI → API path mismatch
- ❌ Enforce wrappers on federation & monetization routes
- ❌ OIDC discovery, redaction, one-time secret reveal
- ❌ SLOs/Alerts

### Phase 1: Schema
- ❌ Add FederatedClient model
- ❌ Add FederationKey model
- ❌ Add WebhookRegistration model
- ❌ Add EscalationTicket model
- ❌ Add Invoice model (federation)
- ❌ Add AuditEvent model

### Phase 2: Libraries
- ❌ Create federation helpers
- ❌ Create HMAC verification
- ❌ Create idempotency helpers
- ❌ Create webhook dispatcher

### Phase 3: Federation API
- ❌ `/api/v1/federation/escalation` (POST)
- ❌ `/api/v1/federation/billing/invoice` (POST)
- ❌ `/api/v1/federation/status` (GET)
- ❌ `/api/v1/federation/analytics` (GET)
- ❌ `/api/v1/federation/callbacks/register` (POST)

### Phase 4: Provider Dashboard
- ❌ Clients management page
- ❌ Escalations management page
- ❌ Billing page
- ❌ Analytics page
- ❌ Settings page

### Phase 5: RBAC & Approvals
- ❌ Enforce provider_admin for writes
- ❌ provider_analyst read-only
- ❌ Unit tests for RBAC

### Phase 6: Testing
- ❌ Curl simulation tests
- ❌ Unit tests for signature verification
- ❌ Integration tests

---

## 📋 MONETIZATION HARDENING STATUS

- ❌ Lock all writes behind provider_admin
- ❌ Add audit + rate limits to all endpoints
- ❌ Export/import for plans and prices
- ❌ Unit test pricing math
- ❌ Usage dashboards

---

## 📋 REMAINING SERVICE ERROR HANDLING

### Revenue Service (6 functions)
- ✅ getRevenueMetrics() - DONE
- ❌ getRevenueForecast()
- ❌ getCohortAnalysis()
- ❌ getExpansionMetrics()
- ❌ getChurnImpact()
- ❌ getLtvCacMetrics()
- ❌ getRevenueWaterfall()

### Analytics Service (7 functions)
- ❌ getAnalyticsSummary()
- ❌ getRevenueTrend()
- ❌ getUserGrowthTrend()
- ❌ getLeadFunnel()
- ❌ getCohortAnalysis()
- ❌ getRevenueMix()
- ❌ getTopOrgs()

---

## 🔗 CROSS-APP DEPENDENCIES

### Provider Portal → Tenant App

#### Webhooks (Provider sends to Tenant)
1. `lead.dispute.resolved` - When provider resolves dispute
2. `lead.reclassified` - When provider reclassifies lead
3. `escalation.acknowledged` - When provider acknowledges escalation
4. `invoice.created` - When provider creates invoice

#### APIs (Tenant calls Provider)
1. Submit lead dispute
2. Query lead status
3. Get billing invoices
4. Submit escalation

### Tenant App → Provider Portal

#### Webhooks (Tenant sends to Provider)
1. `lead.converted` - When tenant converts lead
2. `lead.created` - When tenant creates lead
3. `payment.received` - When tenant pays invoice

#### APIs (Provider calls Tenant)
None currently - all communication is Tenant→Provider or via webhooks

---

## 📊 SCHEMA CHANGES REQUIRED

### Provider Portal Schema
```prisma
// Add to Lead model
model Lead {
  // ... existing fields ...
  
  // Dispute management
  disputeStatus      DisputeStatus? @default(NONE)
  disputeReason      String?
  disputeResolvedAt  DateTime?
  disputeResolvedBy  String?
  
  // Classification
  classificationType ClassificationType?
  classificationReason String?
  classifiedAt       DateTime?
  classifiedBy       String?
  
  // Quality scoring
  qualityScore       Int?
  qualityNotes       String?
  qualityScoredAt    DateTime?
  qualityScoredBy    String?
}

enum DisputeStatus {
  NONE
  PENDING
  APPROVED
  REJECTED
}

enum ClassificationType {
  EMPLOYEE_REFERRAL
  DUPLICATE
  INVALID_CONTACT
  OUT_OF_SERVICE_AREA
  SPAM
}
```

### Tenant App Schema
```prisma
// Add to Lead model (if exists)
model Lead {
  // ... existing fields ...
  
  // Dispute tracking (read-only from provider)
  disputeStatus      String? // synced from provider
  disputeSubmittedAt DateTime?
  disputeReason      String?
}
```

---

## 🚀 DEPLOYMENT ORDER

1. **Provider Portal Schema Migration** - Add new Lead fields
2. **Provider Portal APIs** - Deploy Leads management endpoints
3. **Provider Portal UI** - Already exists, will work once APIs deployed
4. **Tenant App Schema Migration** - Add dispute tracking fields
5. **Tenant App UI** - Add dispute submission interface
6. **Tenant App API** - Add dispute submission endpoint
7. **Webhook Integration** - Connect provider→tenant notifications

---

## ✅ COMPLETION CRITERIA

### Leads Management
- [ ] All 5 API endpoints created and tested
- [ ] Schema migrations applied
- [ ] Error handling added to all functions
- [ ] Audit logging for all operations
- [ ] Tenant-side dispute submission UI created
- [ ] Webhooks working end-to-end

### Federation V3+
- [ ] All Phase 0-6 tasks completed
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Deployed to production

### Service Error Handling
- [ ] All revenue service functions have try-catch
- [ ] All analytics service functions have try-catch
- [ ] All pages load without exceptions
- [ ] Production testing completed

---

**Next Steps:**
1. Create 5 Leads API endpoints
2. Create schema migration
3. Test in production
4. Document tenant-app requirements
5. Continue with Federation V3+ implementation

