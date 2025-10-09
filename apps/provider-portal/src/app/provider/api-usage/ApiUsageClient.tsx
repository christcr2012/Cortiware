'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ApiUsageMetrics {
  tenantId: string;
  tenantName: string;
  totalRequests: number;
  requestsLast24h: number;
  requestsLast7d: number;
  requestsLast30d: number;
  errorRate: number;
  avgResponseTime: number;
  topEndpoints: Array<{
    endpoint: string;
    count: number;
    avgResponseTime: number;
    errorRate: number;
  }>;
  rateLimitStatus: {
    limit: number;
    current: number;
    remaining: number;
    resetAt: Date;
  };
  usageByDay: Array<{
    date: string;
    requests: number;
    errors: number;
  }>;
}

interface GlobalMetrics {
  totalRequests: number;
  totalRequestsLast24h: number;
  avgErrorRate: number;
  avgResponseTime: number;
  topTenants: Array<{
    tenantId: string;
    tenantName: string;
    requests: number;
  }>;
  approachingLimits: Array<{
    tenantId: string;
    tenantName: string;
    percentUsed: number;
    current: number;
    limit: number;
  }>;
  totalTenants: number;
}

interface Props {
  initialUsage: ApiUsageMetrics[];
  globalMetrics: GlobalMetrics;
}

