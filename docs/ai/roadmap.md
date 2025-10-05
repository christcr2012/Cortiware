# AI Roadmap & Build Plan (GPT-5 + Sonnet 4.5)

Status: Draft (GPT-5)

## Principles
- Hybrid execution: GPT-5 architects/specs; Sonnet implements breadth CRUD/UI wiring; GPT-5 reviews guardrails.
- Process binders in numeric order; complete to 100% each (see Hybrid Binder Rules).
- Quarantine legacy; App Router canonical.

## Phase 0: Foundations (COMPLETE)
Owner: GPT-5
- Quarantine Pages Router, exclude from TS.
- Fix Next 15 patterns (cookies(), searchParams).
- Implement App Router auth for tenant/provider/developer/accountant.
- Guardrails: build + typecheck green.

## Phase 1: Architecture & Contracts (YOU ARE HERE)
Owner: GPT-5
- Architecture docs: overview, auth separation.
- v2 API contracts: leads, organizations, opportunities.
- Guardrail policies: rate limit presets, idempotency usage, error model.
- Scaffolds: route skeletons (501), response helpers.
- Acceptance criteria & test plan for Sonnet.

## Phase 2: CRUD Implementation (Backend)
Owner: Sonnet 4.5
- Implement Prisma schema for Org/User/Lead/Opportunity.
- Implement v2 routes per contracts; wire auth, rate-limit, idempotency wrappers.
- Add unit/integration tests (Jest/Playwright or project standard).
- Generate contract snapshot; record diffs.

## Phase 3: UI Wiring & UX Smoke
Owner: Sonnet 4.5
- Wire dashboard pages to v2 APIs (list/create flows).
- Add error/loading states for 401/403/409/429.
- Theme toggles and provider-controlled themes (baseline + 5).
- UX smoke checklist across 4 audiences.

## Phase 4: Guardrails & Ops
Owner: GPT-5 (lead) + Sonnet (implement)
- Real rate limiter (e.g., Redis) implementation.
- Real idempotency store.
- Audit/event log pipeline.
- Perf budgets and basic observability.

## Phase 5: Reconciliation & Cleanup
Owner: GPT-5
- Contract diffs → UI parity check; run Auto-Reconciliation if gaps.
- Remove any residual legacy endpoints from quarantine once replaced.

## Model Split Details
- GPT-5 excels at: architecture, contracts, guardrails, migrations plan, complex refactors, reviews.
- Sonnet 4.5 excels at: bulk CRUD implementation, wiring endpoints to Prisma/UI, iterating across many files.

## Deliverables & Gates per Phase
- Each phase must: build green, typecheck green, tests green, contracts updated, UX smoke ok.
- Never commit with failing guardrails.

