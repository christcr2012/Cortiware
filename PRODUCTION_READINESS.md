# Cortiware - Production Readiness Tasks

**Product**: Cortiware  
**Company**: Robinson AI Systems  
**Date**: 2025-10-06  
**Status**: Development Complete, Infrastructure Pending

---

## 🎯 CRITICAL PATH TO PRODUCTION

### Phase 1: Infrastructure Setup (Est. 8-12 hours)

#### 1.1 Redis/Vercel KV Migration
**Priority**: CRITICAL  
**Estimate**: 3-4 hours  
**Current State**: In-memory stores (rate limiter, idempotency)  
**Target State**: Redis or Vercel KV for production persistence

**Tasks**:
- [ ] Choose provider (Redis Cloud, Upstash, or Vercel KV)
- [ ] Provision Redis instance (or enable Vercel KV)
- [ ] Add connection string to environment variables
- [ ] Update `src/lib/rate-limiter.ts` to use Redis
- [ ] Update `src/lib/idempotency-store.ts` to use Redis
- [ ] Add connection pooling and error handling
- [ ] Test rate limiting with Redis backend
- [ ] Test idempotency with Redis backend
- [ ] Add Redis health check endpoint
- [ ] Document Redis configuration in README

**Environment Variables Needed**:
```env
REDIS_URL=redis://...
# OR
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
```

**Implementation Notes**:
- Use `ioredis` package for Redis
- Use `@vercel/kv` package for Vercel KV
- Implement graceful fallback to in-memory if Redis unavailable
- Add TTL for rate limit buckets (match window duration)
- Add TTL for idempotency keys (24 hours)

#### 1.2 Database Setup
**Priority**: CRITICAL  
**Estimate**: 2-3 hours  
**Current State**: Development database  
**Target State**: Production PostgreSQL with backups

**Tasks**:
- [ ] Provision production PostgreSQL (Vercel Postgres, Supabase, or AWS RDS)
- [ ] Configure connection pooling (PgBouncer or Prisma Data Proxy)
- [ ] Set up automated backups (daily minimum)
- [ ] Configure point-in-time recovery
- [ ] Add read replicas if needed
- [ ] Update DATABASE_URL in production environment
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Verify all tables created correctly
- [ ] Seed initial data (global config, default plan/price)
- [ ] Test database connectivity from app

**Environment Variables Needed**:
```env
DATABASE_URL=postgresql://...
DATABASE_URL_UNPOOLED=postgresql://... (for migrations)
```

**Migration Checklist**:
```bash
# 1. Backup current database
pg_dump $DATABASE_URL > backup.sql

# 2. Deploy migrations
npx prisma migrate deploy

# 3. Verify schema
npx prisma db pull
npx prisma generate

# 4. Seed initial data
npx prisma db seed
```

#### 1.3 Stripe Configuration
**Priority**: CRITICAL  
**Estimate**: 2-3 hours  
**Current State**: Optional, with fallback  
**Target State**: Fully configured with webhooks

**Tasks**:
- [ ] Create production Stripe account (or use existing)
- [ ] Add STRIPE_SECRET_KEY to environment
- [ ] Add STRIPE_PUBLISHABLE_KEY to environment
- [ ] Configure webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
- [ ] Add STRIPE_WEBHOOK_SECRET to environment
- [ ] Enable webhook events:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- [ ] Test webhook delivery with Stripe CLI
- [ ] Verify webhook signature validation
- [ ] Create test subscription and verify sync
- [ ] Set up Stripe Billing Portal
- [ ] Configure payment methods (card, ACH, etc.)

**Environment Variables Needed**:
```env
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Webhook Testing**:
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
```

#### 1.4 Environment Variables Audit
**Priority**: CRITICAL  
**Estimate**: 1 hour  
**Current State**: Development .env  
**Target State**: Production-ready configuration

**Tasks**:
- [ ] Review all environment variables
- [ ] Rotate all secrets (ONBOARDING_TOKEN_SECRET, etc.)
- [ ] Generate strong random values for all secrets
- [ ] Add to Vercel/hosting platform environment
- [ ] Remove development/test values
- [ ] Document required vs optional variables
- [ ] Set up environment variable validation on startup
- [ ] Add health check for critical variables

**Required Variables**:
```env
# Database
DATABASE_URL=postgresql://...
DATABASE_URL_UNPOOLED=postgresql://...

# Redis/KV
REDIS_URL=redis://...
# OR
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Onboarding
ONBOARDING_TOKEN_SECRET=<64-char-random-string>
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Provider Auth (environment-based)
PROVIDER_USERNAME=<secure-username>
PROVIDER_PASSWORD=<secure-password>

# Developer Auth (environment-based)
DEVELOPER_USERNAME=<secure-username>
DEVELOPER_PASSWORD=<secure-password>

# Accountant Auth (environment-based)
ACCOUNTANT_USERNAME=<secure-username>
ACCOUNTANT_PASSWORD=<secure-password>

# Optional: OIDC for provider/developer
OIDC_ISSUER=https://...
OIDC_CLIENT_ID=...
OIDC_CLIENT_SECRET=...
```

