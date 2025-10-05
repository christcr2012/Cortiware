# API v2 Contract: Leads

Status: Draft (GPT-5)
Audience: Backend implementers (Sonnet), Frontend consumers

Base path: `/api/v2/leads`
Auth: Tenant only (`rs_user` or legacy `mv_user`)
Rate limit: 60 req/min per user (preset: api)
Idempotency: Required for POST via `Idempotency-Key` header

## GET /api/v2/leads
List leads for the caller's org.

Query params:
- `q` (string, optional): search by name/email/phone
- `status` (string, optional): e.g., `new|qualified|won|lost`
- `cursor` (string, optional): pagination token
- `limit` (int, optional, default 25, max 100)

Response 200:
```
{
  "ok": true,
  "data": {
    "items": [
      { "id": "lead_...", "name": "...", "status": "new", "contact": {"email":"..."}, "createdAt": "..." }
    ],
    "nextCursor": "..." | null
  }
}
```

Errors:
- 401 Unauthorized
- 429 RateLimited
- 500 Internal

## POST /api/v2/leads
Create a new lead (idempotent by `Idempotency-Key`).

Body (JSON):
```
{
  "name": "string",
  "contact": {
    "email": "string?",
    "phone": "string?"
  },
  "source": "string?",
  "notes": "string?"
}
```

Response 201:
```
{
  "ok": true,
  "data": { "id": "lead_..." }
}
```

Errors:
- 400 ValidationError
- 401 Unauthorized
- 409 Conflict (duplicate per org+email/phone)
- 422 Unprocessable (business rule)
- 429 RateLimited
- 500 Internal

## Notes for Sonnet
- Enforce org scoping from cookie-derived user.
- Add unique constraint on (orgId, normalizedEmail?) for dedupe.
- Implement index on (orgId, createdAt desc) and simple text search.
- Respect `Idempotency-Key`: store key->result hash for a TTL (e.g., 24h).



## Examples

Request: GET /api/v2/leads?limit=25
Response 200:
```
{"ok":true,"data":{"items":[{"id":"lead_123","name":"John Doe","status":"new","contact":{"email":"john@example.com"},"createdAt":"2025-01-01T00:00:00Z"}],"nextCursor":null}}
```

Request: POST /api/v2/leads
Headers:
- Content-Type: application/json
- Idempotency-Key: 4b3b2f6e-9973-42b0-9b2c-1a6f0c0f0aa1
Body:
```
{"name":"Jane Smith","contact":{"email":"jane@example.com"},"source":"web","notes":"Requested callback"}
```
Response 201:
```
{"ok":true,"data":{"id":"lead_abc"}}
```

## Test Cases (outline)
- 401 when unauthenticated (no rs_user/mv_user)
- GET: returns 200 with items array and nextCursor
- GET: pagination works with cursor+limit
- POST: 400 without Idempotency-Key
- POST: 400 on invalid body (missing name)
- POST: 201 on valid create
- POST: idempotent replay with same Idempotency-Key returns the same result
- POST: 409 on duplicate (same org + email)
- 429 when rate limit exceeded
