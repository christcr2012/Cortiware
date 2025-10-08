# Infrastructure Monitoring & Cost Optimization System

## Overview

Comprehensive infrastructure monitoring system that tracks usage across all services, generates AI-powered upgrade recommendations, and provides proactive cost optimization.

## Architecture

### Database Schema

**Location:** `apps/provider-portal/prisma/schema.prisma`

**Models:**
- `InfrastructureMetric` - Time-series metrics for all services
- `InfrastructureLimit` - Service limits and alert thresholds
- `UpgradeRecommendation` - AI-generated upgrade recommendations with ROI analysis

**Enums:**
- `InfrastructureService` - Services we monitor (Vercel KV, Postgres, Build, Functions, etc.)
- `MetricType` - Types of metrics (storage, bandwidth, invocations, etc.)
- `RecommendationPriority` - LOW, MEDIUM, HIGH, CRITICAL
- `RecommendationStatus` - PENDING, REVIEWED, APPROVED, IMPLEMENTED, DISMISSED, EXPIRED

### Services

**Location:** `apps/provider-portal/src/services/infrastructure/`

#### 1. **VercelKVMonitor** (`vercel-kv-monitor.ts`)
Monitors Vercel KV (Redis) usage:
- Storage usage (MB)
- Commands per day
- Connection count
- Latency (ms)

**Methods:**
- `collectMetrics()` - Collect current KV metrics
- `getPlanLimits(plan)` - Get limits for free/pro/enterprise plans

#### 2. **VercelPlatformMonitor** (`vercel-platform-monitor.ts`)
Monitors Vercel platform usage:
- Build minutes
- Function invocations
- Bandwidth (GB)
- Edge requests
- ISR reads

**Methods:**
- `collectMetrics()` - Collect current platform metrics
- `getPlanLimits(plan)` - Get limits for hobby/pro/enterprise plans
- `calculateCosts(usage, plan)` - Calculate estimated costs

#### 3. **RecommendationEngine** (`recommendation-engine.ts`)
Analyzes usage trends and generates upgrade recommendations:
- Calculates usage trends (growth rate, days to limit)
- Evaluates upgrade necessity
- Performs ROI analysis
- Generates human-readable recommendations

**Methods:**
- `generateRecommendations()` - Analyze all services and generate recommendations
- `saveRecommendations(recs)` - Save recommendations to database

#### 4. **InfrastructureMonitoringService** (`index.ts`)
Main orchestrator that coordinates all monitoring:
- Collects metrics from all monitors
- Saves metrics to database
- Generates recommendations
- Checks for alert conditions
- Provides usage summaries

**Methods:**
- `collectAllMetrics()` - Collect from all monitors
- `saveMetrics(metrics)` - Save to database
- `runMonitoringCycle()` - Full monitoring cycle
- `initializeDefaultLimits()` - Set up default service limits
- `getUsageSummary()` - Get current usage across all services

## Services Monitored

### 1. Vercel KV (Redis)
- **Free Tier:** 30 MB storage, 10K commands/day
- **Pro Tier:** 512 MB storage, 100K commands/day
- **Metrics:** Storage, commands, connections, latency

### 2. Vercel Platform
- **Build Minutes:** 100 GB-hours included (Pro), $40 per 100 GB-hours overage
- **Function Invocations:** Unlimited but charged
- **Bandwidth:** 1 TB included (Pro)
- **Metrics:** Build time, invocations, bandwidth, edge requests, ISR reads

### 3. Vercel Postgres (Future)
- **Metrics:** Storage, connections, query performance

### 4. AI Usage (Already Tracked)
- **Models:** OpenAI, Anthropic
- **Metrics:** Tokens, costs, credits
- **Tables:** `AiUsageEvent`, `AiMonthlySummary`

## Usage

### Initialize the System

```typescript
import { PrismaClient } from '@prisma/client';
import { InfrastructureMonitoringService } from '@/services/infrastructure';

const prisma = new PrismaClient();
const monitoring = new InfrastructureMonitoringService(prisma, {
  vercelToken: process.env.VERCEL_TOKEN,
  vercelTeamId: process.env.VERCEL_ORG_ID,
  vercelProjectIds: [
    process.env.VERCEL_PROJECT_ID_PROVIDER,
    process.env.VERCEL_PROJECT_ID_TENANT,
    // ... other projects
  ],
});

// Initialize default limits
await monitoring.initializeDefaultLimits();
```

