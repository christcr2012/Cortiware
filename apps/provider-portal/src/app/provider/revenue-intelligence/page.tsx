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
} from '@/services/provider/revenue.service';

export const metadata = {
  title: 'Revenue Intelligence | Provider Portal',
  description: 'MRR/ARR tracking, forecasting, and cohort analysis',
};

async function RevenueData() {
  // Handle build-time gracefully (no DATABASE_URL available)
  let metrics = { mrr: 0, arr: 0, growth: 0, churn: 0 };
  let forecast = [];
  let cohorts = [];
  let expansion = { rate: 0, revenue: 0 };
  let churn = { rate: 0, impact: 0 };
  let ltvCac = { ltv: 0, cac: 0, ratio: 0 };
  let waterfall = [];

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

