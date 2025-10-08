# Import Wizard - AI-Powered Implementation (Adapted from Execute/importer Design)

## Overview

This implementation adapts the comprehensive DB-backed import system from `docs/Execute/importer` to work with Cortiware's existing architecture (Next.js, Prisma, existing AI credit system).

## Status: Phase 1 - Core Services Complete ✅

### Completed (2025-01-08)

1. **Prisma Schema** ✅
   - ImportJob, ImportMapping, ImportError models
   - ImportStatus, ImportEntityType enums
   - Org and User back-relations

2. **AI Mapping Assistant** ✅ (`src/lib/import/ai-mapping-assistant.ts`)
   - Intelligent field mapping using OpenAI GPT-4o-mini
   - Tier classification (light/standard/complex)
   - Cost calculation (AI + infrastructure)
   - Retail pricing integration
   - Confidence scoring

3. **Data Masking** ✅ (`src/lib/import/data-masking.ts`)
   - Privacy-preserving PII masking
   - Email, phone, address, name masking
   - Statistical summaries without exposing raw data
   - Pattern detection

4. **Data Summarizer** ✅ (`src/lib/import/data-summarizer.ts`)
   - Column type inference (email, phone, date, numeric, text)
   - Pattern detection (date formats, phone formats, etc.)
   - Relationship detection (foreign keys)
   - Entity type suggestion
   - Representative examples (masked)

### Architecture Adaptations

**Original Design (Execute/importer):**
- Express API with separate routes
- Raw PostgreSQL with RLS
- Separate admin app
- Custom wallet system
- S3 file storage

**Adapted Design (Cortiware):**
- Next.js API routes (single consolidated endpoint)
- Prisma ORM with existing schema
- Integrated into Client/Owner Portal
- Existing @cortiware/wallet system
- Base64 file upload (no S3 required for MVP)

### Key Design Decisions

1. **Single API Route** (`/api/owner/import`)
   - Maintains 36-route cap
   - Actions: analyze, map, execute, status, errors, cancel
   - Uses existing `assertOwnerOr403` guard

2. **Prisma Integration**
   - Reuses existing ImportJob, ImportMapping, ImportError models
   - No need for separate imp_runs, imp_summaries tables
   - Leverages Prisma's type safety and migrations

3. **AI Credit System**
   - Uses existing `checkAiBudget()` from @cortiware/wallet
   - Returns 402 Payment Required when insufficient credits
   - Integrates with existing PaymentRequiredBanner UI

4. **Privacy-First Approach**
   - Never sends full datasets to AI
   - Masks all PII (emails, phones, addresses, names)
   - Sends only column summaries + 3-5 masked examples
   - Statistical analysis without raw data exposure

## Implementation Phases

### Phase 1: Core Services ✅ (Completed)
- [x] AI mapping assistant
- [x] Data masking
- [x] Data summarizer
- [x] Tier classification
- [x] Cost calculation

### Phase 2: API Route (Next - 4-6 hours)
- [ ] Create `/api/owner/import/route.ts`
- [ ] Implement analyze action (AI-powered)
- [ ] Implement map action (save mappings)
- [ ] Implement execute action (batch processing)
- [ ] Implement status action (progress tracking)
- [ ] Implement errors action (error download)
- [ ] Implement cancel action

### Phase 3: File Parsers (4-6 hours)
- [ ] CSV parser (using papaparse)
- [ ] Excel parser (using xlsx)
- [ ] JSON parser (native)
- [ ] XML parser (using fast-xml-parser)
- [ ] Unified file reader interface

### Phase 4: Batch Processor (6-8 hours)
- [ ] Batch import service (100 records/batch)
- [ ] Progress tracking
- [ ] Error logging
- [ ] Deduplication logic
- [ ] Data transformation pipeline
- [ ] Validation engine

### Phase 5: Frontend Enhancement (8-10 hours)
- [ ] Multi-step wizard UI
- [ ] AI toggle with cost estimate
- [ ] Confidence scores display
- [ ] Field mapping interface
- [ ] Progress tracker
- [ ] Error report download
- [ ] Results summary

### Phase 6: Testing & Documentation (4-6 hours)
- [ ] Unit tests for all services
- [ ] Integration tests for full flow
- [ ] Sample test files
- [ ] User documentation
- [ ] API documentation

## API Design

### Request/Response Examples

