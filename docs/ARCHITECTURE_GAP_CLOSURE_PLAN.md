# Architecture Gap Closure Plan

**Generated:** 2025-10-09  
**Source:** ARCHITECTURE_OVERVIEW.md Section "Notable Gaps & TODOs"  
**Execution Model:** Augment Hybrid Binder (100% completion per phase)

---

## Executive Summary

This document provides a comprehensive, prioritized plan to close all identified gaps in the Cortiware architecture. The plan follows the Augment Hybrid Binder Execution Rules, ensuring each logical unit is completed 100% (backend + frontend + migrations + tests + docs) before moving to the next.

**Total Phases:** 5  
**Total Binders:** 10  
**Estimated Timeline:** 8-12 weeks (depending on team size and parallel execution)

---

## Gap Analysis Summary

Based on ARCHITECTURE_OVERVIEW.md, the following gaps were identified:

### 1. Client Portal Feature Pages (HIGH PRIORITY)
- **Status:** Not Implemented
- **Location:** `src/_disabled/pages`
- **Impact:** Core CRM functionality unavailable to users
- **Routes:** `/leads`, `/contacts`, `/opportunities`, `/organizations`, `/fleet`, `/admin`, `/reports`

### 2. v2 CRM APIs (CRITICAL - BLOCKS #1)
- **Status:** Stubbed (return 501 or empty arrays)
- **Location:** `src/app/api/v2/{leads,opportunities,organizations}`
- **Impact:** No backend support for client portal
- **Dependencies:** Service layer contracts exist but not implemented

### 3. Guardrail Persistence (MEDIUM PRIORITY)
- **Status:** In-memory fallback only
- **Location:** `src/lib/rate-limiter.ts`, `src/lib/idempotency-store.ts`
- **Impact:** Not production-ready, won't scale
- **Solution:** Redis/KV integration

### 4. Accountant Layout (LOW PRIORITY)
- **Status:** Using wrong shell component
- **Location:** `src/app/(accountant)/layout.tsx`
- **Impact:** Minor UX inconsistency

### 5. Audit Enrichment (MEDIUM PRIORITY)
- **Status:** TODO comments in middleware
- **Location:** `src/lib/api/middleware.ts`
- **Impact:** Incomplete audit trails

### 6. Testing Coverage (MEDIUM PRIORITY)
- **Status:** Unit tests exist, E2E pending
- **Location:** `tests/e2e/run.ts` (scaffolding only)
- **Impact:** Insufficient confidence for production

---

## Prioritization Rationale

### Critical Path Analysis
```
Phase 1 (APIs) → Phase 2 (UI Pages)
                ↓
Phase 3 (Guardrails) → Phase 4 (Quality) → Phase 5 (Polish)
```

**Priority Order:**
1. **Phase 1:** v2 CRM APIs - Blocks everything else
2. **Phase 2:** Client Portal Pages - Direct user value
3. **Phase 3:** Guardrail Persistence - Production readiness (can parallel with Phase 2)
4. **Phase 4:** Quality & Testing - Confidence for deployment
5. **Phase 5:** Polish - Nice-to-have improvements

---

## Implementation Plan

### PHASE 1: v2 CRM APIs Implementation (Foundation)
**Duration:** 2-3 weeks  
**Priority:** CRITICAL  
**Dependencies:** None

#### Binder 1: Leads API Implementation
**Files:**
- `src/services/leads.service.ts` - Service layer with Prisma
- `src/app/api/v2/leads/route.ts` - API route handlers
- `tests/unit/services/leads.service.test.ts` - Unit tests
- `tests/integration/api/v2/leads.test.ts` - Integration tests

**Tasks:**
1. Implement `leadService.list()` with Prisma
   - Org scoping (filter by orgId)
   - Cursor-based pagination
   - Search by query (company, contactName, email)
   - Filter by status, sourceType
   - Return `{items: Lead[], nextCursor: string | null}`

2. Implement `leadService.create()` with deduplication
   - Deduplicate by (orgId, email) or (orgId, phone)
   - Generate identityHash from normalized email/phone
   - Set default status=NEW, generate publicId
   - Include audit logging

3. Wire GET /api/v2/leads
   - Extract orgId from auth context (withTenantAuth)
   - Parse query params (q, status, cursor, limit)
   - Call leadService.list()
   - Return jsonOk with items and nextCursor

4. Wire POST /api/v2/leads
   - Validate body (already done)
   - Call leadService.create()
   - Remove 501 error
   - Return 201 with created lead

5. Write comprehensive tests
   - Unit: Mock Prisma, test all scenarios
   - Integration: Real DB, test auth, rate limiting, idempotency

