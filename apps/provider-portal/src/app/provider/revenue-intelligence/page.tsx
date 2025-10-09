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
  try {
    // Fetch all revenue data in parallel
    const [
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
  } catch (error) {
    console.error('Revenue data fetch error:', error);
    return (
      <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>
        <h1>Revenue Intelligence</h1>
        <p style={{ color: 'var(--text-error)' }}>
          Failed to load revenue data. Please try again later.
        </p>
      </div>
    );
  }
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

