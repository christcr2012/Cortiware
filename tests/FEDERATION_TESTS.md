# Federation v3+ Test Suite

This document describes the comprehensive test suite for the Federation v3+ implementation.

## Test Coverage

### 1. Unit Tests

#### HMAC Signature Tests (`tests/unit/federation.hmac.test.ts`)
- **Signature Generation**
  - Valid HMAC-SHA256 signature generation
  - Consistent signatures for same inputs
  - Different signatures for different methods, paths, timestamps, secrets
  
- **Signature Verification**
  - Valid signature verification
  - Rejection of invalid signatures
  - Rejection of signatures with wrong method/path/timestamp/secret
  - Malformed signature handling
  
- **Timestamp Validation**
  - Acceptance within clock skew window (5 minutes)
  - Rejection outside clock skew window
  - Future timestamp handling
  
- **Edge Cases**
  - Special characters in paths
  - Empty paths
  - Very long secrets
  - Case sensitivity

#### Rate Limiting Tests (`tests/unit/federation.ratelimit.test.ts`)
- **Token Bucket Algorithm**
  - Request allowance when tokens available
  - Token consumption on each request
  - Request rejection when tokens exhausted
  - Variable cost per request
  - Token refill over time
  - Max token cap enforcement
  
- **Per-Org Isolation**
  - Separate buckets per organization
  - No cross-org interference
  - Concurrent org handling
  
- **Rate Limit Responses**
  - 429 status when rate limited
  - Remaining tokens in response
  - Burst traffic handling
  
- **Edge Cases**
  - Zero cost requests
  - Requests larger than bucket size
  - Empty org IDs
  - Special characters in org IDs

#### Idempotency Tests (`tests/unit/federation.idempotency.test.ts`)
- **Idempotency Key Storage**
  - Response storage for idempotency keys
  - Non-existent key handling
  - Key overwriting
  - Complex response objects
  
- **Replay Detection**
  - Replay detection of same idempotency key
  - Same response for replayed requests
  - Concurrent replay handling
  
- **TTL and Expiration**
  - Key expiration after TTL (24 hours)
  - No expiration before TTL
  
- **Key Format and Validation**
  - UUID format keys
  - Custom format keys
  - Very long keys
  - Special characters in keys
  
- **Response Caching**
  - Successful response caching
  - Error response caching
  - Different status code caching

#### RBAC Tests (`tests/unit/federation.rbac.test.ts`)
- **Permission Checks**
  - provider_admin: All permissions (read/write/admin)
  - provider_analyst: Read-only permissions
  - developer: Read-only permissions
  - ai_dev: Read-only permissions
  - unknown role: No permissions
  
- **Case Sensitivity**
  - Uppercase role names
  - Mixed case role names
  - Lowercase role names
  
- **Production Write Restrictions**
  - Block developer writes in production
  - Block ai_dev writes in production
  - Allow provider_admin writes in production
  - Allow developer writes in non-production
  
- **Permission Hierarchy**
  - All permissions for provider_admin
  - Only read permissions for analyst/developer/ai_dev
  
- **Edge Cases**
  - Empty role strings
  - Null-like role names
  - Role names with whitespace
  - Invalid permission codes

### 2. Integration Tests (Curl Simulation)

The `tests/curl-federation-tests.sh` script provides end-to-end integration testing:

#### Test Scenarios
1. **Valid Escalation Request**
   - POST /api/v1/federation/escalation
   - Valid HMAC signature
   - Proper headers and payload
   - Expected: 200 OK with escalation response

2. **Idempotency Replay**
   - Replay same request with same Idempotency-Key
   - Expected: Same response as first request

3. **Invalid Signature**
   - POST with invalid HMAC signature
   - Expected: 401 Unauthorized

4. **Expired Timestamp**
   - POST with timestamp outside clock skew window
   - Expected: 401 Unauthorized

5. **Valid Invoice Request**
   - POST /api/v1/federation/billing/invoice
   - Valid HMAC signature
   - Expected: 200 OK with invoice response

