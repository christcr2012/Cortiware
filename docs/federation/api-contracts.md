# Federation API Contracts (Skeleton)

Standard envelope: `{ ok: boolean, data?: any, error?: { code, message, details? } }`

## Providers
- GET /api/fed/providers/tenants
  - Query: `cursor?`, `limit?`
  - 200: `{ ok:true, data:{ items:[{ id,name }], nextCursor:null } }`
  - 401: Unauthorized; 429: TooManyRequests

- GET /api/fed/providers/tenants/:id
  - 200: tenant summary with orgs

## Developers
- GET /api/fed/developers/diagnostics
  - 200: service health, feature flags, build info

## Errors
- 401 Unauthorized, 403 Forbidden, 429 TooManyRequests, 409 Conflict, 400 ValidationError

## Notes
- Idempotency required for POST; cache+replay semantics
- Contract snapshots must be updated when adding fields

