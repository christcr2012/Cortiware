# Cortiware Architecture (Phase-2+)

This document captures the system architecture and key flows for remaining phases. Cross-refs: ../planning/ROADMAP.md, ./DEPENDENCIES.md, ./DATA_MODELS.md.

## Monorepo Topology (Mermaid)
```mermaid
flowchart TB
  subgraph apps
    A1[provider-portal]
    A2[tenant-app]
    A3[marketing-*]
  end
  subgraph packages
    P1[verticals]
    P2[routing]
    P3[auth-service]
    P4[db]
    P5[kv]
  end
  subgraph scripts/jobs
    J1[importers/*]
    J2[agreements/settle]
    J3[seeds/*]
  end
  A1-->P3 & P4 & P5
  A2-->P3 & P4 & P5
  A1--uses-->P1
  A2--uses-->P1
  J1-->P1
  J2-->P4
  J2-->A1
  P2-->J1
```

## Costed Action Guard (Wallet or 402)
```mermaid
sequenceDiagram
  participant Caller
  participant Module as Costed Module (AI/Maps/SMS)
  participant Wallet as Wallet Store
  Caller->>Module: request(action)
  Module->>Wallet: checkBalance(cost)
  alt balance >= cost
    Module-->>Caller: ok (debit applied)
  else
    Module-->>Caller: HTTP 402 payload (invoice JSON)
  end
```

## Routing Planner (Phase-2 Enhancements)
- Inputs: yard, capacity, stops, landfill catalog (accepts)
- Extensions: configurable detour heuristic; preferred landfill override; exchange semantics
- Outputs: ordered stops with auto-dump insertion

```mermaid
flowchart LR
  R1[RoutePlan]-->R2[Nearest-Neighbor]
  R2-->R3{Capacity <= 0?}
  R3--Yes-->R4[chooseLandfill]
  R4-->R5[Insert dump]
  R3--No-->R6[Continue]
  R5-->R6-->R7[Plan Out]
```

## Agreements Settlement Pipeline
```mermaid
flowchart TB
  Evt[Agreement Events]-->Eval[Rules Eval]
  Eval-->Charges[Charges JSON]
  Charges-->Settle[Wallet-first Settle]
  Settle-->Debit[(Wallet Txn)]
  Settle--402-->Invoice[Invoice Payload JSON]
  Invoice-->Billing[Existing Billing Endpoint (no new routes)]
```

## Data Ownership & Isolation
- Multi-tenant isolation (RLS) enforced in DB (see DATA_MODELS.md)
- Scripts run org-scoped; no cross-tenant leakage

## Contracts & Route Cap
- Contract snapshots remain stable; route count checks enforced by CI
- All new capabilities wired via packages/* and scripts/*, not new routes