---

### Phase 2: Security Hardening (Est. 6-8 hours)

#### 2.1 CSRF Protection
**Priority**: HIGH  
**Estimate**: 2-3 hours  
**Current State**: No CSRF protection  
**Target State**: CSRF tokens on all mutations

**Tasks**:
- [ ] Install `csrf` or `@edge-csrf/nextjs` package
- [ ] Add CSRF middleware to API routes
- [ ] Generate CSRF tokens in forms
- [ ] Validate CSRF tokens on POST/PATCH/DELETE
- [ ] Add CSRF token to onboarding forms
- [ ] Add CSRF token to monetization forms
- [ ] Test CSRF protection with invalid tokens
- [ ] Document CSRF implementation

**Implementation**:
```typescript
// src/lib/csrf.ts
import { createCsrfProtect } from '@edge-csrf/nextjs';

export const csrfProtect = createCsrfProtect({
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
});

// In API routes
export async function POST(req: NextRequest) {
  const csrfError = await csrfProtect(req);
  if (csrfError) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  }
  // ... rest of handler
}
```

#### 2.2 Request Signing for Webhooks
**Priority**: HIGH  
**Estimate**: 2 hours  
**Current State**: Stripe webhook signature validation only  
**Target State**: HMAC signature validation for all webhooks

**Tasks**:
- [ ] Add webhook signing secret to environment
- [ ] Implement HMAC-SHA256 signature generation
- [ ] Add signature validation middleware
- [ ] Update Stripe webhook handler to use middleware
- [ ] Add signature validation to federation webhooks
- [ ] Test with valid and invalid signatures
- [ ] Document webhook signature format

**Implementation**:
```typescript
// src/lib/webhook-signature.ts
import crypto from 'crypto';

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

#### 2.3 Audit Log Retention Policy
**Priority**: MEDIUM  
**Estimate**: 1-2 hours  
**Current State**: Unlimited retention  
**Target State**: 90-day retention with archival

**Tasks**:
- [ ] Add `expiresAt` field to AuditLog model (optional)
- [ ] Create cleanup job to delete old audit logs
- [ ] Schedule cleanup job (daily cron)
- [ ] Add audit log archival to S3/blob storage (optional)
- [ ] Document retention policy
- [ ] Add admin UI to configure retention period

**Implementation**:
```typescript
// scripts/cleanup-audit-logs.ts
import { prisma } from '@/lib/prisma';

async function cleanupAuditLogs() {
  const retentionDays = 90;
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const deleted = await prisma.auditLog.deleteMany({
    where: {
      createdAt: { lt: cutoffDate },
    },
  });

  console.log(`Deleted ${deleted.count} audit logs older than ${retentionDays} days`);
}

cleanupAuditLogs();
```

#### 2.4 Secret Rotation
**Priority**: HIGH  
**Estimate**: 1 hour  
**Current State**: Development secrets  
**Target State**: Production secrets with rotation plan

**Tasks**:
- [ ] Generate new ONBOARDING_TOKEN_SECRET (64+ chars)
- [ ] Generate new PROVIDER_PASSWORD (32+ chars)
- [ ] Generate new DEVELOPER_PASSWORD (32+ chars)
- [ ] Generate new ACCOUNTANT_PASSWORD (32+ chars)
- [ ] Update all secrets in production environment
- [ ] Document secret rotation procedure
- [ ] Set up quarterly rotation reminder
- [ ] Add secret expiration monitoring (optional)

**Secret Generation**:
```bash
# Generate secure random secrets
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

---

### Phase 3: Monitoring & Observability (Est. 6-8 hours)

#### 3.1 Error Tracking (Sentry)
**Priority**: HIGH  
**Estimate**: 2-3 hours  
**Current State**: Console logging only  
**Target State**: Sentry integration with source maps

**Tasks**:
- [ ] Create Sentry account (or use existing)
- [ ] Install `@sentry/nextjs` package
- [ ] Configure Sentry in `next.config.js`
- [ ] Add SENTRY_DSN to environment
- [ ] Configure source map upload
- [ ] Add user context to errors
- [ ] Add breadcrumbs for debugging
- [ ] Test error reporting
- [ ] Set up error alerts (email/Slack)
- [ ] Configure error sampling rate

**Installation**:
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Configuration**:
```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```

#### 3.2 Application Monitoring (Datadog/CloudWatch)
**Priority**: HIGH  
**Estimate**: 3-4 hours  
**Current State**: No APM  
**Target State**: Full observability with metrics and traces

