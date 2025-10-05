# Federation API Contracts

Standard envelope: `{ ok: boolean, data?: any, error?: { code, message, details? } }`

## Providers

### GET /api/fed/providers/tenants
List all tenants (organizations) visible to the provider.

**Query Parameters:**
- `cursor` (string, optional): Pagination cursor (ISO timestamp)
- `limit` (number, optional): Max items to return (1-100, default 10)

**Response 200:**
```json
{
  "ok": true,
  "data": {
    "items": [
      {
        "id": "clxxx123",
        "name": "Acme Homes",
        "createdAt": "2025-01-15T10:30:00.000Z",
        "userCount": 5
      }
    ],
    "nextCursor": "2025-01-14T08:20:00.000Z"
  }
}
```

**Errors:**
- 401 Unauthorized: Missing or invalid provider credentials
- 403 Forbidden: Provider role lacks `tenants:list` entitlement
- 429 TooManyRequests: Rate limit exceeded

---

### GET /api/fed/providers/tenants/:id
Get detailed information about a specific tenant.

**Path Parameters:**
- `id` (string, required): Tenant ID

**Response 200:**
```json
{
  "ok": true,
  "data": {
    "id": "clxxx123",
    "name": "Acme Homes",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "userCount": 5
  }
}
```

**Errors:**
- 401 Unauthorized: Missing or invalid provider credentials
- 403 Forbidden: Provider role lacks `tenants:read` entitlement
- 404 NotFound: Tenant does not exist
- 429 TooManyRequests: Rate limit exceeded

---

## Developers

### GET /api/fed/developers/diagnostics
Get system diagnostics and health information.

**Response 200:**
```json
{
  "ok": true,
  "data": {
    "service": "robinson-solutions-api",
    "version": "abc1234",
    "time": "2025-01-15T12:00:00.000Z",
    "environment": "production",
    "features": {
      "federation": true,
      "oidc": false
    },
    "runtime": "nodejs"
  }
}
```

**Errors:**
- 401 Unauthorized: Missing or invalid developer credentials
- 429 TooManyRequests: Rate limit exceeded

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| Unauthorized | 401 | Missing or invalid authentication credentials |
| Forbidden | 403 | Authenticated but lacks required entitlement |
| NotFound | 404 | Resource does not exist or federation disabled |
| ValidationError | 400 | Invalid request parameters |
| IdempotencyConflict | 409 | Idempotency key reused with different body |
| RateLimited | 429 | Too many requests, retry after resetAt |
| InternalError | 500 | Server error |

---

## Notes
- All timestamps are ISO 8601 format (UTC)
- Idempotency required for POST/PUT/PATCH via `Idempotency-Key` header
- Rate limits: api preset (60/min), auth preset (20/min)
- Audit events logged for all federation actions
- Contract snapshots must be updated when adding fields
