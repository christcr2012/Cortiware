# Infrastructure Monitoring Migration Instructions

## Migration Name
`add_infrastructure_monitoring`

## What This Migration Adds

### New Enums
- `InfrastructureService` - Services we monitor (VERCEL_KV, VERCEL_POSTGRES, VERCEL_BUILD, etc.)
- `MetricType` - Types of metrics (STORAGE_MB, BANDWIDTH_GB, INVOCATIONS, etc.)
- `RecommendationPriority` - LOW, MEDIUM, HIGH, CRITICAL
- `RecommendationStatus` - PENDING, REVIEWED, APPROVED, IMPLEMENTED, DISMISSED, EXPIRED

### New Tables
1. **InfrastructureMetric** - Time-series metrics for all services
   - Tracks storage, bandwidth, invocations, latency, costs
   - Indexed by service, metric, and timestamp

2. **InfrastructureLimit** - Service limits and alert thresholds
   - Defines limits for each service/metric/plan combination
   - Configurable warning and critical thresholds

3. **UpgradeRecommendation** - AI-generated upgrade recommendations
   - Includes ROI analysis, cost projections, revenue impact
   - Tracks recommendation status and review history

## How to Run This Migration

### In Production (Vercel)

The migration will run automatically on next deployment if you have Vercel Postgres configured.

### Locally (If you have a local database)

```bash
cd apps/provider-portal
npx prisma migrate deploy
```

### Manual SQL (If needed)

The migration SQL will be generated automatically by Prisma. If you need to run it manually:

```bash
cd apps/provider-portal
npx prisma migrate dev --name add_infrastructure_monitoring --create-only
```

Then apply the generated SQL file in `prisma/migrations/[timestamp]_add_infrastructure_monitoring/migration.sql`

## Post-Migration Steps

1. **Initialize Default Limits:**
   ```typescript
   import { InfrastructureMonitoringService } from '@/services/infrastructure';
   const monitoring = new InfrastructureMonitoringService(prisma);
   await monitoring.initializeDefaultLimits();
   ```

2. **Set up Cron Job:**
   - Deploy the cron endpoint at `/api/cron/collect-metrics`
   - Configure Vercel cron to run every 15 minutes

3. **Verify Schema:**
   ```bash
   npx prisma studio
   ```
   Check that the new tables exist.

## Rollback (If Needed)

```bash
npx prisma migrate resolve --rolled-back add_infrastructure_monitoring
```

Then manually drop the tables:
```sql
DROP TABLE IF EXISTS "UpgradeRecommendation";
DROP TABLE IF EXISTS "InfrastructureLimit";
DROP TABLE IF EXISTS "InfrastructureMetric";
DROP TYPE IF EXISTS "RecommendationStatus";
DROP TYPE IF EXISTS "RecommendationPriority";
DROP TYPE IF EXISTS "MetricType";
DROP TYPE IF EXISTS "InfrastructureService";
```

