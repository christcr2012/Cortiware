'use client';

/**
 * Revenue Intelligence Client Component
 * 
 * Interactive dashboard with MRR/ARR tracking, forecasting, cohort analysis,
 * expansion metrics, churn impact, LTV:CAC, and revenue waterfall visualization.
 */

import { useState } from 'react';
import type {
  RevenueMetrics,
  RevenueForecast,
  CohortData,
  ExpansionMetrics,
  ChurnImpact,
  LtvCacMetrics,
  RevenueWaterfall,
} from '@/services/provider/revenue.service';

interface RevenueClientProps {
  metrics: RevenueMetrics;
  forecast: RevenueForecast[];
  cohorts: CohortData[];
  expansion: ExpansionMetrics;
  churn: ChurnImpact;
  ltvCac: LtvCacMetrics;
  waterfall: RevenueWaterfall;
}

export default function RevenueClient({
  metrics,
  forecast,
  cohorts,
  expansion,
  churn,
  ltvCac,
  waterfall,
}: RevenueClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'forecast' | 'cohorts' | 'expansion' | 'churn' | 'ltv'>('overview');

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/provider/revenue/export');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue-intelligence-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data');
    }
  };

  return (
    <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 600 }}>Revenue Intelligence</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>
            MRR/ARR tracking, forecasting, and growth analytics
          </p>
        </div>
        <button
          onClick={handleExport}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--accent-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Export to CSV
        </button>
      </div>

      {/* Key Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <MetricCard
          title="MRR"
          value={formatCurrency(metrics.mrrCents)}
          change={formatPercent(metrics.momGrowthPercent)}
          positive={metrics.momGrowthPercent >= 0}
        />
        <MetricCard
          title="ARR"
          value={formatCurrency(metrics.arrCents)}
          change={formatPercent(metrics.yoyGrowthPercent)}
          positive={metrics.yoyGrowthPercent >= 0}
        />
        <MetricCard
          title="Active Subscriptions"
          value={metrics.activeSubscriptions.toString()}
          change={`Avg: ${formatCurrency(metrics.averageRevenuePerAccount)}`}
          positive={true}
        />
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenueCents)}
          change="All-time"
          positive={true}
        />
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--border-primary)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'forecast', label: 'Forecast' },
            { id: 'cohorts', label: 'Cohorts' },
            { id: 'expansion', label: 'Expansion' },
            { id: 'churn', label: 'Churn' },
            { id: 'ltv', label: 'LTV:CAC' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '1rem 0',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? 600 : 400,
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab waterfall={waterfall} formatCurrency={formatCurrency} formatPercent={formatPercent} />}
      {activeTab === 'forecast' && <ForecastTab forecast={forecast} formatCurrency={formatCurrency} />}
      {activeTab === 'cohorts' && <CohortsTab cohorts={cohorts} formatCurrency={formatCurrency} />}
      {activeTab === 'expansion' && <ExpansionTab expansion={expansion} formatCurrency={formatCurrency} formatPercent={formatPercent} />}
      {activeTab === 'churn' && <ChurnTab churn={churn} formatCurrency={formatCurrency} formatPercent={formatPercent} />}
      {activeTab === 'ltv' && <LtvCacTab ltvCac={ltvCac} formatCurrency={formatCurrency} />}
    </div>
  );
}

// Metric Card Component
function MetricCard({ title, value, change, positive }: { title: string; value: string; change: string; positive: boolean }) {
  return (
    <div
      style={{
        padding: '1.5rem',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
        borderRadius: '0.75rem',
      }}
    >
      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{title}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>{value}</div>
      <div style={{ fontSize: '0.875rem', color: positive ? 'var(--text-success)' : 'var(--text-error)' }}>
        {change}
      </div>
    </div>
  );
}

// Overview Tab - Revenue Waterfall
function OverviewTab({
  waterfall,
  formatCurrency,
  formatPercent,
}: {
  waterfall: RevenueWaterfall;
  formatCurrency: (n: number) => string;
  formatPercent: (n: number) => string;
}) {
  const maxValue = Math.max(
    waterfall.startingMrrCents,
    waterfall.newMrrCents,
    waterfall.expansionMrrCents,
    waterfall.contractionMrrCents,
    waterfall.churnedMrrCents,
    waterfall.endingMrrCents
  );

  const getBarWidth = (value: number) => {
    return `${(Math.abs(value) / maxValue) * 100}%`;
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Revenue Waterfall - Current Month</h2>
      <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '0.75rem', border: '1px solid var(--border-primary)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <WaterfallBar label="Starting MRR" value={waterfall.startingMrrCents} width={getBarWidth(waterfall.startingMrrCents)} color="#3b82f6" formatCurrency={formatCurrency} />
          <WaterfallBar label="+ New MRR" value={waterfall.newMrrCents} width={getBarWidth(waterfall.newMrrCents)} color="#10b981" formatCurrency={formatCurrency} />
          <WaterfallBar label="+ Expansion" value={waterfall.expansionMrrCents} width={getBarWidth(waterfall.expansionMrrCents)} color="#10b981" formatCurrency={formatCurrency} />
          <WaterfallBar label="- Contraction" value={-waterfall.contractionMrrCents} width={getBarWidth(waterfall.contractionMrrCents)} color="#f59e0b" formatCurrency={formatCurrency} />
          <WaterfallBar label="- Churn" value={-waterfall.churnedMrrCents} width={getBarWidth(waterfall.churnedMrrCents)} color="#ef4444" formatCurrency={formatCurrency} />
          <div style={{ borderTop: '2px solid var(--border-primary)', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <WaterfallBar label="Ending MRR" value={waterfall.endingMrrCents} width={getBarWidth(waterfall.endingMrrCents)} color="#3b82f6" formatCurrency={formatCurrency} />
          </div>
        </div>
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-main)', borderRadius: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>Net Change:</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: waterfall.netChangeCents >= 0 ? 'var(--text-success)' : 'var(--text-error)' }}>
              {formatCurrency(waterfall.netChangeCents)} ({formatPercent(waterfall.netChangePercent)})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function WaterfallBar({
  label,
  value,
  width,
  color,
  formatCurrency,
}: {
  label: string;
  value: number;
  width: string;
  color: string;
  formatCurrency: (n: number) => string;
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontWeight: 500 }}>{label}</span>
        <span style={{ fontWeight: 600 }}>{formatCurrency(Math.abs(value))}</span>
      </div>
      <div style={{ width: '100%', height: '2rem', background: 'var(--bg-main)', borderRadius: '0.25rem', overflow: 'hidden' }}>
        <div style={{ width, height: '100%', background: color, transition: 'width 0.3s' }} />
      </div>
    </div>
  );
}

// Forecast Tab
function ForecastTab({
  forecast,
  formatCurrency,
}: {
  forecast: RevenueForecast[];
  formatCurrency: (n: number) => string;
}) {
  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Revenue Forecast (6 Months)</h2>
      <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '0.75rem', border: '1px solid var(--border-primary)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-primary)' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Month</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Forecasted MRR</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Actual MRR</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {forecast.map((f, idx) => (
              <tr key={f.month} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <td style={{ padding: '1rem' }}>{f.month}</td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 500 }}>{formatCurrency(f.forecastedMrrCents)}</td>
                <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-secondary)' }}>
                  {f.actualMrrCents ? formatCurrency(f.actualMrrCents) : '—'}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.25rem',
                    background: f.confidence >= 80 ? '#10b98120' : f.confidence >= 60 ? '#f59e0b20' : '#ef444420',
                    color: f.confidence >= 80 ? '#10b981' : f.confidence >= 60 ? '#f59e0b' : '#ef4444',
                    fontWeight: 500,
                  }}>
                    {f.confidence}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Cohorts Tab
function CohortsTab({
  cohorts,
  formatCurrency,
}: {
  cohorts: CohortData[];
  formatCurrency: (n: number) => string;
}) {
  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Cohort Analysis by Signup Month</h2>
      <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '0.75rem', border: '1px solid var(--border-primary)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-primary)' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Cohort</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Customers</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>M0</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>M1</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>M2</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>M3</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>M6</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>M12</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {cohorts.map((c) => (
              <tr key={c.cohortMonth} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{c.cohortMonth}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>{c.customersAcquired}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <RetentionCell value={c.month0Retention} />
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <RetentionCell value={c.month1Retention} />
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <RetentionCell value={c.month2Retention} />
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <RetentionCell value={c.month3Retention} />
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <RetentionCell value={c.month6Retention} />
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <RetentionCell value={c.month12Retention} />
                </td>
                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 500 }}>{formatCurrency(c.totalRevenueCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RetentionCell({ value }: { value: number }) {
  const getColor = (v: number) => {
    if (v >= 80) return '#10b981';
    if (v >= 60) return '#f59e0b';
    if (v >= 40) return '#ef4444';
    return '#6b7280';
  };

  return (
    <span style={{
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      background: `${getColor(value)}20`,
      color: getColor(value),
      fontWeight: 500,
    }}>
      {value}%
    </span>
  );
}

// Expansion Tab
function ExpansionTab({
  expansion,
  formatCurrency,
  formatPercent,
}: {
  expansion: ExpansionMetrics;
  formatCurrency: (n: number) => string;
  formatPercent: (n: number) => string;
}) {
  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Expansion Revenue Tracking</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <MetricCard
          title="Expansion MRR"
          value={formatCurrency(expansion.expansionMrrCents)}
          change={`${expansion.upgradeCount} upgrades`}
          positive={true}
        />
        <MetricCard
          title="Contraction MRR"
          value={formatCurrency(expansion.contractionMrrCents)}
          change={`${expansion.downgradeCount} downgrades`}
          positive={false}
        />
        <MetricCard
          title="Net Expansion Rate"
          value={formatPercent(expansion.netExpansionRate)}
          change="This month"
          positive={expansion.netExpansionRate >= 0}
        />
        <MetricCard
          title="Avg Expansion"
          value={formatCurrency(expansion.averageExpansionCents)}
          change="Per upgrade"
          positive={true}
        />
      </div>
    </div>
  );
}

// Churn Tab
function ChurnTab({
  churn,
  formatCurrency,
  formatPercent,
}: {
  churn: ChurnImpact;
  formatCurrency: (n: number) => string;
  formatPercent: (n: number) => string;
}) {
  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Churn Impact Analysis</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <MetricCard
          title="Churned MRR"
          value={formatCurrency(churn.churnedMrrCents)}
          change="This month"
          positive={false}
        />
        <MetricCard
          title="Churned Customers"
          value={churn.churnedCustomers.toString()}
          change={`${formatPercent(churn.churnRate)} churn rate`}
          positive={false}
        />
        <MetricCard
          title="Annual Impact"
          value={formatCurrency(churn.annualizedChurnImpactCents)}
          change="Annualized"
          positive={false}
        />
      </div>

      {churn.topChurnReasons.length > 0 && (
        <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '0.75rem', border: '1px solid var(--border-primary)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Top Churn Reasons</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-primary)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Reason</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Count</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Impact</th>
              </tr>
            </thead>
            <tbody>
              {churn.topChurnReasons.map((reason, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <td style={{ padding: '1rem' }}>{reason.reason}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>{reason.count}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 500 }}>{formatCurrency(reason.impactCents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// LTV:CAC Tab
function LtvCacTab({
  ltvCac,
  formatCurrency,
}: {
  ltvCac: LtvCacMetrics;
  formatCurrency: (n: number) => string;
}) {
  const getBenchmarkColor = (benchmark: string) => {
    switch (benchmark) {
      case 'Excellent': return '#10b981';
      case 'Good': return '#3b82f6';
      case 'Fair': return '#f59e0b';
      case 'Poor': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>LTV:CAC Analysis</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <MetricCard
          title="Average LTV"
          value={formatCurrency(ltvCac.averageLtvCents)}
          change="Customer lifetime value"
          positive={true}
        />
        <MetricCard
          title="Average CAC"
          value={formatCurrency(ltvCac.averageCacCents)}
          change="Customer acquisition cost"
          positive={true}
        />
        <div
          style={{
            padding: '1.5rem',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '0.75rem',
          }}
        >
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>LTV:CAC Ratio</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>{ltvCac.ltvCacRatio.toFixed(2)}:1</div>
          <div style={{
            fontSize: '0.875rem',
            color: getBenchmarkColor(ltvCac.benchmark),
            fontWeight: 600,
          }}>
            {ltvCac.benchmark}
          </div>
        </div>
        <MetricCard
          title="Payback Period"
          value={`${ltvCac.paybackMonths} months`}
          change="Time to recover CAC"
          positive={ltvCac.paybackMonths <= 12}
        />
      </div>

      <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '0.75rem', border: '1px solid var(--border-primary)' }}>
        <h3 style={{ marginBottom: '1rem' }}>Benchmark Guide</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <BenchmarkRow label="Excellent" ratio=">3:1" color="#10b981" />
          <BenchmarkRow label="Good" ratio="2-3:1" color="#3b82f6" />
          <BenchmarkRow label="Fair" ratio="1-2:1" color="#f59e0b" />
          <BenchmarkRow label="Poor" ratio="<1:1" color="#ef4444" />
        </div>
      </div>
    </div>
  );
}

function BenchmarkRow({ label, ratio, color }: { label: string; ratio: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{ width: '1rem', height: '1rem', borderRadius: '50%', background: color }} />
      <span style={{ fontWeight: 500 }}>{label}</span>
      <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)' }}>{ratio}</span>
    </div>
  );
}

