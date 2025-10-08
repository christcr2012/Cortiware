# Import Wizard API Documentation

## Overview

The Import Wizard API provides a single consolidated endpoint for AI-powered data migration from external systems. It supports CSV, Excel, JSON, and XML formats with intelligent field mapping, data transformation, validation, and deduplication.

**Endpoint:** `POST /api/owner/import`

**Authentication:** Owner-only (requires `rs_user` or `mv_user` cookie)

**Route Cap Compliance:** Single endpoint with action parameter (maintains 36-route cap)

---

## Actions

All requests must include an `action` parameter to specify the operation:

1. `analyze` - AI-powered field mapping with cost estimation
2. `map` - Save field mappings and transformations
3. `execute` - Start batch import with progress tracking
4. `status` - Get current import job status
5. `errors` - Download error report (JSON or CSV)
6. `cancel` - Cancel running import job

---

## 1. Analyze Action

Analyzes a sample file and suggests field mappings using AI.

### Request

```json
{
  "action": "analyze",
  "aiAssist": true,
  "entityType": "CUSTOMERS",
  "fileName": "customers.csv",
  "fileContent": "base64_encoded_sample_content",
  "fileSize": 12345
}
```

### Parameters

- `action` (string, required): Must be `"analyze"`
- `aiAssist` (boolean, optional): Enable AI-powered mapping suggestions (default: false)
- `entityType` (string, required): One of `CUSTOMERS`, `JOBS`, `INVOICES`, `ESTIMATES`, `CONTACTS`, `ADDRESSES`, `NOTES`
- `fileName` (string, required): Original filename
- `fileContent` (string, required): Base64-encoded sample file content (first 100 rows)
- `fileSize` (number, required): File size in bytes

### Response (AI Disabled)

```json
{
  "ok": true,
  "importJobId": "clx123abc",
  "detected": {
    "format": "csv",
    "columns": ["Customer Name", "Email", "Phone", "Address"],
    "sampleRows": [...]
  }
}
```

### Response (AI Enabled)

```json
{
  "ok": true,
  "importJobId": "clx123abc",
  "suggestions": {
    "mappings": [
      {
        "source": "Customer Name",
        "target": "name",
        "confidence": 0.95,
        "why": "Exact match for customer name field"
      },
      {
        "source": "Email",
        "target": "email",
        "confidence": 0.98,
        "why": "Standard email field"
      }
    ],
    "transforms": [
      {
        "target": "phone",
        "rules": ["normalizePhone"]
      }
    ],
    "validations": [
      {
        "target": "email",
        "rules": ["required", "email"]
      }
    ],
    "dedupe": {
      "fields": ["email"],
      "strategy": "skip"
    }
  },
  "tier": "light",
  "estimateCents": 99,
  "retailPriceCents": 99,
  "confidenceOverall": 0.92
}
```

### Error Response (402 Payment Required)

```json
{
  "error": "PAYMENT_REQUIRED",
  "feature": "ai.import_assistant",
  "required_prepay_cents": 300,
  "enable_path": "/owner/wallet/prepay?feature=ai.import_assistant&amount_cents=300"
}
```

---

## 2. Map Action

Saves field mappings and transformations to the import job.

### Request

```json
{
  "action": "map",
  "importJobId": "clx123abc",
  "mappings": [
    {
      "source": "Customer Name",
      "target": "name",
      "transform": ["trim"]
    }
  ],
  "transforms": [
    {
      "target": "phone",
      "rules": ["normalizePhone"]
    }
  ],
  "validations": [
    {
      "target": "email",
      "rules": ["required", "email"]
    }
  ],
  "dedupe": {
    "fields": ["email"],
    "strategy": "skip"
  },
  "saveAsTemplate": true,
  "templateName": "QuickBooks Customer Import"
}
```

### Parameters

- `action` (string, required): Must be `"map"`
- `importJobId` (string, required): Import job ID from analyze action
- `mappings` (array, optional): Field mapping configuration
- `transforms` (array, optional): Transformation rules
- `validations` (array, optional): Validation rules
- `dedupe` (object, optional): Deduplication configuration
- `saveAsTemplate` (boolean, optional): Save as reusable template
- `templateName` (string, optional): Template name (required if saveAsTemplate=true)

### Response

```json
{
  "ok": true,
  "importJobId": "clx123abc",
  "mappingId": "clx456def"
}
```

---

## 3. Execute Action

Starts batch import processing.

### Request

