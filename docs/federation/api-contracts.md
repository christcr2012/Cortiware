# Federation API Contracts

**Product**: Cortiware  
**Company**: Robinson AI Systems  
**Last Updated**: 2025-10-06  
**Status**: ✅ Services Return 200 (Updated)

---

## Overview

This document defines the API contracts for Cortiware's federation endpoints. All services have been implemented and return 200 status codes with structured payloads.

---

## Provider Federation APIs

### GET /api/fed/providers/tenants

**Purpose**: List all tenants (organizations) visible to the provider

**Authentication**: Provider auth required (`withProviderAuth`)  
**Rate Limit**: api preset (100 req/60s)  
**Entitlement**: `tenants:list`

**Query Parameters**:
- `cursor` (optional): Pagination cursor (ISO 8601 timestamp)
- `limit` (optional): Number of results (1-100, default 10)

**Response 200** (JSON):
```json
{
  "ok": true,
  "data": {
    "items": [
      {
        "id": "org_123",
        "name": "Acme Corp",
        "createdAt": "2025-10-01T00:00:00.000Z",
        "userCount": 15
      }
    ],
    "nextCursor": "2025-09-30T00:00:00.000Z"
  }
}
```

**Errors**:
- `403 Forbidden`: Insufficient entitlements
- `429 Too Many Requests`: Rate limit exceeded

**Implementation**: ✅ Complete  
**File**: `src/services/federation/providers.service.ts`  
**Tests**: ✅ Passing (8/8)

---

### GET /api/fed/providers/tenants/[id]

**Purpose**: Get details for a specific tenant

**Authentication**: Provider auth required (`withProviderAuth`)  
**Rate Limit**: api preset (100 req/60s)  
**Entitlement**: `tenants:read`

**Path Parameters**:
- `id` (required): Tenant/organization ID

**Response 200** (JSON):
```json
{
  "ok": true,
  "data": {
    "id": "org_123",
    "name": "Acme Corp",
    "createdAt": "2025-10-01T00:00:00.000Z",
    "userCount": 15
  }
}
```

**Response 404** (JSON):
```json
{
  "ok": false,
  "error": "not_found"
}
```

**Errors**:
- `403 Forbidden`: Insufficient entitlements
- `404 Not Found`: Tenant not found
- `429 Too Many Requests`: Rate limit exceeded

**Implementation**: ✅ Complete  
**File**: `src/services/federation/providers.service.ts`  
**Tests**: ✅ Passing (8/8)

---

## Developer Federation APIs

### GET /api/fed/developers/diagnostics

**Purpose**: Get system diagnostics and metadata

**Authentication**: Developer auth required (`withDeveloperAuth`)  
**Rate Limit**: auth preset (10 req/10s)

**Response 200** (JSON):
```json
{
  "ok": true,
  "data": {
    "service": "cortiware-api",
    "version": "abc1234",
    "time": "2025-10-06T12:00:00.000Z",
    "environment": "production",
    "features": {
      "federation": true,
      "oidc": false
    },
    "runtime": "nodejs"
  }
}
```

**Errors**:
- `401 Unauthorized`: Missing or invalid developer auth
- `429 Too Many Requests`: Rate limit exceeded

**Implementation**: ✅ Complete  
**File**: `src/services/federation/developers.service.ts`  
**Tests**: ✅ Passing (8/8)

---

## Federation Status API

### GET /api/federation/status

**Purpose**: Service health and readiness check

**Authentication**: Optional (HMAC)  
**Rate Limit**: api preset (100 req/60s)

**Response 200** (JSON):
```json
{
  "status": "ok",
  "version": "2025.10.6",
  "time": "2025-10-06T12:00:00.000Z",
  "features": ["federation", "escalation", "billing"]
}
```

**With HMAC Auth** (includes additional features):
```json
{
  "status": "ok",
  "version": "2025.10.6",
  "time": "2025-10-06T12:00:00.000Z",
  "features": ["federation", "escalation", "billing", "analytics"]
}
```

**Errors**:
- `429 Too Many Requests`: Rate limit exceeded

**Headers** (on 429):
```
Retry-After: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1696608000
```

---

## Common Patterns

### Response Envelope

All federation APIs use a consistent response envelope:

**Success**:
```json
{
  "ok": true,
  "data": { /* payload */ }
}
```

**Error**:
```json
{
  "ok": false,
  "error": "error_code",
  "message": "Human-readable error message"
}
```

---

### Pagination

Cursor-based pagination using ISO 8601 timestamps:

**Request**:
```
GET /api/fed/providers/tenants?limit=10&cursor=2025-10-01T00:00:00.000Z
```

