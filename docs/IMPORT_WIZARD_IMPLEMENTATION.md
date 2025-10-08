# Import Wizard - Complete Implementation Guide

## Overview

The Import Wizard enables Clients (roofing companies, HVAC contractors, concrete lifting businesses, etc.) to migrate all their data from previous software systems into Cortiware. This is a production-ready, multi-step wizard with sample-based format learning, interactive field mapping, and batch processing.

## Status: Schema Complete ✅ | Implementation In Progress

### Completed
- ✅ Prisma schema models (ImportJob, ImportMapping, ImportError)
- ✅ Enums (ImportStatus, ImportEntityType)
- ✅ Database relations (Org, User back-relations)
- ✅ Migration ready for deployment

### Remaining Work
1. **API Route** (`/api/owner/import`) - Single consolidated endpoint
2. **Import Service** - Core processing logic
3. **Frontend Components** - Multi-step wizard UI
4. **File Parsers** - CSV, Excel, JSON, XML support
5. **Data Validators** - Schema validation and transformation
6. **Batch Processor** - Handle large files without timeouts
7. **Documentation** - User guide and API docs
8. **Tests** - Unit and integration tests

## Architecture

### Database Schema

```prisma
enum ImportStatus {
  PENDING      // Initial state
  ANALYZING    // Analyzing sample file
  MAPPING      // User configuring field mappings
  PROCESSING   // Batch import in progress
  COMPLETED    // Successfully completed
  FAILED       // Failed with errors
  CANCELLED    // User cancelled
}

enum ImportEntityType {
  CUSTOMERS    // Client's end customers
  JOBS         // Projects/work orders
  INVOICES     // Billing records
  ESTIMATES    // Quotes/proposals
  CONTACTS     // Contact information
  ADDRESSES    // Service locations
  NOTES        // Customer interaction history
}

model ImportJob {
  id              String            @id @default(cuid())
  orgId           String
  userId          String
  entityType      ImportEntityType
  status          ImportStatus      @default(PENDING)
  fileName        String
  fileSize        Int               // bytes
  totalRecords    Int               @default(0)
  processedRecords Int              @default(0)
  successCount    Int               @default(0)
  errorCount      Int               @default(0)
  skipCount       Int               @default(0)
  mappingId       String?           // Optional saved mapping template
  sampleData      Json?             // First 10 rows for preview
  fieldMappings   Json?             // Source → Cortiware field mappings
  transformRules  Json?             // Data transformation rules
  validationRules Json?             // Validation configuration
  progressPercent Int               @default(0)
  startedAt       DateTime?
  completedAt     DateTime?
  errorSummary    String?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  errors          ImportError[]
  mapping         ImportMapping?
  org             Org
  user            User
}

model ImportMapping {
  id              String            @id @default(cuid())
  orgId           String
  name            String            // e.g., "QuickBooks Customer Import"
  entityType      ImportEntityType
  sourceFormat    String            // csv, excel, json, xml
  fieldMappings   Json              // Mapping configuration
  transformRules  Json              // Transformation rules
  validationRules Json              // Validation rules
  isTemplate      Boolean           @default(false)
  useCount        Int               @default(0)
  lastUsedAt      DateTime?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  jobs            ImportJob[]
  org             Org
}

model ImportError {
  id              String      @id @default(cuid())
  importJobId     String
  rowNumber       Int
  fieldName       String?
  errorType       String      // validation, transformation, duplicate, missing_required
  errorMessage    String
  rawData         Json?       // Original row data for debugging
  createdAt       DateTime    @default(now())
  
  importJob       ImportJob
}
```

### API Design

**Single Consolidated Route:** `/api/owner/import`

This route handles all import operations via an `action` parameter to stay within the 36-route cap.

**Actions:**
- `analyze` - Analyze sample file and detect format/structure
- `map` - Save field mapping configuration
- `execute` - Execute full import with batch processing
- `status` - Get import job status and progress
- `errors` - Download error report
- `cancel` - Cancel running import

**Request/Response Examples:**