### Run Monitoring Cycle

```typescript
// Collect metrics, generate recommendations, check alerts
const result = await monitoring.runMonitoringCycle();

console.log(`Collected ${result.metricsCollected} metrics`);
console.log(`Generated ${result.recommendationsGenerated} recommendations`);
console.log(`Triggered ${result.alertsTriggered} alerts`);
```

### Get Usage Summary

```typescript
const summary = await monitoring.getUsageSummary();

// Example output:
// {
//   "VERCEL_KV_STORAGE_MB": { current: 2.5, limit: 30, percent: 8.3 },
//   "VERCEL_BUILD_BUILD_MINUTES": { current: 360, limit: 6000, percent: 6.0 },
//   ...
// }
```

## Cron Job Setup

**File:** `apps/provider-portal/src/app/api/cron/collect-metrics/route.ts` (To be created)

```typescript
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { InfrastructureMonitoringService } from '@/services/infrastructure';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const monitoring = new InfrastructureMonitoringService(prisma);
    const result = await monitoring.runMonitoringCycle();
    
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Monitoring cycle failed:', error);
    return NextResponse.json(
      { error: 'Monitoring cycle failed' },
      { status: 500 }
    );
  }
}
```

**Vercel Cron Configuration:** `apps/provider-portal/vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/collect-metrics",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

## Alert Thresholds

Default thresholds (configurable per service):
- **Warning:** 75% of limit
- **Critical:** 90% of limit

Alerts are triggered when usage crosses these thresholds.

## Upgrade Recommendations

### Priority Levels

1. **CRITICAL** - At or above 90% of limit
2. **HIGH** - Will reach limit within 7 days
3. **MEDIUM** - Will reach limit within 30 days
4. **LOW** - Approaching warning threshold

### ROI Analysis

Each recommendation includes:
- **Current Cost** - Monthly cost on current plan
- **Projected Cost** - Estimated cost if limit is reached (includes overages)
- **Upgrade Cost** - Monthly cost on recommended plan
- **Revenue Impact** - Estimated revenue loss from downtime
- **Profit Impact** - Net profit from upgrade
- **ROI** - Return on investment percentage

### Example Recommendation

```json
{
  "service": "VERCEL_KV",
  "currentPlan": "free",
  "recommendedPlan": "pro",
  "priority": "HIGH",
  "currentUsage": 25.5,
  "limitValue": 30,
  "usagePercent": 85,
  "daysToLimit": 5,
  "currentCost": 0,
  "upgradeCost": 1,
  "revenueImpact": 1000,
  "profitImpact": 999,
  "roi": 99900,
  "reason": "Your vercel kv storage mb is at 85.0% of the free plan limit. At current growth rate, you'll reach the limit in approximately 5 days. Upgrading to the pro plan will provide additional capacity and prevent service interruptions.",
  "benefits": [
    "Increased storage mb capacity",
    "Avoid service degradation and downtime",
    "Support business growth without interruption",
    "Better performance and reliability"
  ],
  "risks": [
    "Service may become unavailable if limit is reached",
    "Potential revenue loss from downtime",
    "Customer experience degradation",
    "Emergency upgrade may be more expensive"
  ]
}
```

## Dashboard UI (To Be Built)

**Location:** `apps/provider-portal/src/app/(owner)/infrastructure/page.tsx`

**Features:**
- Real-time usage metrics for all services
- Usage trend charts (last 30 days)
- Active upgrade recommendations
- Alert history
- One-click upgrade actions

## Next Steps

### Remaining Tasks

1. ✅ Database schema (COMPLETE)
2. ✅ Vercel KV monitoring service (COMPLETE)
3. ✅ Vercel platform monitoring service (COMPLETE)
4. ✅ Recommendation engine (COMPLETE)
5. ✅ Main orchestrator service (COMPLETE)
6. ⏳ Database (Postgres) monitoring service
7. ⏳ Infrastructure dashboard UI
8. ⏳ Alert system (email/in-app notifications)
9. ⏳ Cron job endpoint
10. ⏳ Prisma migration

### Migration Command

```bash
cd apps/provider-portal
npx prisma migrate dev --name add_infrastructure_monitoring
```

## Related Documentation

- [Cost Optimization](./COST_OPTIMIZATION.md) - Vercel deployment cost optimizations
- [AI Usage Tracking](../apps/provider-portal/prisma/schema.prisma) - Existing AI cost monitoring