6. Validate completion
   - `npm run typecheck` passes
   - `npm run lint` passes
   - `npm run test` passes
   - Manual API testing (curl/Postman)
   - Verify idempotency, rate limiting, deduplication
   - Update contract snapshot

**Acceptance Criteria:**
- ✅ GET /api/v2/leads returns org-scoped leads with pagination
- ✅ POST /api/v2/leads creates leads with deduplication
- ✅ Idempotency-Key header enforced and working
- ✅ Rate limiting triggers correctly
- ✅ All tests pass (unit + integration)
- ✅ Contract snapshot updated

#### Binder 2: Opportunities API Implementation
**Files:**
- `src/services/opportunities.service.ts`
- `src/app/api/v2/opportunities/route.ts`
- `tests/unit/services/opportunities.service.test.ts`
- `tests/integration/api/v2/opportunities.test.ts`

**Tasks:**
1. Implement `opportunityService.list()`
   - Org scoping, pagination
   - Filter by stage
   - Include customer data (join)

2. Implement `opportunityService.create()`
   - Validate customer exists
   - Set default stage
   - Link to customer

3. Wire API routes (similar to Binder 1)
4. Write tests
5. Validate completion

**Acceptance Criteria:**
- ✅ GET /api/v2/opportunities returns org-scoped opportunities
- ✅ POST /api/v2/opportunities creates opportunities with customer validation
- ✅ All guardrails working
- ✅ All tests pass

#### Binder 3: Organizations API Implementation
**Files:**
- `src/services/organizations.service.ts`
- `src/app/api/v2/organizations/route.ts`
- `tests/unit/services/organizations.service.test.ts`

**Tasks:**
1. Implement organizationService (currently just a stub)
2. Wire API routes
3. Write tests
4. Validate completion

**Acceptance Criteria:**
- ✅ GET /api/v2/organizations returns org-scoped customers
- ✅ POST /api/v2/organizations creates customers
- ✅ All v2 APIs working together

---

### PHASE 2: Client Portal Pages Migration (User-Facing)
**Duration:** 3-4 weeks  
**Priority:** HIGH  
**Dependencies:** Phase 1 complete

#### Binder 4: Leads Pages Migration
**Files:**
- `src/app/(app)/leads/page.tsx` - List view
- `src/app/(app)/leads/[id]/page.tsx` - Detail view
- `src/app/(app)/leads/new/page.tsx` - Create form
- `src/components/leads/LeadTable.tsx` - Table component
- `src/components/leads/LeadCard.tsx` - Card component
- `src/components/leads/LeadForm.tsx` - Form component

**Tasks:**
1. Create list page with table/cards view
2. Add search, filter by status
3. Implement pagination
4. Create detail page with edit form
5. Add convert to customer action
6. Create new lead form
7. Wire to /api/v2/leads
8. Add loading states, error handling
9. Write component tests
10. E2E smoke tests

**Acceptance Criteria:**
- ✅ Users can view, create, edit, delete leads
- ✅ Search and filtering work
- ✅ Pagination works
- ✅ Convert to customer works
- ✅ All CRUD operations functional
- ✅ Navigation integrated

#### Binder 5: Opportunities Pages Migration
**Files:**
- `src/app/(app)/opportunities/page.tsx`
- `src/app/(app)/opportunities/[id]/page.tsx`
- `src/components/opportunities/*`

**Tasks:**
1. Create pipeline/kanban view for stages
2. Link to customers
3. Implement drag-and-drop stage changes
4. Wire to /api/v2/opportunities
5. Tests

**Acceptance Criteria:**
- ✅ Pipeline view shows opportunities by stage
- ✅ Drag-and-drop works
- ✅ Customer links work

#### Binder 6: Organizations Pages Migration
**Files:**
- `src/app/(app)/organizations/page.tsx`
- `src/app/(app)/organizations/[id]/page.tsx`
- `src/components/organizations/*`

**Tasks:**
1. Customer list and detail pages
2. Integration with opportunities and leads
3. Tests

**Acceptance Criteria:**
- ✅ Customer management fully functional
- ✅ Links to related opportunities and leads work

---

### PHASE 3: Guardrail Persistence (Production Hardening)
**Duration:** 1-2 weeks  
**Priority:** MEDIUM (can parallel with Phase 2)  
**Dependencies:** None (can start anytime)

#### Binder 7: Guardrail Persistence with Redis/KV
**Files:**
- `src/lib/rate-limiter.ts`
- `src/lib/idempotency-store.ts`
- `src/lib/hmac/nonce-store.ts`
- `src/lib/hmac/key-store.ts`
- `docs/ENVIRONMENT_VARIABLES.md`

**Tasks:**
1. Update rate-limiter.ts to use Redis/KV
2. Update idempotency-store.ts to use Redis/KV
3. Update nonce store to use Redis/KV
4. Update HMAC key store to use Redis/KV
5. Add environment variables (REDIS_URL, KV_REST_API_URL, etc.)
6. Ensure backward compatibility (in-memory fallback)
7. Test failover scenarios
8. Update documentation

