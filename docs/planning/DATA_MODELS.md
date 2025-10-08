# Data Models & Schemas (Phase-2+)

This document proposes schema additions/adjustments to support remaining phases. It is self-contained.

Cross-refs: ./ARCHITECTURE.md, ./API_CONTRACTS.md, ./TEST_PLANS.md

## Wallet (Org-Scoped)
Prisma (proposed):
````prisma
model OrgWallet {
  orgId           String   @id
  balanceCents    Int      @default(0)
  updatedAt       DateTime @updatedAt
  transactions    WalletTxn[]
}

model WalletTxn {
  id              String   @id @default(cuid())
  orgId           String
  amountCents     Int      // positive: credit, negative: debit
  memo            String?
  createdAt       DateTime @default(now())
  OrgWallet       OrgWallet @relation(fields: [orgId], references: [orgId])
}
````

Notes
- OrgWallet.balanceCents must never go negative; enforce in service layer/DB constraint as feasible.

## Agreements
````prisma
model AgreementRule {
  id        String   @id @default(cuid())
  orgId     String
  name      String
  eventKey  String   // e.g., "rolloff.idle_days"
  op        String   // gt, gte, eq, etc.
  threshold Int
  action    Json     // { type: 'flat_fee', amount_cents: 100 }
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
}

model AgreementEvent {
  id        String   @id @default(cuid())
  orgId     String
  eventKey  String
  valueInt  Int
  occurredAt DateTime @default(now())
}
````

## Assets/Yards/Landfills (Dev Seeds)
````prisma
model Asset {
  id       String @id
  orgId    String
  type     String // 'rolloff' | 'port-a-john'
  size     String?
  idTag    String?
}

model Yard {
  id     String @id
  orgId  String
  name   String
  lat    Float
  lon    Float
}

model Landfill {
  id       String @id
  orgId    String
  name     String
  lat      Float
  lon      Float
  accepts  String // csv: "msw;c&d"
}
````

## Routing Artifacts
````prisma
model RoutePlan {
  id        String  @id @default(cuid())
  orgId     String
  date      DateTime
  driverId  String
  yardLat   Float
  yardLon   Float
  capacity  Int
  json      Json    // normalized stops with dumps inserted
}
````

## JSON Schemas (Scripts)
Agreement Charges (output of rules eval → input to settlement):
````json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "AgreementCharges",
  "type": "object",
  "properties": {
    "orgId": { "type": "string" },
    "lines": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "sku": { "type": "string" },
          "qty": { "type": "integer", "minimum": 1 },
          "unit_cents": { "type": "integer", "minimum": 0 },
          "total_cents": { "type": "integer", "minimum": 0 }
        },
        "required": ["sku", "qty"]
      }
    }
  },
  "required": ["orgId", "lines"]
}
````

## RLS Assumptions
- All models containing orgId are tenant-isolated via RLS policies
- Tests include a placeholder smoke that asserts isolation expectations