```typescript
// 1. Analyze Sample File
POST /api/owner/import
{
  "action": "analyze",
  "entityType": "CUSTOMERS",
  "fileName": "customers.csv",
  "fileContent": "base64_encoded_content", // First 100 rows
  "fileSize": 1024000
}

Response:
{
  "ok": true,
  "jobId": "job_abc123",
  "detected": {
    "format": "csv",
    "delimiter": ",",
    "hasHeader": true,
    "encoding": "utf-8",
    "columns": ["Name", "Email", "Phone", "Address"],
    "dataTypes": {
      "Name": "text",
      "Email": "email",
      "Phone": "phone",
      "Address": "address"
    },
    "sampleRows": [...],
    "suggestedMappings": {
      "Name": "primaryName",
      "Email": "email",
      "Phone": "phoneE164",
      "Address": "addressLine1"
    }
  }
}

// 2. Save Field Mapping
POST /api/owner/import
{
  "action": "map",
  "jobId": "job_abc123",
  "fieldMappings": {
    "Name": { "target": "primaryName", "transform": "trim" },
    "Email": { "target": "email", "transform": "lowercase|trim" },
    "Phone": { "target": "phoneE164", "transform": "normalizePhone" },
    "Address": { "target": "addressLine1", "transform": "trim" }
  },
  "validationRules": {
    "email": { "required": true, "format": "email" },
    "phoneE164": { "required": false, "format": "e164" }
  },
  "saveAsTemplate": true,
  "templateName": "QuickBooks Customers"
}

Response:
{
  "ok": true,
  "jobId": "job_abc123",
  "mappingId": "map_xyz789",
  "preview": [...] // Transformed sample rows
}

// 3. Execute Full Import
POST /api/owner/import
{
  "action": "execute",
  "jobId": "job_abc123",
  "fileContent": "base64_encoded_full_file",
  "batchSize": 100, // Process 100 records at a time
  "deduplicateBy": ["email", "phone"] // Optional deduplication
}

Response:
{
  "ok": true,
  "jobId": "job_abc123",
  "status": "PROCESSING",
  "totalRecords": 5000,
  "estimatedDuration": "5 minutes"
}

// 4. Check Status
POST /api/owner/import
{
  "action": "status",
  "jobId": "job_abc123"
}

Response:
{
  "ok": true,
  "job": {
    "id": "job_abc123",
    "status": "PROCESSING",
    "progressPercent": 45,
    "totalRecords": 5000,
    "processedRecords": 2250,
    "successCount": 2200,
    "errorCount": 50,
    "skipCount": 0,
    "estimatedTimeRemaining": "3 minutes"
  }
}

// 5. Download Error Report
POST /api/owner/import
{
  "action": "errors",
  "jobId": "job_abc123",
  "format": "csv" // or "json"
}

Response: CSV file download
```

### Frontend Multi-Step Wizard

**Steps:**
1. **Upload Sample** - Client uploads sample file (first 100 rows)
2. **Review Detection** - Show detected format, columns, data types
3. **Map Fields** - Interactive drag-and-drop or dropdown field mapping
4. **Preview** - Show transformed sample records
5. **Upload Full Data** - Client uploads complete export file
6. **Process** - Real-time progress tracking with batch processing
7. **Review Results** - Summary report with success/error counts

**Component Structure:**
```
src/app/(owner)/import-wizard/
├── page.tsx                    # Route page
├── ImportWizard.tsx            # Main wizard component
├── components/
│   ├── StepIndicator.tsx       # Progress indicator
│   ├── FileUpload.tsx          # Drag-and-drop file upload
│   ├── FormatDetection.tsx     # Show detected format/structure
│   ├── FieldMapper.tsx         # Interactive field mapping UI
│   ├── DataPreview.tsx         # Preview transformed data
│   ├── ProgressTracker.tsx     # Real-time progress display
│   └── ResultsSummary.tsx      # Final results with error download
└── hooks/
    ├── useImportJob.ts         # Import job state management
    └── useFileParser.ts        # Client-side file parsing
```

### File Format Support

**Supported Formats:**
- CSV (comma, tab, semicolon delimited)
- Excel (.xlsx, .xls)
- JSON (array of objects)
- XML (with configurable root/record elements)