**Acceptance Criteria:**
- ✅ All stores use Redis/KV when available
- ✅ Graceful fallback to in-memory when Redis unavailable
- ✅ No breaking changes to existing code
- ✅ Environment variables documented

---

### PHASE 4: Quality & Completeness
**Duration:** 2-3 weeks  
**Priority:** MEDIUM  
**Dependencies:** Phases 1-3 complete

#### Binder 8: Audit Enrichment
**Files:**
- `src/lib/api/middleware.ts`
- `src/lib/api/audit-middleware.ts`
- `src/services/audit-log.service.ts`

**Tasks:**
1. Enhance withTenantAuth to inject org/user context
2. Implement persistent HMAC key storage
3. Enrich audit logs with full context
4. Update audit-middleware.ts

**Acceptance Criteria:**
- ✅ Audit logs include full org/user context
- ✅ HMAC keys persisted correctly

#### Binder 9: Comprehensive Testing Coverage
**Files:**
- `tests/e2e/run.ts`
- `tests/e2e/flows/*`
- `tests/integration/guardrails/*`

**Tasks:**
1. E2E tests for complete user flows
2. Integration tests for all guardrails
3. Performance tests for API endpoints
4. Update tests/e2e/run.ts

**Acceptance Criteria:**
- ✅ All critical paths covered by E2E tests
- ✅ Guardrails fully tested
- ✅ Performance benchmarks established

---

### PHASE 5: Polish & UX Improvements
**Duration:** 1 week  
**Priority:** LOW  
**Dependencies:** None

#### Binder 10: Accountant Layout Fix
**Files:**
- `src/components/shells/AccountantShellClient.tsx`
- `src/app/(accountant)/layout.tsx`

**Tasks:**
1. Create AccountantShellClient component
2. Wire into layout
3. Test navigation

**Acceptance Criteria:**
- ✅ Accountant portal uses correct shell
- ✅ Navigation consistent with other portals

---

## Execution Guidelines

### Binder Execution Rules
1. **Sequential within binders:** Complete tasks in order
2. **100% completion:** Backend + Frontend + Tests + Docs before moving on
3. **Validation required:** Run typecheck, lint, test, build after each binder
4. **Contract updates:** Update contract snapshots after API changes
5. **Deployment verification:** Check GitHub Actions, CircleCI, Vercel after pushes

### Testing Requirements
- **Unit tests:** Mock dependencies, test logic
- **Integration tests:** Real DB, test full stack
- **E2E tests:** Browser automation, test user flows
- **Manual testing:** Curl/Postman for APIs, browser for UI

### Success Criteria
- ✅ All tests passing
- ✅ No TypeScript errors
- ✅ No linting errors
- ✅ Builds successfully
- ✅ Deployments successful
- ✅ Manual testing confirms functionality

---

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| API changes break existing code | High | Comprehensive tests, contract snapshots |
| Redis/KV not available in all environments | Medium | In-memory fallback, graceful degradation |
| UI migration breaks existing flows | High | Feature flags, gradual rollout |
| Performance degradation | Medium | Performance tests, monitoring |
| Security vulnerabilities | High | Security review, audit logging |

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Start with Binder 1** (Leads API Implementation)
3. **Follow Binder execution rules** strictly
4. **Update task list** as work progresses
5. **Monitor deployments** after each push
6. **Document learnings** for future phases

---

## Appendix: File Inventory

### Phase 1 Files
- `src/services/leads.service.ts`
- `src/services/opportunities.service.ts`
- `src/services/organizations.service.ts`
- `src/app/api/v2/leads/route.ts`
- `src/app/api/v2/opportunities/route.ts`
- `src/app/api/v2/organizations/route.ts`
- `tests/unit/services/*.test.ts`
- `tests/integration/api/v2/*.test.ts`

### Phase 2 Files
- `src/app/(app)/leads/**`
- `src/app/(app)/opportunities/**`
- `src/app/(app)/organizations/**`
- `src/components/leads/**`
- `src/components/opportunities/**`
- `src/components/organizations/**`

### Phase 3 Files
- `src/lib/rate-limiter.ts`
- `src/lib/idempotency-store.ts`
- `src/lib/hmac/nonce-store.ts`
- `src/lib/hmac/key-store.ts`

### Phase 4 Files
- `src/lib/api/middleware.ts`
- `src/lib/api/audit-middleware.ts`
- `tests/e2e/**`

### Phase 5 Files
- `src/components/shells/AccountantShellClient.tsx`
- `src/app/(accountant)/layout.tsx`

---

**End of Plan**

