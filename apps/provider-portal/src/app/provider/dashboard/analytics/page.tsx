'use client';

import { useState, useEffect } from 'react';

type FederationAnalytics = {
  invoices: {
    count: number;
    totalAmountCents: number;
  };
  escalations: {
    count: number;
    byState: Record<string, number>;
  };
  clients: {
    total: number;
    active: number;
  };
};

export default function FederationAnalyticsPage() {
  const [analytics, setAnalytics] = useState<FederationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/federation/analytics');
      if (!res.ok) {
        throw new Error(`Failed to fetch analytics: ${res.statusText}`);
      }
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      console.error('Error fetching federation analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--brand-gradient)' }}>
          Federation Analytics
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          View federation operational metrics and insights
        </p>
      </header>

      <div className="flex justify-end">
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Refresh Data
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading analytics...</p>
        </div>
      )}

      {/* Analytics Dashboard */}
      {!loading && !error && analytics && (
        <>
          {/* Revenue Metrics */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Revenue Metrics</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-500 mb-1">Total Invoices</div>
                <div className="text-3xl font-bold text-blue-600">
                  {analytics.invoices.count}
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-500 mb-1">Total Revenue</div>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(analytics.invoices.totalAmountCents)}
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-500 mb-1">Average Invoice</div>
                <div className="text-3xl font-bold text-purple-600">
                  {analytics.invoices.count > 0
                    ? formatCurrency(Math.round(analytics.invoices.totalAmountCents / analytics.invoices.count))
                    : '$0.00'}
                </div>
              </div>
            </div>
          </div>

          {/* Escalation Metrics */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Escalation Metrics</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-500 mb-1">Total Escalations</div>
                <div className="text-3xl font-bold text-orange-600">
                  {analytics.escalations.count}
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-500 mb-1">Resolution Rate</div>
                <div className="text-3xl font-bold text-green-600">
                  {analytics.escalations.count > 0
                    ? Math.round(((analytics.escalations.byState.rolled_out || 0) / analytics.escalations.count) * 100)
                    : 0}%
                </div>
              </div>
            </div>

            {/* Escalation Breakdown */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Escalations by State</h3>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(analytics.escalations.byState).map(([state, count]) => (
                  <div key={state} className="border-l-4 border-blue-500 pl-4">
                    <div className="text-xs text-gray-500 uppercase">{state.replace(/_/g, ' ')}</div>
                    <div className="text-2xl font-bold">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Client Metrics */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Client Metrics</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-500 mb-1">Total Clients</div>
                <div className="text-3xl font-bold text-blue-600">
                  {analytics.clients.total}
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-500 mb-1">Active Clients</div>
                <div className="text-3xl font-bold text-green-600">
                  {analytics.clients.active}
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="text-sm text-gray-500 mb-1">Activity Rate</div>
                <div className="text-3xl font-bold text-purple-600">
                  {analytics.clients.total > 0
                    ? Math.round((analytics.clients.active / analytics.clients.total) * 100)
                    : 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Key Performance Indicators */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Key Performance Indicators</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-2">Revenue per Client</div>
                <div className="text-2xl font-bold">
                  {analytics.clients.total > 0
                    ? formatCurrency(Math.round(analytics.invoices.totalAmountCents / analytics.clients.total))
                    : '$0.00'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-2">Escalations per Client</div>
                <div className="text-2xl font-bold">
                  {analytics.clients.total > 0
                    ? (analytics.escalations.count / analytics.clients.total).toFixed(2)
                    : '0.00'}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && !error && !analytics && (
        <div className="text-center py-12 text-gray-500">
          No analytics data available
        </div>
      )}
    </div>
  );
}