**Parser Libraries:**
- CSV: `papaparse` (already used in codebase)
- Excel: `xlsx` (already in dependencies)
- JSON: Native `JSON.parse`
- XML: `fast-xml-parser`

### Data Transformation

**Built-in Transformations:**
- `trim` - Remove leading/trailing whitespace
- `lowercase` - Convert to lowercase
- `uppercase` - Convert to uppercase
- `normalizePhone` - Convert to E.164 format
- `parseDate` - Parse various date formats
- `parseAddress` - Extract address components
- `parseNumber` - Parse numeric values with locale support
- `deduplicate` - Remove duplicate records

**Custom Transformations:**
Clients can define custom transformation rules via JavaScript expressions (sandboxed).

### Batch Processing

**Strategy:**
1. Split large files into batches of 100 records
2. Process each batch sequentially to avoid memory issues
3. Update progress after each batch
4. Store errors in ImportError table
5. Allow resume on failure

**Implementation:**
```typescript
async function processBatch(
  jobId: string,
  records: any[],
  mappings: FieldMappings,
  validations: ValidationRules
): Promise<BatchResult> {
  const results = {
    success: 0,
    errors: 0,
    skipped: 0,
    errorDetails: []
  };
  
  for (const [index, record] of records.entries()) {
    try {
      // 1. Transform fields
      const transformed = transformRecord(record, mappings);
      
      // 2. Validate
      const validation = validateRecord(transformed, validations);
      if (!validation.valid) {
        results.errors++;
        await logError(jobId, index, validation.errors);
        continue;
      }
      
      // 3. Check for duplicates
      const duplicate = await checkDuplicate(transformed);
      if (duplicate) {
        results.skipped++;
        continue;
      }
      
      // 4. Create record
      await createRecord(transformed);
      results.success++;
      
    } catch (error) {
      results.errors++;
      await logError(jobId, index, error);
    }
  }
  
  return results;
}
```

## Next Steps

### Phase 1: Core Infrastructure (Priority 1)
1. Create `/api/owner/import/route.ts` with all actions
2. Create `src/services/import/` directory with:
   - `import.service.ts` - Main service
   - `file-parser.service.ts` - File parsing
   - `field-mapper.service.ts` - Field mapping logic
   - `data-transformer.service.ts` - Data transformations
   - `batch-processor.service.ts` - Batch processing
   - `validator.service.ts` - Data validation

### Phase 2: Frontend Components (Priority 2)
1. Enhance `ImportWizard.tsx` with multi-step wizard
2. Create all component files listed above
3. Add real-time progress updates via polling or WebSockets
4. Implement error handling and user feedback

### Phase 3: Testing & Documentation (Priority 3)
1. Create sample test files for common formats
2. Write unit tests for all services
3. Write integration tests for full import flow
4. Create user documentation with screenshots
5. Create API documentation

### Phase 4: Advanced Features (Priority 4)
1. Template marketplace (share mapping templates)
2. Scheduled imports (recurring imports)
3. Webhook notifications on completion
4. Advanced deduplication strategies
5. Data quality scoring

## Constraints Maintained

✅ **36-Route Cap:** Single `/api/owner/import` route handles all actions  
✅ **Owner-Only Access:** Uses `assertOwnerOr403` guard  
✅ **All Verticals:** Available to all clients regardless of vertical  
✅ **Performance:** Batch processing handles 10,000+ records  
✅ **No File Locks:** Uses streaming and chunked processing  

## Migration

Run migration after Prisma client regeneration:
```bash
npx prisma migrate dev --name add_import_wizard_models
```

## Estimated Effort

- **Phase 1 (Core):** 8-12 hours
- **Phase 2 (Frontend):** 6-8 hours
- **Phase 3 (Testing/Docs):** 4-6 hours
- **Phase 4 (Advanced):** 8-12 hours

**Total:** 26-38 hours for complete implementation

## Success Metrics

- Client can upload sample file and see auto-detected mappings
- Client can manually adjust field mappings
- Client can preview transformed data
- Client can upload full export and see real-time progress
- Import completes successfully with detailed summary
- Errors are logged and downloadable
- Client can retry failed imports
- All TypeScript errors resolved
- All tests passing