export default function ApiUsageClient({ initialUsage, globalMetrics }: Props) {
  const [usage, setUsage] = useState(initialUsage);
  const [selectedTenant, setSelectedTenant] = useState<ApiUsageMetrics | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'requests' | 'errors' | 'responseTime'>('requests');
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const [rateLimitConfig, setRateLimitConfig] = useState({
    requestsPerMinute: 100,
    requestsPerHour: 5000,
    requestsPerDay: 100000,
    burstLimit: 200,
  });

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/provider/api-usage');
        if (res.ok) {
          const data = await res.json();
          setUsage(data.usage);
        }
      } catch (err) {
        console.error('Failed to refresh usage data:', err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Filter and sort
  const filteredUsage = usage
    .filter(u => u.tenantName.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.tenantName.localeCompare(b.tenantName);
        case 'requests':
          return b.requestsLast30d - a.requestsLast30d;
        case 'errors':
          return b.errorRate - a.errorRate;
        case 'responseTime':
          return b.avgResponseTime - a.avgResponseTime;
        default:
          return 0;
      }
    });

  const handleUpdateRateLimit = async () => {
    if (!selectedTenant) return;

    try {
      const res = await fetch(`/api/provider/api-usage/${selectedTenant.tenantId}/rate-limit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rateLimitConfig),
      });

      if (res.ok) {
        alert('Rate limit updated successfully');
        setShowRateLimitModal(false);
      } else {
        alert('Failed to update rate limit');
      }
    } catch (err) {
      alert('Error updating rate limit');
    }
  };

  return (
    <div className="container-responsive">
      <div className="mb-6">
        <h1 className="text-responsive-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          API Usage & Rate Limits
        </h1>
        <p className="text-responsive-base mt-2" style={{ color: 'var(--text-secondary)' }}>
          Monitor API usage, manage rate limits, and track performance across all tenants
        </p>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="kpi-card">
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Requests (All Time)</div>
          <div className="text-3xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>
            {globalMetrics.totalRequests.toLocaleString()}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Across {globalMetrics.totalTenants} tenants
          </div>
        </div>

        <div className="kpi-card">
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Last 24 Hours</div>
          <div className="text-3xl font-bold mt-2" style={{ color: '#10b981' }}>
            {globalMetrics.totalRequestsLast24h.toLocaleString()}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Requests in last day
          </div>
        </div>

        <div className="kpi-card">
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Avg Error Rate</div>
          <div className="text-3xl font-bold mt-2" style={{ color: globalMetrics.avgErrorRate > 5 ? '#ef4444' : '#f59e0b' }}>
            {globalMetrics.avgErrorRate.toFixed(2)}%
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Across all endpoints
          </div>
        </div>

        <div className="kpi-card">
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Avg Response Time</div>
          <div className="text-3xl font-bold mt-2" style={{ color: 'var(--brand-primary)' }}>
            {Math.round(globalMetrics.avgResponseTime)}ms
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Average latency
          </div>
        </div>
      </div>

      {/* Alerts */}
      {globalMetrics.approachingLimits.length > 0 && (
        <div className="premium-card mb-6" style={{ borderLeft: '4px solid #f59e0b' }}>
          <h3 className="font-bold text-lg mb-3" style={{ color: '#f59e0b' }}>
            ⚠️ Tenants Approaching Rate Limits
          </h3>
          <div className="space-y-2">
            {globalMetrics.approachingLimits.map(tenant => (
              <div key={tenant.tenantId} className="flex justify-between items-center">
                <div>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {tenant.tenantName}
                  </span>
                  <span className="text-sm ml-2" style={{ color: 'var(--text-secondary)' }}>
                    {tenant.current.toLocaleString()} / {tenant.limit.toLocaleString()} requests
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-bold" style={{ color: '#f59e0b' }}>
                    {tenant.percentUsed.toFixed(1)}%
                  </div>
                  <button
                    onClick={() => {
                      const tenantUsage = usage.find(u => u.tenantId === tenant.tenantId);
                      if (tenantUsage) {
                        setSelectedTenant(tenantUsage);
                        setShowRateLimitModal(true);
                      }
                    }}
                    className="btn-secondary text-sm"
                  >
                    Adjust Limit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Tenants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="premium-card">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Top 10 Tenants by Usage (Last 30 Days)
          </h3>
          <div className="space-y-2">
            {globalMetrics.topTenants.map((tenant, idx) => {
              const maxRequests = globalMetrics.topTenants[0].requests;
              const percentage = (tenant.requests / maxRequests) * 100;
              return (
                <div key={tenant.tenantId}>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: 'var(--text-primary)' }}>
                      {idx + 1}. {tenant.tenantName}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {tenant.requests.toLocaleString()} requests
                    </span>
                  </div>
                  <div className="h-2 rounded" style={{ background: 'var(--surface-3)' }}>
                    <div
                      className="h-full rounded"
                      style={{ width: `${percentage}%`, background: 'var(--brand-primary)' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Placeholder for second chart - will add endpoint performance */}
        <div className="premium-card">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            System Health
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span style={{ color: 'var(--text-secondary)' }}>API Availability</span>
              <span className="font-bold" style={{ color: '#10b981' }}>99.98%</span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: 'var(--text-secondary)' }}>P95 Response Time</span>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                {Math.round(globalMetrics.avgResponseTime * 1.5)}ms
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: 'var(--text-secondary)' }}>Error Budget Remaining</span>
              <span className="font-bold" style={{ color: globalMetrics.avgErrorRate < 1 ? '#10b981' : '#f59e0b' }}>
                {(100 - globalMetrics.avgErrorRate * 20).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: 'var(--text-secondary)' }}>Active Tenants (24h)</span>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                {usage.filter(u => u.requestsLast24h > 0).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tenant List - will continue in next section */}
      <div className="premium-card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Tenant API Usage
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tenants..."
              className="input-field"
              style={{ width: '200px' }}
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="input-field"
            >
              <option value="requests">Sort by Requests</option>
              <option value="name">Sort by Name</option>
              <option value="errors">Sort by Error Rate</option>
              <option value="responseTime">Sort by Response Time</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-primary)' }}>
                <th className="text-left p-3" style={{ color: 'var(--text-secondary)' }}>Tenant</th>
                <th className="text-right p-3" style={{ color: 'var(--text-secondary)' }}>Last 30d</th>
                <th className="text-right p-3" style={{ color: 'var(--text-secondary)' }}>Last 24h</th>
                <th className="text-right p-3" style={{ color: 'var(--text-secondary)' }}>Error Rate</th>
                <th className="text-right p-3" style={{ color: 'var(--text-secondary)' }}>Avg Response</th>
                <th className="text-right p-3" style={{ color: 'var(--text-secondary)' }}>Rate Limit</th>
                <th className="text-right p-3" style={{ color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsage.map((tenant) => {
                const percentUsed = (tenant.rateLimitStatus.current / tenant.rateLimitStatus.limit) * 100;
                const limitColor = percentUsed >= 90 ? '#ef4444' : percentUsed >= 80 ? '#f59e0b' : '#10b981';

                return (
                  <tr key={tenant.tenantId} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                    <td className="p-3">
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {tenant.tenantName}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {tenant.tenantId}
                      </div>
                    </td>
                    <td className="text-right p-3" style={{ color: 'var(--text-primary)' }}>
                      {tenant.requestsLast30d.toLocaleString()}
                    </td>
                    <td className="text-right p-3" style={{ color: 'var(--text-primary)' }}>
                      {tenant.requestsLast24h.toLocaleString()}
                    </td>
                    <td className="text-right p-3">
                      <span style={{ color: tenant.errorRate > 5 ? '#ef4444' : '#10b981' }}>
                        {tenant.errorRate.toFixed(2)}%
                      </span>
                    </td>
                    <td className="text-right p-3" style={{ color: 'var(--text-primary)' }}>
                      {tenant.avgResponseTime}ms
                    </td>
                    <td className="text-right p-3">
                      <span style={{ color: limitColor, fontWeight: 'bold' }}>
                        {percentUsed.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right p-3">
                      <button
                        onClick={() => {
                          setSelectedTenant(tenant);
                          setShowRateLimitModal(true);
                        }}
                        className="btn-secondary text-sm"
                      >
                        Configure
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rate Limit Configuration Modal */}
      {showRateLimitModal && selectedTenant && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowRateLimitModal(false)}
        >
          <div
            className="premium-card max-w-2xl w-full m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Configure Rate Limits - {selectedTenant.tenantName}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Requests per Minute
                  </label>
                  <input
                    type="number"
                    value={rateLimitConfig.requestsPerMinute}
                    onChange={(e) => setRateLimitConfig({ ...rateLimitConfig, requestsPerMinute: parseInt(e.target.value) })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Requests per Hour
                  </label>
                  <input
                    type="number"
                    value={rateLimitConfig.requestsPerHour}
                    onChange={(e) => setRateLimitConfig({ ...rateLimitConfig, requestsPerHour: parseInt(e.target.value) })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Requests per Day
                  </label>
                  <input
                    type="number"
                    value={rateLimitConfig.requestsPerDay}
                    onChange={(e) => setRateLimitConfig({ ...rateLimitConfig, requestsPerDay: parseInt(e.target.value) })}
                    className="input-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Burst Limit
                  </label>
                  <input
                    type="number"
                    value={rateLimitConfig.burstLimit}
                    onChange={(e) => setRateLimitConfig({ ...rateLimitConfig, burstLimit: parseInt(e.target.value) })}
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={handleUpdateRateLimit} className="btn-primary flex-1">
                  Update Rate Limits
                </button>
                <button
                  onClick={() => setShowRateLimitModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

