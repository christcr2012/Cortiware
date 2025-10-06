# Hosting and Environments - Cortiware Federation

**Product**: Cortiware  
**Company**: Robinson AI Systems  
**Last Updated**: 2025-10-06

---

## Overview

This document describes the hosting requirements, environment configuration, and deployment strategies for Cortiware's federation features.

---

## Environment Variables

### Core Application

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/cortiware"

# Next.js
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NODE_ENV="production"

# Onboarding
ONBOARDING_TOKEN_SECRET="your-secret-key-here"
ONBOARDING_PUBLIC_ENABLED="true"
ONBOARDING_DEFAULT_TRIAL_DAYS="14"
```

### Federation Configuration

```bash
# Federation Feature Flags
FED_ENABLED="true"
FED_OIDC_ENABLED="false"

# Federation HMAC Authentication
FED_HMAC_SECRET="your-federation-hmac-secret"
```

### OIDC Configuration (Provider/Developer Authentication)

When `FED_OIDC_ENABLED="true"`, the following variables are required:

```bash
# OIDC Provider Configuration
OIDC_ISSUER="https://your-idp.com"
OIDC_CLIENT_ID="your-client-id"
OIDC_CLIENT_SECRET="your-client-secret"
OIDC_REDIRECT_URI="https://your-domain.com/api/auth/oidc/callback"

# Optional OIDC Configuration
OIDC_SCOPE="openid profile email"
OIDC_RESPONSE_TYPE="code"
OIDC_GRANT_TYPE="authorization_code"
```

#### OIDC Provider Setup

**Supported Providers**:
- Auth0
- Okta
- Azure AD / Microsoft Entra ID
- Google Workspace
- Keycloak
- Any OpenID Connect 1.0 compliant provider

**Required Scopes**:
- `openid` (required)
- `profile` (recommended)
- `email` (recommended)

**Callback URL**:
- Must be registered with your IdP
- Format: `https://your-domain.com/api/auth/oidc/callback`
- Must match `OIDC_REDIRECT_URI` exactly

**Claims Required**:
- `sub` (subject identifier)
- `email` (user email)
- `name` (user display name)
- `preferred_username` (optional)

#### OIDC Flow

1. **User initiates login** at `/provider` or `/developer`
2. **Redirect to IdP** with authorization request
3. **User authenticates** with IdP
4. **IdP redirects back** to callback URL with authorization code
5. **Exchange code for tokens** (ID token, access token)
6. **Validate ID token** and extract claims
7. **Create session** with provider/developer role
8. **Redirect to portal** dashboard

#### Dual-Mode Authentication

When `FED_OIDC_ENABLED="true"`, the system operates in **dual-mode**:

- **Environment-based auth** (legacy): Uses hardcoded credentials from environment variables
- **OIDC auth** (modern): Uses OpenID Connect for SSO

**Priority**:
1. Check for OIDC session first
2. Fall back to environment-based auth
3. Reject if neither is valid

**Migration Path**:
1. Deploy with `FED_OIDC_ENABLED="false"` (environment-based only)
2. Configure OIDC provider and test
3. Enable `FED_OIDC_ENABLED="true"` (dual-mode)
4. Migrate users to OIDC
5. Eventually deprecate environment-based auth

---

### Redis/Vercel KV (Production)

```bash
# Redis Configuration (for rate limiting and idempotency)
REDIS_URL="redis://default:password@host:6379"

# Or Vercel KV
KV_URL="https://your-kv-instance.vercel-storage.com"
KV_REST_API_URL="https://your-kv-instance.vercel-storage.com"
KV_REST_API_TOKEN="your-kv-token"
KV_REST_API_READ_ONLY_TOKEN="your-kv-readonly-token"
```

**Note**: If Redis/KV is not configured, the system automatically falls back to in-memory stores (not recommended for production).

---

### Stripe (Optional)

```bash
# Stripe Configuration
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

### Monitoring (Recommended)

```bash
# Sentry
SENTRY_DSN="https://...@sentry.io/..."
SENTRY_ENVIRONMENT="production"

# Datadog (optional)
DD_API_KEY="your-datadog-api-key"
DD_SITE="datadoghq.com"
```

---

## Deployment Environments

### Development

**Purpose**: Local development and testing  
**URL**: `http://localhost:3000`  
**Database**: Local PostgreSQL or SQLite  
**Redis**: In-memory fallback  
**OIDC**: Disabled (use environment-based auth)

**Environment Variables**:
```bash
NODE_ENV="development"
FED_ENABLED="true"
FED_OIDC_ENABLED="false"
```

---

### Staging

**Purpose**: Pre-production testing and QA  
**URL**: `https://staging.cortiware.com`  
**Database**: Staging PostgreSQL  
**Redis**: Vercel KV or Upstash  
**OIDC**: Enabled (test IdP)

