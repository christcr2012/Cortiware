-- Enforce single OWNER per tenant (Org) using a partial unique index
-- Postgres only
CREATE UNIQUE INDEX IF NOT EXISTS user_single_owner_per_org
ON "User" ("orgId")
WHERE "role" = 'OWNER';