**Response**:
```json
{
  "ok": true,
  "data": {
    "items": [ /* ... */ ],
    "nextCursor": "2025-09-30T00:00:00.000Z"
  }
}
```

**Rules**:
- `cursor` is the `createdAt` timestamp of the last item from previous page
- `nextCursor` is `null` when no more results
- `limit` is capped at 100

---

### Rate Limiting

All endpoints enforce rate limiting with these headers:

**Response Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1696608000
```

**On Rate Limit Exceeded (429)**:
```
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1696608000
```

**Presets**:
- `auth`: 10 requests per 10 seconds
- `api`: 100 requests per 60 seconds
- `analytics`: 1000 requests per 600 seconds

---

### Authentication

#### Provider Authentication

**Cookies**:
```
rs_provider=<token>
provider-session=<session>
ws_provider=<workspace>
```

**Headers** (set by middleware):
```
x-federation-actor: provider-email@example.com
x-federation-role: provider-admin
```

---

#### Developer Authentication

**Cookies**:
```
rs_developer=<token>
developer-session=<session>
ws_developer=<workspace>
```

**Headers** (set by middleware):
```
x-federation-actor: developer-email@example.com
x-federation-role: developer
```

---

#### HMAC Authentication

**Header**:
```
Authorization: HMAC-SHA256 <signature>
X-Federation-Timestamp: <unix-timestamp>
X-Federation-Nonce: <unique-nonce>
```

**Signature Calculation**:
```
signature = HMAC-SHA256(
  key: FED_HMAC_SECRET,
  message: timestamp + nonce + method + path + body
)
```

---

### Entitlements

Federation services enforce entitlements before database access:

**Provider Roles**:
- `provider-admin`: Full access (tenants:list, tenants:read, tenants:write)
- `provider-viewer`: Read-only access (tenants:list, tenants:read)

**Developer Roles**:
- `developer`: Diagnostics access

**Enforcement**:
```typescript
checkEntitlement(role, 'tenants:list');
// Throws error if insufficient permissions
```

**Error Response (403)**:
```json
{
  "ok": false,
  "error": "forbidden",
  "message": "Insufficient entitlements for action: tenants:list"
}
```

---

### Audit Logging

All federation operations are logged to the `AuditLog` table:

**Fields**:
- `actor`: User/system performing action
- `action`: Action performed (e.g., "tenants:list")
- `resource`: Resource ID (if applicable)
- `result`: "success" | "forbidden" | "error"
- `metadata`: Additional context (JSON)

**Example**:
```json
{
  "actor": "provider@example.com",
  "action": "tenants:list",
  "result": "success",
  "metadata": {
    "count": 10,
    "cursor": "2025-10-01T00:00:00.000Z",
    "limit": 10
  }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `invalid_request` | 400 | Malformed request or invalid parameters |
| `unauthorized` | 401 | Missing or invalid authentication |
| `forbidden` | 403 | Insufficient entitlements |
| `not_found` | 404 | Resource not found |
| `conflict` | 409 | Idempotency key conflict |
| `rate_limited` | 429 | Rate limit exceeded |
| `internal_error` | 500 | Server error |
| `not_implemented` | 501 | Feature not yet implemented |

---

## Testing

### Unit Tests

**Status**: ✅ 8/8 passing

**Coverage**:
- Provider service: listTenants, getTenant
- Developer service: getDiagnostics
- Entitlement checks
- Audit logging

**Run Tests**:
```bash
npm run test:unit
```

---

### E2E Tests

**Status**: ⚠️ TODO (Issue #8)

**Scope**:
- Test against running environment
- Verify 200 responses with real data
- Test pagination
- Test rate limiting
- Test entitlement enforcement

**Run E2E**:
```bash
npm run test:e2e
```

---

## Migration Notes

### Before (Stub Implementation)

**Response**:
```json
{
  "ok": false,
  "error": "not_implemented",
  "message": "Federation service not yet implemented"
}
```

**Status**: 501 Not Implemented

---

### After (Current Implementation)

**Response**:
```json
{
  "ok": true,
  "data": {
    "items": [ /* real data */ ],
    "nextCursor": "..."
  }
}
```

**Status**: 200 OK

---

## References

- [Wrappers Spec](./WRAPPERS_SPEC.md) - Middleware composition
- [HMAC Auth](./hmac-auth.md) - HMAC authentication details
- [Security](./security.md) - Security best practices
- [Implementation Plan](./implementation-plan.md) - Original implementation plan

---

**End of API Contracts Documentation**

