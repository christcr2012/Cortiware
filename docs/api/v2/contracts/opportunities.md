# API v2 Contract: Opportunities

Status: Draft (GPT-5)
Audience: Backend implementers (Sonnet), Frontend consumers

Base path: `/api/v2/opportunities`
Auth: Tenant only (`rs_user` or legacy `mv_user`)
Rate limit: 60 req/min per user (preset: api)
Idempotency: Required for POST via `Idempotency-Key` header

## GET /api/v2/opportunities
List opportunities for the caller's org.

Query params:
- `stage` (string?, e.g., `new|qualified|proposal|won|lost`)
- `cursor` (string?, pagination)
- `limit` (int?, default 25, max 100)

Response 200:
```
{
  "ok": true,
  "data": {
    "items": [
      { "id": "opp_...", "stage": "new", "amount": 12300, "leadId": "lead_...", "createdAt": "..." }
    ],
    "nextCursor": "..." | null
  }
}
```

Errors:
- 401 Unauthorized
- 429 RateLimited
- 500 Internal

## POST /api/v2/opportunities
Create new opportunity (idempotent).

Body (JSON):
```
{
  "leadId": "string?",
  "stage": "string",   // validate set
  "amount":  number,    // cents
  "title":  "string?"
}
```

Response 201:
```
{
  "ok": true,
  "data": { "id": "opp_..." }
}
```

Errors:
- 400 ValidationError
- 401 Unauthorized
- 409 Conflict
- 422 Unprocessable
- 429 RateLimited
- 500 Internal

## Notes for Sonnet
- Stage enum recommended.
- Foreign key to lead optional; cascade behavior for deletions.
- Index (orgId, createdAt desc); consider (orgId, stage).



## Examples

Request: GET /api/v2/opportunities?limit=25
Response 200:
```
{"ok":true,"data":{"items":[{"id":"opp_777","stage":"new","amount":45000,"leadId":"lead_123","createdAt":"2025-01-01T00:00:00Z"}],"nextCursor":null}}
```

Request: POST /api/v2/opportunities
Headers:
- Content-Type: application/json
- Idempotency-Key: 3c1bfa61-1f17-4d39-9c7a-1a49f0f7dfd1
Body:
```
{"stage":"qualified","amount":9900,"title":"Fence replacement"}
```
Response 201:
```
{"ok":true,"data":{"id":"opp_abc"}}
```

## Test Cases (outline)
- 401 when unauthenticated
- GET: 200 with items+nextCursor
- POST: 400 without Idempotency-Key
- POST: 400 invalid body (amount not number, stage invalid)
- POST: 201 creates record
- POST: idempotent replay returns same result
- 429 when rate limit exceeded
