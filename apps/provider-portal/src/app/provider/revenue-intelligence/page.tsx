/**
 * Revenue Intelligence & Forecasting Page
 * 
 * Server-side page that fetches revenue data and passes to client component
 */

import { Suspense } from 'react';
import RevenueClient from './RevenueClient';
import {
  getRevenueMetrics,
  getRevenueForecast,
  getCohortAnalysis,
  getExpansionMetrics,
  getChurnImpact,
  getLtvCacMetrics,
  getRevenueWaterfall,
  type RevenueMetrics,
  type RevenueForecast,
  type CohortData,
  type ExpansionMetrics,
  type ChurnImpact,
  type LtvCacMetrics,
  type RevenueWaterfall,
} from '@/services/provider/revenue.service';

export const metadata = {
  title: 'Revenue Intelligence | Provider Portal',
  description: 'MRR/ARR tracking, forecasting, and cohort analysis',
};

async function RevenueData() {
  // Handle build-time gracefully (no DATABASE_URL available)
  let metrics: RevenueMetrics = {
    mrrCents: 0,
    arrCents: 0,
    momGrowthPercent: 0,
    yoyGrowthPercent: 0,
    totalRevenueCents: 0,
    activeSubscriptions: 0,
    averageRevenuePerAccount: 0
  };
  let forecast: RevenueForecast[] = [];
  let cohorts: CohortData[] = [];
  let expansion: ExpansionMetrics = {
    expansionMrrCents: 0,
    contractionMrrCents: 0,
    netExpansionRate: 0,
    upgradeCount: 0,
    downgradeCount: 0,
    averageExpansionCents: 0
  };
  let churn: ChurnImpact = {
    churnedMrrCents: 0,
    churnedCustomers: 0,
    churnRate: 0,
    annualizedChurnImpactCents: 0,
    topChurnReasons: []
  };
  let ltvCac: LtvCacMetrics = {
    averageLtvCents: 0,
    averageCacCents: 0,
    ltvCacRatio: 0,
    benchmark: 'Poor',
    paybackMonths: 0
  };
  let waterfall: RevenueWaterfall = {
    startingMrrCents: 0,
    newMrrCents: 0,
    expansionMrrCents: 0,
    contractionMrrCents: 0,
    churnedMrrCents: 0,
    endingMrrCents: 0,
    netChangeCents: 0,
    netChangePercent: 0
  };

  try {
    // Fetch all revenue data in parallel
    [
      metrics,
      forecast,
      cohorts,
      expansion,
      churn,
      ltvCac,
      waterfall,
    ] = await Promise.all([
      getRevenueMetrics(),
      getRevenueForecast(6),
      getCohortAnalysis(),
      getExpansionMetrics(),
      getChurnImpact(),
      getLtvCacMetrics(),
      getRevenueWaterfall(),
    ]);
  } catch (error) {
    console.log('Revenue page: Database not available during build, using empty data');
  }

  return (
    <RevenueClient
      metrics={metrics}
      forecast={forecast}
      cohorts={cohorts}
      expansion={expansion}
      churn={churn}
      ltvCac={ltvCac}
      waterfall={waterfall}
    />
  );
}

export default function RevenuePage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>
          <h1>Revenue Intelligence</h1>
          <p>Loading revenue data...</p>
        </div>
      }
    >
      <RevenueData />
    </Suspense>
  );
}

