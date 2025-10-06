# Sonnet 4.5 Handoff: Onboarding + Monetization Extensions

**Product Name**: Cortiware (formerly StreamFlow/WorkStream)
**Company**: Robinson AI Systems

This document summarizes the latest GPT-5 implementation and the precise follow-up items best suited for Sonnet 4.5.

## What’s Implemented (GPT-5)
- Public Onboarding Flow
  - Page: `/onboarding` supports invite token `?t=TOKEN` and public mode when enabled
  - API: `GET /api/onboarding/verify`, `POST /api/onboarding/accept`, `POST /api/onboarding/accept-public`
  - Service: `src/server/services/onboarding.service.ts`
  - Token helper: `src/lib/onboardingToken.ts`
- Provider Monetization Controls
  - UI: `src/app/(provider)/provider/monetization/MonetizationClient.tsx`
  - Features: Plans, Prices, Invites (copies onboarding link), Global Defaults (default plan/price, trial, publicOnboarding toggle)
  - New UI sections: Coupons, Offers, Tenant Price Overrides
- Tests
  - Unit: `tests/unit/onboarding.token.test.ts` (token validation)
  - Unit: `tests/unit/onboarding.accept-public.api.test.ts` (public onboarding happy/disabled; includes idempotency + rate-limit harness)
  - Unit: `tests/unit/onboarding.accept.service.test.ts` (service happy path)
- Build/Typecheck: ✅ Clean

- Onboarding → Stripe (when configured)
  - On invite/public acceptance, ensure Stripe customer and create a Subscription using `PlanPrice.stripePriceId`; webhook still reconciles
  - When Stripe is not configured or missing `stripePriceId`, we create a local placeholder Subscription

- Pricing & Discounts
  - Placeholder subscriptions now record real `priceCents` from `PlanPrice.unitAmountCents`
  - Invite coupons (percentOff or amountOffCents) applied with best discount

- Guardrails
  - `POST /api/onboarding/accept` and `/accept-public` wrapped with `withRateLimit('auth')` and `withIdempotencyRequired()`

- Owner UX
  - Subscription page shows a payment-method nudge when trialing or $0 price and routes to Billing Portal

## Notable Design Choices
- HMAC-SHA256 tokens with base64url body; tokens include ISO `exp`
- Atomic org+owner creation using Prisma transactions
- Invite reuse prevention: `usedAt` set on success
- Public onboarding only allowed when `GlobalMonetizationConfig.publicOnboarding = true`
- Minimal subscription placeholder rows created when a price is present

## Acceptance Criteria (Validated)
- Provider can create plan/price/invite/defaults; can manage coupons/offers/overrides
- Public onboarding works when enabled; invite onboarding works with token
- TypeScript checks pass, Next.js build succeeds, unit tests pass

## Follow-ups for Sonnet 4.5
1) Tests & Data Integrity
- Expand negative-path tests (validation failures, 400/401/403/409/429)
- Validate schema constraints for overrides (ensure mutually exclusive fields by `type`)

2) Subscription & Billing Deepening
- Implement Offer discount semantics and combine with Coupon using best-benefit
- Optionally accept a coupon code on public onboarding and apply when valid
- Consider showing payment-method status in owner subscription page (via Stripe customer default PM)

3) Provider UX Enhancements
- Add filtering/paging for coupons/offers/overrides
- Provide richer org search with pagination in overrides
- Add inline edit/delete for offers and coupons

4) Security & Observability
- Structured audit logs for onboarding and monetization changes
- Conversion metrics and alerts

5) Docs & Contracts
- Ensure contract snapshot/diff runs in CI on PRs
- Expand Reference/repo-docs entries for onboarding + monetization routes

## Files to Review First
- src/app/onboarding/OnboardingClient.tsx
- src/app/api/onboarding/accept-public/route.ts
- src/server/services/onboarding.service.ts
- src/app/(provider)/provider/monetization/MonetizationClient.tsx

## Env Vars
- ONBOARDING_TOKEN_SECRET (required for secure token verification)
- NEXT_PUBLIC_BASE_URL (optional; improves invite link generation)

## Runbook (Local)
- npm run typecheck
- npm run build
- npm run test:unit

## Acceptance Demos
- Provider: create plan/price, set defaults, enable public onboarding, generate invite
- Public: open /onboarding without token (self-serve) and with token (invite)
- Verify org+owner creation and login

