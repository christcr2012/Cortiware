# Sonnet 4.5 Completion Checklist

**Product**: Cortiware  
**Company**: Robinson AI Systems  
**Date**: 2025-10-06

## Review of GPT-5 Handoff Items

### ✅ COMPLETED (Sonnet 4.5)

#### 1. Tests & Data Integrity
- ✅ Unit tests passing (37/37)
- ✅ Idempotency + rate-limit harness in tests
- ⚠️ **TODO**: Expand negative-path tests (400/401/403/409/429)
- ⚠️ **TODO**: Validate schema constraints for overrides

#### 2. Subscription & Billing Deepening
- ✅ Offer discount semantics implemented
- ✅ Best-benefit logic (coupon vs offer)
- ✅ Coupon code support in public onboarding
- ✅ Payment method status in owner subscription page

#### 3. Provider UX Enhancements
- ✅ Filtering/paging for coupons (code, active, limit, offset)
- ✅ Filtering/paging for offers (active, limit, offset)
- ✅ Inline delete for offers and coupons
- ⚠️ **TODO**: Richer org search with pagination in overrides
- ⚠️ **TODO**: Inline edit for offers and coupons

#### 4. Security & Observability
- ✅ Structured audit logs for onboarding
- ✅ Structured audit logs for monetization changes
- ✅ Conversion metrics tracking (funnel events)
- ✅ Provider audit log viewer
- ✅ Developer audit log viewer
- ⚠️ **TODO**: Conversion alerts/thresholds
- ⚠️ **TODO**: Audit log filtering UI (entity, action, date range)

#### 5. Docs & Contracts
- ✅ Contract snapshot/diff runs in CI on PRs
- ✅ Branding updated to Cortiware
- ⚠️ **TODO**: Expand Reference/repo-docs entries for onboarding + monetization routes
- ⚠️ **TODO**: API reference generation from contract snapshot

---

## Review of Earlier Conversation Plans

### From Initial GPT-5 Session
**What was planned:**
1. Provider UX: pagination, filters, delete support ✅
2. Public onboarding: optional couponCode support ✅
3. Payment method status endpoint + UI ✅
4. Extend best-benefit to include Offer ✅
5. Security & Observability: audit logging, metrics ✅
6. Docs & Contracts (CI) ✅

**Optional tasks approved by user:**
1. Owner onboarding UX polish (coupon code) ✅
2. Offer semantics (best-benefit) ✅
3. Observability enhancements (audit viewers) ✅
4. CI enhancements (contracts check) ✅

### Current Status Summary
- **Core functionality**: 100% complete
- **Testing**: 100% unit tests passing, negative paths TODO
- **Observability**: Audit logging + metrics implemented, dashboards TODO
- **Documentation**: Branding updated, API docs TODO
- **CI/CD**: Contract checks in place, API docs generation TODO

---

## Remaining Work (Priority Order)

### HIGH PRIORITY

#### 1. Negative Path Testing
**Why**: Ensure error handling is robust
**Tasks**:
- [ ] Add tests for 400 (missing fields, invalid data)
- [ ] Add tests for 401 (unauthorized)
- [ ] Add tests for 403 (forbidden)
- [ ] Add tests for 409 (conflict, e.g., duplicate invite acceptance)
- [ ] Add tests for 429 (rate limit exceeded)
**Estimate**: 2-3 hours

#### 2. Audit Log Filtering UI
**Why**: Provider needs to search/filter audit events
**Tasks**:
- [ ] Add filter inputs to `/provider/audit` (entity, action, date range)
- [ ] Add filter inputs to `/developer/audit`
- [ ] Update query params and reload logic
- [ ] Add "Clear Filters" button
**Estimate**: 1-2 hours

#### 3. Conversion Metrics Dashboard
**Why**: Provider needs visibility into onboarding funnel
**Tasks**:
- [ ] Create `/provider/metrics` page
- [ ] Query Activity table for funnel events
- [ ] Calculate conversion rates (invite→accept, public attempt→success)
- [ ] Display as KPI cards + time-series chart
- [ ] Add alert thresholds (e.g., <50% conversion)
**Estimate**: 3-4 hours

### MEDIUM PRIORITY

#### 4. Inline Edit for Coupons/Offers
**Why**: Improve provider UX (avoid full-page forms)
**Tasks**:
- [ ] Add "Edit" button next to each coupon/offer
- [ ] Show inline form or modal
- [ ] PATCH endpoint already exists
- [ ] Update UI after successful edit
**Estimate**: 2-3 hours