**Tasks**:
- [ ] Choose provider (Datadog, New Relic, or CloudWatch)
- [ ] Install monitoring agent/SDK
- [ ] Configure APM tracing
- [ ] Add custom metrics for:
  - Onboarding success/failure rate
  - Conversion funnel metrics
  - API response times
  - Database query performance
  - Rate limit hits
  - Idempotency conflicts
- [ ] Set up dashboards
- [ ] Configure alerts for:
  - High error rate (>1%)
  - Slow response times (>2s p95)
  - Low conversion rate (<50%)
  - Database connection issues
- [ ] Test alert delivery

**Datadog Example**:
```typescript
// src/lib/monitoring.ts
import { StatsD } from 'hot-shots';

const statsd = new StatsD({
  host: process.env.DD_AGENT_HOST || 'localhost',
  port: 8125,
  prefix: 'cortiware.',
});

export function trackOnboardingSuccess() {
  statsd.increment('onboarding.success');
}

export function trackOnboardingFailure(reason: string) {
  statsd.increment('onboarding.failure', { reason });
}
```

#### 3.3 Uptime Monitoring
**Priority**: MEDIUM  
**Estimate**: 1 hour  
**Current State**: No uptime monitoring  
**Target State**: 24/7 uptime checks with alerts

**Tasks**:
- [ ] Choose provider (UptimeRobot, Pingdom, or Datadog Synthetics)
- [ ] Add health check endpoint: `/api/health`
- [ ] Configure uptime checks (1-5 min intervals)
- [ ] Monitor critical endpoints:
  - `/api/health`
  - `/api/onboarding/verify`
  - `/provider`
  - `/owner`
- [ ] Set up downtime alerts (email/SMS/Slack)
- [ ] Configure status page (optional)

**Health Check Endpoint**:
```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    
    // Check Redis (if configured)
    // await redis.ping();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: String(error) },
      { status: 503 }
    );
  }
}
```

---

### Phase 4: Performance Optimization (Est. 4-6 hours)

#### 4.1 Database Indexing
**Priority**: MEDIUM  
**Estimate**: 2-3 hours  
**Current State**: Basic indexes  
**Target State**: Optimized indexes for common queries

**Tasks**:
- [ ] Analyze slow queries with `EXPLAIN ANALYZE`
- [ ] Add indexes for:
  - `AuditLog.orgId` (already has FK index)
  - `AuditLog.entity + createdAt` (composite)
  - `Activity.action + createdAt` (composite)
  - `OnboardingInvite.token` (unique, already exists)
  - `Subscription.orgId + status` (composite)
  - `Coupon.code` (unique, already exists)
- [ ] Create migration for new indexes
- [ ] Test query performance before/after
- [ ] Document index strategy

**Migration Example**:
```prisma
// Add to schema.prisma
model AuditLog {
  // ... existing fields
  
  @@index([entity, createdAt])
  @@index([orgId, createdAt])
}

model Activity {
  // ... existing fields
  
  @@index([action, createdAt])
}
```

#### 4.2 Caching Layer
**Priority**: MEDIUM  
**Estimate**: 2-3 hours  
**Current State**: No caching  
**Target State**: Redis cache for frequently accessed data

**Tasks**:
- [ ] Implement cache wrapper for Prisma queries
- [ ] Cache global monetization config (5 min TTL)
- [ ] Cache plan/price data (10 min TTL)
- [ ] Cache org data (5 min TTL)
- [ ] Add cache invalidation on updates
- [ ] Test cache hit rates
- [ ] Monitor cache performance

**Implementation**:
```typescript
// src/lib/cache.ts
import { redis } from '@/lib/redis';

export async function cached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  
  const fresh = await fetcher();
  await redis.setex(key, ttlSeconds, JSON.stringify(fresh));
  return fresh;
}

// Usage
const config = await cached(
  'global-monetization-config',
  300, // 5 min
  () => prisma.globalMonetizationConfig.findFirst()
);
```

---

### Phase 5: Testing & Validation (Est. 6-8 hours)

#### 5.1 Integration Tests
**Priority**: HIGH  
**Estimate**: 3-4 hours  
**Current State**: Unit tests only  
**Target State**: Integration tests for critical flows

**Tasks**:
- [ ] Set up test database
- [ ] Create integration test suite
- [ ] Test onboarding flow end-to-end
- [ ] Test Stripe webhook handling
- [ ] Test rate limiting behavior
- [ ] Test idempotency behavior
- [ ] Test audit logging
- [ ] Test metrics tracking
- [ ] Add to CI pipeline

#### 5.2 Load Testing
**Priority**: MEDIUM  
**Estimate**: 2-3 hours  
**Current State**: No load testing  
**Target State**: Validated performance under load

