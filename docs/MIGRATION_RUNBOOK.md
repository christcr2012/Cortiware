# Migration Runbook

This document provides step-by-step instructions for migrating data from external systems to Cortiware.

## Pre-Migration Checklist

- [ ] Backup external system data
- [ ] Create test org in Cortiware
- [ ] Verify migration scripts are available
- [ ] Review data mapping requirements
- [ ] Identify data quality issues
- [ ] Plan rollback strategy

## Migration Scripts

### Assets Migration
```bash
tsx scripts/migrations/migrate_assets.ts <input.json> <orgId> [output.json]
```

**Input format:**
```json
[
  {
    "external_id": "ASSET-001",
    "type": "rolloff",
    "size": "30yd",
    "tag": "TAG-A1"
  }
]
```

**Output:** Cortiware-compatible assets JSON

### Landfills Migration
```bash
tsx scripts/migrations/migrate_landfills.ts <input.json> <orgId> [output.json]
```

**Input format:**
```json
[
  {
    "external_id": "LF-001",
    "name": "North Landfill",
    "latitude": 40.0,
    "longitude": -105.5,
    "accepted_materials": "msw;c&d"
  }
]
```

**Output:** Cortiware-compatible landfills JSON

### Customers Migration
```bash
tsx scripts/migrations/migrate_customers.ts <input.json> <orgId> [output.json]
```

**Input format:**
```json
[
  {
    "external_id": "CUST-001",
    "name": "Acme Corp",
    "email": "contact@acme.com",
    "phone": "555-1234",
    "address": "123 Main St"
  }
]
```

**Output:** Cortiware-compatible customers JSON

## Migration Steps

### 1. Export from External System
```bash
# Export assets
external-system export assets > external_assets.json

# Export landfills
external-system export landfills > external_landfills.json

# Export customers
external-system export customers > external_customers.json
```

### 2. Transform Data
```bash
# Transform assets
tsx scripts/migrations/migrate_assets.ts external_assets.json org-123 out/assets.json

# Transform landfills
tsx scripts/migrations/migrate_landfills.ts external_landfills.json org-123 out/landfills.json

# Transform customers
tsx scripts/migrations/migrate_customers.ts external_customers.json org-123 out/customers.json
```

### 3. Validate Output
```bash
# Check record counts
wc -l out/*.json

# Spot-check data
head -n 20 out/assets.json
head -n 20 out/landfills.json
head -n 20 out/customers.json
```

### 4. Import to Cortiware
```bash
# Import assets (when DB loader available)
tsx scripts/seeds/load_assets.ts out/assets.json

# Import landfills
tsx scripts/seeds/load_landfills.ts out/landfills.json

# Import customers
tsx scripts/seeds/load_customers.ts out/customers.json
```

### 5. Verify in Application
- [ ] Log in to Cortiware
- [ ] Navigate to Assets page
- [ ] Verify asset count matches
- [ ] Spot-check asset details
- [ ] Repeat for landfills and customers

## Rollback Procedure

### If Migration Fails During Transform
1. Fix transformation script
2. Re-run migration from step 2
3. No database changes to rollback

### If Migration Fails During Import
1. Stop import process
2. Delete imported records:
   ```sql
   DELETE FROM assets WHERE orgId = 'org-123';
   DELETE FROM landfills WHERE orgId = 'org-123';
   DELETE FROM customers WHERE orgId = 'org-123';
   ```
3. Fix import script
4. Re-run from step 4

### If Migration Succeeds But Data Is Wrong
1. Export current Cortiware data for backup
2. Delete migrated records (see above)
3. Fix transformation logic
4. Re-run full migration

## Data Quality Checks

### Assets
- [ ] All assets have valid IDs
- [ ] All assets have types (rolloff, port-a-john, etc.)
- [ ] Sizes are consistent
- [ ] No duplicate IDs

### Landfills
- [ ] All landfills have valid IDs
- [ ] All landfills have names
- [ ] Coordinates are valid (lat: -90 to 90, lon: -180 to 180)
- [ ] Accepted materials are properly formatted
- [ ] No duplicate IDs

### Customers
- [ ] All customers have valid IDs
- [ ] All customers have names
- [ ] Email addresses are valid (if present)
- [ ] Phone numbers are formatted consistently
- [ ] No duplicate IDs

## Troubleshooting

### "Input file not found"
- Verify file path is correct
- Use absolute paths if relative paths fail

### "Missing ID for asset/landfill/customer"
- Check external data has `external_id` field
- Update transformation function if field name differs

### "Validation errors"
- Review error messages
- Fix data in external system or update transformation logic
- Re-run migration

### "Import fails with constraint violation"
- Check for duplicate IDs
- Verify foreign key references exist
- Ensure orgId is valid

## Post-Migration Tasks

- [ ] Verify all data imported correctly
- [ ] Run smoke tests on key workflows
- [ ] Update documentation with migration date
- [ ] Archive external system data
- [ ] Decommission external system (if applicable)
- [ ] Train users on Cortiware

## Support

For migration issues:
1. Check logs in `out/migration.log`
2. Review validation errors
3. Consult this runbook
4. Contact support if needed