**1. Analyze with AI:**
```typescript
POST /api/owner/import
{
  "action": "analyze",
  "aiAssist": true,
  "entityType": "CUSTOMERS",
  "fileName": "customers.csv",
  "fileContent": "base64_encoded_sample",
  "fileSize": 123456
}

Response:
{
  "ok": true,
  "importJobId": "job_abc123",
  "suggestions": {
    "mappings": [
      {
        "source": "Cust Name",
        "target": "primaryName",
        "confidence": 0.94,
        "why": "semantic synonym match",
        "transform": ["trim"]
      }
    ],
    "transforms": [
      { "target": "email", "rules": ["lowercase", "trim"] }
    ],
    "validations": [
      { "target": "phoneE164", "rules": ["normalizePhone"] }
    ],
    "dedupe": { "fields": ["email", "phoneE164"] }
  },
  "tier": "standard",
  "estimateCents": 15,
  "retailPriceCents": 299
}
```

**2. Save Mappings:**
```typescript
POST /api/owner/import
{
  "action": "map",
  "importJobId": "job_abc123",
  "mappings": [...],
  "transforms": [...],
  "validations": [...],
  "dedupe": {...},
  "saveAsTemplate": true,
  "templateName": "QuickBooks Customers"
}

Response:
{
  "ok": true,
  "importJobId": "job_abc123",
  "mappingId": "map_xyz789"
}
```

**3. Execute Import:**
```typescript
POST /api/owner/import
{
  "action": "execute",
  "importJobId": "job_abc123",
  "fileContent": "base64_encoded_full_file",
  "batchSize": 100
}

Response:
{
  "ok": true,
  "importJobId": "job_abc123",
  "status": "PROCESSING",
  "totalRecords": 5000,
  "estimatedDuration": "5 minutes"
}
```

## Pricing Strategy

### Tier Classification
- **Light** (≤10 columns, ≤100 rows): $0.99
- **Standard** (≤30 columns, ≤500 rows): $2.99
- **Complex** (>30 columns or >500 rows): $4.99

### Cost Breakdown
- **AI Cost**: GPT-4o-mini tokens ($0.03-$0.35 per import)
- **Infrastructure**: 20% overhead
- **Margin**: 2-4× markup on costs
- **Client Value**: Saves 20-40 minutes per import

### Credit System Integration
- 1 credit = $0.05 (existing system)
- Light import: ~20 credits
- Standard import: ~60 credits
- Complex import: ~100 credits

## Privacy & Security

### Data Protection
1. **Never send full datasets** - only summaries and masked samples
2. **Mask all PII** - emails, phones, addresses, names
3. **Statistical analysis** - patterns without raw data
4. **Minimal examples** - 3-5 masked rows maximum
5. **No storage** - AI responses not persisted long-term

### Compliance
- GDPR-compliant (no PII to third parties)
- CCPA-compliant (data minimization)
- SOC 2 ready (audit trail in ImportJob)

## Success Metrics

### Technical Metrics
- AI mapping accuracy: >90% for common scenarios
- Import completion rate: >95%
- Average import time: <5 minutes for 1000 records
- Error rate: <5%

### Business Metrics
- AI adoption rate: >30% of imports
- Time saved per import: 20-40 minutes
- Customer satisfaction: >4.5/5 stars
- Revenue per import: $0.50-$2.00 margin

## Next Steps

1. **Immediate (Phase 2):**
   - Create `/api/owner/import/route.ts`
   - Implement all 6 actions
   - Integrate with existing AI credit system
   - Test with sample data

2. **Short-term (Phases 3-4):**
   - File parsers for all formats
   - Batch processing engine
   - Data transformation pipeline
   - Validation and deduplication

3. **Medium-term (Phases 5-6):**
   - Enhanced wizard UI
   - Comprehensive testing
   - User documentation
   - Production deployment

## Files Created

1. `src/lib/import/ai-mapping-assistant.ts` - AI-powered field mapping
2. `src/lib/import/data-masking.ts` - Privacy-preserving data masking
3. `src/lib/import/data-summarizer.ts` - Column analysis and type inference
4. `docs/IMPORT_WIZARD_AI_IMPLEMENTATION.md` - This document

## Estimated Effort

- **Phase 1 (Core Services)**: 6-8 hours ✅ COMPLETE
- **Phase 2 (API Route)**: 4-6 hours
- **Phase 3 (File Parsers)**: 4-6 hours
- **Phase 4 (Batch Processor)**: 6-8 hours
- **Phase 5 (Frontend)**: 8-10 hours
- **Phase 6 (Testing/Docs)**: 4-6 hours

**Total**: 32-44 hours for complete implementation

## References

- Original design: `docs/Execute/importer/`
- Prisma schema: `prisma/schema.prisma` (ImportJob, ImportMapping, ImportError)
- Existing AI system: `@cortiware/wallet`, `checkAiBudget()`
- UI components: `@cortiware/ui-components`