**Tasks**:
- [ ] Choose tool (k6, Artillery, or Locust)
- [ ] Create load test scenarios:
  - Onboarding flow (100 concurrent users)
  - API endpoints (1000 req/s)
  - Provider dashboard (50 concurrent users)
- [ ] Run load tests against staging
- [ ] Identify bottlenecks
- [ ] Optimize slow endpoints
- [ ] Re-test after optimizations
- [ ] Document performance baselines

**k6 Example**:
```javascript
// load-test.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 100,
  duration: '5m',
};

export default function () {
  const res = http.get('https://staging.cortiware.com/api/health');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

#### 5.3 Security Testing
**Priority**: HIGH  
**Estimate**: 1-2 hours  
**Current State**: No security testing  
**Target State**: Basic security validation

**Tasks**:
- [ ] Run OWASP ZAP scan
- [ ] Test SQL injection (should be prevented by Prisma)
- [ ] Test XSS (should be prevented by React)
- [ ] Test CSRF (after implementing protection)
- [ ] Test rate limiting bypass attempts
- [ ] Test authentication bypass attempts
- [ ] Test authorization bypass attempts
- [ ] Document findings and fixes

---

### Phase 6: Documentation & Deployment (Est. 4-6 hours)

#### 6.1 Deployment Runbook
**Priority**: HIGH  
**Estimate**: 2 hours  
**Current State**: No runbook  
**Target State**: Step-by-step deployment guide

**Tasks**:
- [ ] Document pre-deployment checklist
- [ ] Document deployment steps
- [ ] Document rollback procedure
- [ ] Document smoke test procedure
- [ ] Document monitoring checklist
- [ ] Add troubleshooting guide
- [ ] Test runbook with staging deployment

#### 6.2 API Documentation
**Priority**: MEDIUM  
**Estimate**: 2-3 hours  
**Current State**: Contract snapshots only  
**Target State**: Published API docs

**Tasks**:
- [ ] Generate API docs from contract snapshots
- [ ] Add authentication documentation
- [ ] Add rate limiting documentation
- [ ] Add idempotency documentation
- [ ] Add webhook documentation
- [ ] Add code examples
- [ ] Publish to docs site or repo wiki

#### 6.3 User Documentation
**Priority**: MEDIUM  
**Estimate**: 1-2 hours  
**Current State**: Minimal docs  
**Target State**: User guides for all portals

**Tasks**:
- [ ] Provider portal guide
- [ ] Owner portal guide
- [ ] Developer portal guide
- [ ] Onboarding guide
- [ ] Monetization setup guide
- [ ] Troubleshooting guide

---

## 📊 PRODUCTION READINESS SCORECARD

### Infrastructure (0/4)
- [ ] Redis/Vercel KV configured
- [ ] Production database with backups
- [ ] Stripe fully configured with webhooks
- [ ] Environment variables audited and rotated

### Security (0/4)
- [ ] CSRF protection implemented
- [ ] Webhook signature validation
- [ ] Audit log retention policy
- [ ] Secrets rotated

### Monitoring (0/3)
- [ ] Error tracking (Sentry)
- [ ] APM (Datadog/CloudWatch)
- [ ] Uptime monitoring

### Performance (0/2)
- [ ] Database indexes optimized
- [ ] Caching layer implemented

### Testing (0/3)
- [ ] Integration tests
- [ ] Load testing
- [ ] Security testing

### Documentation (0/3)
- [ ] Deployment runbook
- [ ] API documentation
- [ ] User documentation

**Total Score: 0/19 (0%)**

---

## 🚀 RECOMMENDED DEPLOYMENT SEQUENCE

1. **Week 1: Infrastructure** (Phase 1)
   - Set up Redis/KV
   - Configure production database
   - Configure Stripe webhooks
   - Audit environment variables

2. **Week 2: Security & Monitoring** (Phases 2-3)
   - Implement CSRF protection
   - Add webhook signing
   - Set up Sentry
   - Configure APM
   - Set up uptime monitoring

3. **Week 3: Performance & Testing** (Phases 4-5)
   - Optimize database indexes
   - Implement caching
   - Write integration tests
   - Run load tests
   - Run security tests

4. **Week 4: Documentation & Deploy** (Phase 6)
   - Write deployment runbook
   - Generate API docs
   - Deploy to staging
   - Run smoke tests
   - Deploy to production

---

## 📝 NOTES

- All tasks are independent and can be parallelized
- Estimated total time: 34-48 hours (1-2 weeks for 1 developer)
- Critical path items should be completed before production launch
- Medium/Low priority items can be completed post-launch
- Consider hiring DevOps engineer for infrastructure setup
- Consider security audit by third party before launch

---

**End of Production Readiness Guide**