```json
{
  "action": "execute",
  "importJobId": "clx123abc",
  "fileName": "customers-full.csv",
  "fileContent": "base64_encoded_full_file_content",
  "batchSize": 100
}
```

### Parameters

- `action` (string, required): Must be `"execute"`
- `importJobId` (string, required): Import job ID
- `fileName` (string, required): Full file name
- `fileContent` (string, required): Base64-encoded full file content
- `batchSize` (number, optional): Records per batch (default: 100)

### Response

```json
{
  "ok": true,
  "importJobId": "clx123abc",
  "status": "PROCESSING",
  "totalRecords": 1500,
  "estimatedDuration": "15 minutes"
}
```

---

## 4. Status Action

Gets current import job status and progress.

### Request

```json
{
  "action": "status",
  "importJobId": "clx123abc"
}
```

### Response

```json
{
  "ok": true,
  "job": {
    "id": "clx123abc",
    "status": "PROCESSING",
    "entityType": "CUSTOMERS",
    "fileName": "customers.csv",
    "totalRecords": 1500,
    "processedRecords": 750,
    "successCount": 720,
    "errorCount": 20,
    "skipCount": 10,
    "progressPercent": 50,
    "startedAt": "2025-10-08T10:00:00Z",
    "completedAt": null,
    "errorSummary": null,
    "recentErrors": [
      {
        "rowNumber": 45,
        "fieldName": "email",
        "errorType": "validation",
        "errorMessage": "Invalid email format"
      }
    ]
  }
}
```

### Status Values

- `PENDING` - Job created, not started
- `ANALYZING` - AI analysis in progress
- `MAPPING` - Field mappings configured
- `PROCESSING` - Import in progress
- `COMPLETED` - Import finished successfully
- `FAILED` - Import failed
- `CANCELLED` - Import cancelled by user

---

## 5. Errors Action

Downloads error report in JSON or CSV format.

### Request (JSON)

```json
{
  "action": "errors",
  "importJobId": "clx123abc",
  "format": "json"
}
```

### Request (CSV)

```json
{
  "action": "errors",
  "importJobId": "clx123abc",
  "format": "csv"
}
```

### Response (JSON)

```json
{
  "ok": true,
  "errors": [
    {
      "rowNumber": 45,
      "fieldName": "email",
      "errorType": "validation",
      "errorMessage": "Invalid email format",
      "rawData": { "Customer Name": "John Doe", "Email": "invalid-email" }
    }
  ]
}
```

### Response (CSV)

```
Row,Field,Type,Message
45,"email","validation","Invalid email format"
67,"phone","validation","Invalid phone number"
```

---

## 6. Cancel Action

Cancels a running import job.

### Request

```json
{
  "action": "cancel",
  "importJobId": "clx123abc"
}
```

### Response

```json
{
  "ok": true,
  "importJobId": "clx123abc",
  "status": "CANCELLED"
}
```

---

## Error Codes

- `400` - Bad Request (missing parameters, invalid file)
- `402` - Payment Required (insufficient AI credits)
- `403` - Forbidden (not owner)
- `404` - Not Found (job not found)
- `500` - Internal Server Error

---

## Pricing

### AI Assistant Tiers

- **Light** (≤10 columns, ≤100 rows): $0.99
- **Standard** (≤30 columns, ≤500 rows): $2.99
- **Complex** (>30 columns or >500 rows): $4.99

### Credit Conversion

- 1 credit = $0.05
- Light tier = 20 credits
- Standard tier = 60 credits
- Complex tier = 100 credits

---

## Example Workflow

```javascript
// Step 1: Analyze sample
const analyzeRes = await fetch('/api/owner/import', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'analyze',
    aiAssist: true,
    entityType: 'CUSTOMERS',
    fileName: 'customers.csv',
    fileContent: btoa(sampleContent),
    fileSize: 12345,
  }),
});
const { importJobId, suggestions } = await analyzeRes.json();

// Step 2: Save mappings
await fetch('/api/owner/import', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'map',
    importJobId,
    mappings: suggestions.mappings,
  }),
});

// Step 3: Execute import
await fetch('/api/owner/import', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'execute',
    importJobId,
    fileName: 'customers-full.csv',
    fileContent: btoa(fullContent),
  }),
});

// Step 4: Poll for status
const interval = setInterval(async () => {
  const statusRes = await fetch('/api/owner/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'status', importJobId }),
  });
  const { job } = await statusRes.json();
  
  if (job.status === 'COMPLETED' || job.status === 'FAILED') {
    clearInterval(interval);
  }
}, 2000);
```