**Environment Variables**:
```bash
NODE_ENV="production"
FED_ENABLED="true"
FED_OIDC_ENABLED="true"
OIDC_ISSUER="https://test-idp.com"
```

**Features**:
- Scheduled E2E smoke tests (nightly)
- Contract validation
- Performance testing
- Security scanning

---

### Production

**Purpose**: Live customer-facing environment  
**URL**: `https://app.cortiware.com`  
**Database**: Production PostgreSQL (with replicas)  
**Redis**: Vercel KV or Upstash (with persistence)  
**OIDC**: Enabled (production IdP)

**Environment Variables**:
```bash
NODE_ENV="production"
FED_ENABLED="true"
FED_OIDC_ENABLED="true"
OIDC_ISSUER="https://auth.cortiware.com"
```

**Requirements**:
- High availability (99.9% uptime)
- Automated backups (daily)
- Monitoring and alerting
- Rate limiting enforced
- Audit logging enabled

---

## Hosting Platforms

### Vercel (Recommended)

**Advantages**:
- Automatic deployments from Git
- Edge network (global CDN)
- Serverless functions
- Built-in preview deployments
- Vercel KV integration

**Configuration**:
1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Configure custom domain
4. Enable automatic deployments

**Vercel-Specific Variables**:
```bash
VERCEL_ENV="production"
VERCEL_URL="auto-generated"
VERCEL_GIT_COMMIT_SHA="auto-generated"
```

---

### Self-Hosted (Alternative)

**Requirements**:
- Node.js 20+ runtime
- PostgreSQL 14+ database
- Redis 6+ (or compatible)
- Reverse proxy (nginx/Caddy)
- SSL/TLS certificates

**Deployment**:
```bash
# Build
npm run build

# Start
npm start

# Or with PM2
pm2 start npm --name "cortiware" -- start
```

---

## Security Considerations

### OIDC Security

1. **Use HTTPS only** for callback URLs
2. **Validate state parameter** to prevent CSRF
3. **Verify ID token signature** using IdP's public keys
4. **Check token expiration** and refresh as needed
5. **Store tokens securely** (encrypted session cookies)
6. **Implement token rotation** for long-lived sessions

### Environment Variables

1. **Never commit secrets** to version control
2. **Use secret management** (Vercel Secrets, AWS Secrets Manager, etc.)
3. **Rotate secrets regularly** (quarterly recommended)
4. **Limit access** to production environment variables
5. **Audit secret access** and changes

### Network Security

1. **Enable rate limiting** (Redis-backed in production)
2. **Use HMAC authentication** for federation endpoints
3. **Implement CORS** restrictions
4. **Enable CSP headers** (Content Security Policy)
5. **Use secure cookies** (httpOnly, secure, sameSite)

---

## Monitoring and Observability

### Health Checks

**Endpoint**: `/api/health`

**Checks**:
- Database connectivity
- Redis/KV connectivity (if configured)
- Stripe connectivity (if configured)

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-06T12:00:00.000Z",
  "version": "abc1234",
  "checks": {
    "database": { "status": "healthy" },
    "redis": { "status": "healthy" },
    "stripe": { "status": "healthy" }
  }
}
```

### Metrics

**Key Metrics**:
- Request rate (requests/second)
- Error rate (errors/total requests)
- Response time (p50, p95, p99)
- Database query time
- Cache hit rate

**Tools**:
- Vercel Analytics (built-in)
- Datadog APM
- New Relic
- Prometheus + Grafana

### Logging

**Log Levels**:
- `error`: Critical errors requiring immediate attention
- `warn`: Warning conditions
- `info`: Informational messages
- `debug`: Debug-level messages (development only)

**Structured Logging**:
```json
{
  "level": "info",
  "timestamp": "2025-10-06T12:00:00.000Z",
  "message": "User authenticated",
  "userId": "user_123",
  "method": "oidc",
  "duration": 150
}
```

---

## Troubleshooting

### OIDC Issues

**Problem**: "Invalid redirect URI"  
**Solution**: Ensure `OIDC_REDIRECT_URI` matches exactly what's registered with IdP

**Problem**: "Token validation failed"  
**Solution**: Check IdP's public keys are accessible and token hasn't expired

**Problem**: "Missing required claims"  
**Solution**: Verify IdP is configured to return `sub`, `email`, and `name` claims

### Redis Connection Issues

**Problem**: "REDIS_URL not configured"  
**Solution**: System falls back to in-memory store (expected in development)

**Problem**: "Redis connection timeout"  
**Solution**: Check Redis host is accessible and credentials are correct

### Database Issues

**Problem**: "Connection pool exhausted"  
**Solution**: Increase `DATABASE_POOL_SIZE` or optimize slow queries

**Problem**: "Migration failed"  
**Solution**: Run `npx prisma migrate deploy` manually and check logs

---

## References

- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Prisma Connection Pooling](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)

---

**End of Hosting and Environments Documentation**

