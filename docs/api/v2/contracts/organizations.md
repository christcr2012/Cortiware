# API v2 Contract: Organizations

Status: Draft (GPT-5)
Audience: Backend implementers (Sonnet), Frontend consumers

Base path: `/api/v2/organizations`
Auth: Tenant only (`rs_user` or legacy `mv_user`)
Rate limit: 60 req/min per user (preset: api)

## GET /api/v2/organizations
List organizations the user belongs to (MVP: single org).

Query params:
- none (MVP)

Response 200:
```
{
  "ok": true,
  "data": {
    "items": [ { "id": "org_...", "name": "Acme Services" } ]
  }
}
```

Errors:
- 401 Unauthorized
- 500 Internal

## Notes for Sonnet
- MVP: return current user's org only.
- Future: multi-org membership, role-based filtering.



## Examples

Request: GET /api/v2/organizations
Response 200:
```
{"ok":true,"data":{"items":[{"id":"org_001","name":"Acme Services"}]}}
```

## Test Cases (outline)
- 401 when unauthenticated
- 200 returns items array (MVP: 1 org)
- Future: 200 returns multiple orgs when enabled