#### 5. Org Search with Pagination in Overrides
**Why**: Provider needs to find orgs easily when creating overrides
**Tasks**:
- [ ] Replace datalist with autocomplete component
- [ ] Add `/api/fed/providers/tenants?search=...&limit=...&offset=...`
- [ ] Show results in dropdown with pagination
**Estimate**: 2-3 hours

#### 6. API Reference Generation
**Why**: Automate documentation from contract snapshots
**Tasks**:
- [ ] Create `scripts/generate-api-docs.js`
- [ ] Parse `contracts/current.json`
- [ ] Generate markdown files for each route
- [ ] Add to CI workflow
- [ ] Deploy to docs site or repo wiki
**Estimate**: 3-4 hours

### LOW PRIORITY

#### 7. Schema Constraint Validation Tests
**Why**: Ensure overrides follow type-specific rules
**Tasks**:
- [ ] Test that `type=DISCOUNT` requires percentOff or amountOffCents
- [ ] Test that `type=FIXED_PRICE` requires priceCents
- [ ] Test that fields are mutually exclusive
**Estimate**: 1-2 hours

#### 8. Audit Log Export
**Why**: Provider may need to export for compliance
**Tasks**:
- [ ] Add "Export CSV" button to audit viewer
- [ ] Create `/api/provider/audit/export` endpoint
- [ ] Stream CSV response
**Estimate**: 2-3 hours

#### 9. Conversion Alerts
**Why**: Proactive notification of low conversion
**Tasks**:
- [ ] Define alert thresholds in config
- [ ] Check conversion rates daily (cron or scheduled job)
- [ ] Send email/Slack notification when below threshold
**Estimate**: 3-4 hours

---

## Production Readiness Checklist

### Infrastructure
- [ ] Migrate rate limiter to Redis/Vercel KV
- [ ] Migrate idempotency store to Redis/Vercel KV
- [ ] Set up production database (PostgreSQL)
- [ ] Run database migrations
- [ ] Configure Stripe webhook endpoint
- [ ] Verify Stripe webhook signatures

### Security
- [ ] Add CSRF protection
- [ ] Add request signing for webhooks
- [ ] Audit log retention policy (90 days)
- [ ] Rotate ONBOARDING_TOKEN_SECRET
- [ ] Review RBAC permissions

### Monitoring
- [ ] Set up Datadog/CloudWatch
- [ ] Configure audit event forwarding
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up performance monitoring

### Documentation
- [ ] API reference docs
- [ ] Onboarding flow diagrams
- [ ] Monetization setup guide
- [ ] Environment variable documentation
- [ ] Deployment runbook

### Testing
- [ ] Load testing (onboarding endpoints)
- [ ] Integration tests (Stripe webhooks)
- [ ] E2E tests (onboarding flows)
- [ ] Security testing (penetration test)

---

## Next Immediate Steps (Autonomous Work)

1. **Negative Path Testing** (HIGH)
   - Add comprehensive error handling tests
   - Validate all 4xx/5xx responses

2. **Audit Log Filtering UI** (HIGH)
   - Enhance provider/developer audit viewers
   - Add entity, action, date range filters

3. **Conversion Metrics Dashboard** (HIGH)
   - Create `/provider/metrics` page
   - Display funnel conversion rates

4. **Inline Edit for Coupons/Offers** (MEDIUM)
   - Add edit buttons and forms
   - Wire to existing PATCH endpoints

5. **API Reference Generation** (MEDIUM)
   - Automate docs from contract snapshots
   - Add to CI workflow

---

## Summary

### What's Done
- ✅ All core onboarding & monetization features
- ✅ Stripe integration with fallback
- ✅ Best-benefit discount logic
- ✅ Pagination & filtering for coupons/offers
- ✅ Audit logging & metrics tracking
- ✅ Provider/developer audit viewers
- ✅ Unit tests (37/37 passing)
- ✅ CI contract checks
- ✅ Branding updated to Cortiware

### What's Next
- ⚠️ Negative path testing
- ⚠️ Audit log filtering UI
- ⚠️ Conversion metrics dashboard
- ⚠️ Inline edit for coupons/offers
- ⚠️ API reference generation
- ⚠️ Production infrastructure (Redis, monitoring)

### Estimated Time to Complete Remaining HIGH Priority Items
- **3-4 hours** for negative path testing
- **1-2 hours** for audit log filtering UI
- **3-4 hours** for conversion metrics dashboard
- **Total: 7-10 hours**

---

## Notes

- All GPT-5 work has been reviewed and validated
- Sonnet 4.5 has completed audit logging, metrics, and viewer pages
- Tests pass, build succeeds, no TypeScript errors
- Ready to proceed with remaining HIGH priority items autonomously

