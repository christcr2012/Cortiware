#!/bin/bash
# Cortiware Deployment Checklist Script
# Run this before deploying to production

set -e

echo "🚀 Cortiware Deployment Checklist"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
WARNINGS=0

check_pass() {
  echo -e "${GREEN}✓${NC} $1"
  ((PASSED++))
}

check_fail() {
  echo -e "${RED}✗${NC} $1"
  ((FAILED++))
}

check_warn() {
  echo -e "${YELLOW}⚠${NC} $1"
  ((WARNINGS++))
}

echo "1. Environment Variables"
echo "------------------------"

# Check critical environment variables
if [ -z "$DATABASE_URL" ]; then
  check_fail "DATABASE_URL not set"
else
  check_pass "DATABASE_URL configured"
fi

if [ -z "$ONBOARDING_TOKEN_SECRET" ]; then
  check_fail "ONBOARDING_TOKEN_SECRET not set"
elif [ ${#ONBOARDING_TOKEN_SECRET} -lt 32 ]; then
  check_warn "ONBOARDING_TOKEN_SECRET should be at least 32 characters"
else
  check_pass "ONBOARDING_TOKEN_SECRET configured"
fi

if [ -z "$PROVIDER_PASSWORD" ]; then
  check_fail "PROVIDER_PASSWORD not set"
elif [ "$PROVIDER_PASSWORD" = "change-me-in-production" ]; then
  check_fail "PROVIDER_PASSWORD still using default value"
else
  check_pass "PROVIDER_PASSWORD configured"
fi

if [ -z "$DEVELOPER_PASSWORD" ]; then
  check_fail "DEVELOPER_PASSWORD not set"
elif [ "$DEVELOPER_PASSWORD" = "change-me-in-production" ]; then
  check_fail "DEVELOPER_PASSWORD still using default value"
else
  check_pass "DEVELOPER_PASSWORD configured"
fi

if [ -z "$REDIS_URL" ] && [ -z "$KV_REST_API_URL" ]; then
  check_warn "Redis/KV not configured (using in-memory stores)"
else
  check_pass "Redis/KV configured"
fi

if [ -z "$STRIPE_SECRET_KEY" ]; then
  check_warn "Stripe not configured (optional)"
else
  check_pass "Stripe configured"
  if [ -z "$STRIPE_WEBHOOK_SECRET" ]; then
    check_warn "STRIPE_WEBHOOK_SECRET not set (webhooks won't work)"
  else
    check_pass "STRIPE_WEBHOOK_SECRET configured"
  fi
fi

echo ""
echo "2. TypeScript Compilation"
echo "-------------------------"

if npm run typecheck > /dev/null 2>&1; then
  check_pass "TypeScript compilation successful"
else
  check_fail "TypeScript compilation failed"
fi

echo ""
echo "3. Unit Tests"
echo "-------------"

if npm run test:unit > /dev/null 2>&1; then
  check_pass "All unit tests passing"
else
  check_fail "Unit tests failing"
fi

echo ""
echo "4. Build"
echo "--------"

if npm run build > /dev/null 2>&1; then
  check_pass "Production build successful"
else
  check_fail "Production build failed"
fi

echo ""
echo "5. Database Migrations"
echo "----------------------"

if npx prisma migrate status > /dev/null 2>&1; then
  check_pass "Database migrations up to date"
else
  check_warn "Database migrations may need to be applied"
fi

echo ""
echo "6. Security Checks"
echo "------------------"

# Check for default passwords
if grep -q "change-me" .env 2>/dev/null; then
  check_fail "Default passwords found in .env"
else
  check_pass "No default passwords in .env"
fi

# Check for exposed secrets
if [ -f ".env" ] && git check-ignore .env > /dev/null 2>&1; then
  check_pass ".env is gitignored"
else
  check_warn ".env may not be gitignored"
fi

echo ""
echo "7. Production Readiness"
echo "-----------------------"

if [ -f "PRODUCTION_READINESS.md" ]; then
  check_pass "Production readiness guide exists"
else
  check_warn "Production readiness guide not found"
fi

if [ -f "src/app/api/health/route.ts" ]; then
  check_pass "Health check endpoint exists"
else
  check_warn "Health check endpoint not found"
fi

echo ""
echo "=================================="
echo "Summary"
echo "=================================="
echo -e "${GREEN}Passed:${NC} $PASSED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo -e "${RED}Failed:${NC} $FAILED"
echo ""

if [ $FAILED -gt 0 ]; then
  echo -e "${RED}❌ Deployment NOT recommended${NC}"
  echo "Please fix the failed checks before deploying."
  exit 1
elif [ $WARNINGS -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Deployment possible with warnings${NC}"
  echo "Review warnings and proceed with caution."
  exit 0
else
  echo -e "${GREEN}✅ Ready for deployment${NC}"
  exit 0
fi