6. **Analytics Request (GET)**
   - GET /api/v1/federation/analytics
   - Valid HMAC signature
   - Expected: 200 OK with analytics data

7. **Rate Limiting**
   - Send 10 rapid requests
   - Expected: Some requests return 429 Too Many Requests

8. **Missing Required Headers**
   - POST without required headers
   - Expected: 400 Bad Request

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm run test

# Run specific test file
npm test -- tests/unit/federation.hmac.test.ts

# Run with coverage
npm test -- --coverage
```

### Integration Tests (Curl)

```bash
# Make script executable
chmod +x tests/curl-federation-tests.sh

# Run against local development server
./tests/curl-federation-tests.sh http://localhost:3000

# Run against staging
./tests/curl-federation-tests.sh https://provider-portal-staging.vercel.app

# Run against production
./tests/curl-federation-tests.sh https://provider-portal.vercel.app
```

## Test Requirements

### Prerequisites
- Node.js 18+
- npm or pnpm
- curl (for integration tests)
- openssl (for HMAC signature generation in curl tests)
- jq (for JSON formatting in curl tests)

### Environment Variables
For integration tests, ensure these environment variables are set:
- `DATABASE_URL` - PostgreSQL connection string
- `CLIENT_KEYS_JSON` - JSON object with client API keys
- `FEDERATION_CLOCK_SKEW_SEC` - Clock skew tolerance (default: 300)
- `KV_REDIS_URL` or `REDIS_URL` - Redis URL for rate limiting

## Expected Test Results

### Unit Tests
- All tests should pass (100% pass rate)
- No TypeScript errors
- No linting errors

### Integration Tests
- Test 1: 200 OK with escalation created
- Test 2: 200 OK with same response as Test 1
- Test 3: 401 Unauthorized (invalid signature)
- Test 4: 401 Unauthorized (expired timestamp)
- Test 5: 200 OK with invoice created
- Test 6: 200 OK with analytics data
- Test 7: Mix of 200 OK and 429 Too Many Requests
- Test 8: 400 Bad Request (missing headers)

## Continuous Integration

Tests are automatically run in GitHub Actions CI/CD pipeline:
- On every push to main branch
- On every pull request
- Before deployment to Vercel

See `.github/workflows/ci.yml` for CI configuration.

## Test Maintenance

### Adding New Tests
1. Create test file in `tests/unit/` directory
2. Follow naming convention: `federation.<feature>.test.ts`
3. Use Jest/TypeScript for unit tests
4. Add integration test scenarios to `curl-federation-tests.sh`
5. Update this documentation

### Updating Tests
- Update tests when API contracts change
- Update tests when RBAC permissions change
- Update tests when rate limits change
- Keep tests in sync with Implementation Guide

## Troubleshooting

### Common Issues

**Issue: Tests fail with "Cannot find module"**
- Solution: Run `npm install` to install dependencies

**Issue: Curl tests fail with "command not found: openssl"**
- Solution: Install OpenSSL (`brew install openssl` on macOS)

**Issue: Curl tests fail with "command not found: jq"**
- Solution: Install jq (`brew install jq` on macOS, `apt-get install jq` on Linux)

**Issue: Integration tests return 500 errors**
- Solution: Check DATABASE_URL is set and database is accessible
- Solution: Check Redis is running if using rate limiting

**Issue: Rate limiting tests don't return 429**
- Solution: Increase number of requests in Test 7
- Solution: Check REDIS_URL is set for persistent rate limiting

## Coverage Goals

- **Unit Test Coverage**: 90%+ for federation libraries
- **Integration Test Coverage**: All API endpoints tested
- **E2E Test Coverage**: All dashboard pages accessible
- **RBAC Coverage**: All roles and permissions tested

## Related Documentation

- [Implementation Guide](../../docs/Execute/Provider%20v3/AugmentCode_Implementation_Guide_v3_plus.md)
- [API Documentation](../../docs/API.md)
- [RBAC Documentation](../../docs/RBAC.md)

