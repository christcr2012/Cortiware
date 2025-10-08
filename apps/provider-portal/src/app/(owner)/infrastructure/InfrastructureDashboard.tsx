'use client';

/**
 * Infrastructure Dashboard Client Component
 * 
 * Displays usage metrics, trends, and recommendations
 */

import { useState } from 'react';
import type { InfrastructureMetric, UpgradeRecommendation, InfrastructureLimit } from '@prisma/client';

interface Props {
  usageSummary: Record<string, { current: number; limit: number; percent: number }>;
  recentMetrics: InfrastructureMetric[];
  recommendations: UpgradeRecommendation[];
  limits: InfrastructureLimit[];
}

export function InfrastructureDashboard({ usageSummary, recentMetrics, recommendations, limits }: Props) {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Group metrics by service
  const serviceMetrics = Object.entries(usageSummary).reduce((acc, [key, value]) => {
    const [service] = key.split('_');
    if (!acc[service]) acc[service] = [];
    acc[service].push({ key, ...value });
    return acc;
  }, {} as Record<string, Array<{ key: string; current: number; limit: number; percent: number }>>);

  return (
    <div className="space-y-8">
      {/* Usage Summary Cards */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Current Usage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(serviceMetrics).map(([service, metrics]) => (
            <ServiceCard
              key={service}
              service={service}
              metrics={metrics}
              onClick={() => setSelectedService(service)}
            />
          ))}
        </div>
      </div>

      {/* Active Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Upgrade Recommendations</h2>
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Service Limits */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Service Limits</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metric
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Limit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Warning
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {limits.map((limit) => (
                <tr key={limit.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatServiceName(limit.service)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatMetricName(limit.metric)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {limit.currentPlan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatValue(limit.limitValue, limit.metric)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {limit.warningPercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ service, metrics, onClick }: {
  service: string;
  metrics: Array<{ key: string; current: number; limit: number; percent: number }>;
  onClick: () => void;
}) {
  const maxPercent = Math.max(...metrics.map(m => m.percent));
  const status = maxPercent >= 90 ? 'critical' : maxPercent >= 75 ? 'warning' : 'ok';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow ${
        status === 'critical' ? 'border-l-4 border-red-500' :
        status === 'warning' ? 'border-l-4 border-yellow-500' :
        'border-l-4 border-green-500'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{formatServiceName(service)}</h3>
        <StatusBadge status={status} />
      </div>
      <div className="space-y-2">
        {metrics.map((metric) => (
          <div key={metric.key}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{formatMetricName(metric.key.split('_').slice(1).join('_'))}</span>
              <span className="font-medium">{metric.percent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  metric.percent >= 90 ? 'bg-red-500' :
                  metric.percent >= 75 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(metric.percent, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formatValue(metric.current, metric.key.split('_').slice(1).join('_'))}</span>
              <span>of {formatValue(metric.limit, metric.key.split('_').slice(1).join('_'))}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: UpgradeRecommendation }) {
  const priorityColors = {
    CRITICAL: 'bg-red-100 text-red-800 border-red-200',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    LOW: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${priorityColors[recommendation.priority]}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">{formatServiceName(recommendation.service)}</h3>
            <span className={`px-2 py-1 text-xs font-semibold rounded ${priorityColors[recommendation.priority]}`}>
              {recommendation.priority}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {recommendation.currentPlan} → {recommendation.recommendedPlan}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{recommendation.usagePercent.toFixed(1)}%</div>
          <div className="text-xs text-gray-500">of limit</div>
        </div>
      </div>

      <p className="text-gray-700 mb-4">{recommendation.reason}</p>

      {recommendation.roi !== null && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded">
          <div>
            <div className="text-xs text-gray-500">Current Cost</div>
            <div className="text-lg font-semibold">${recommendation.currentCost?.toString() || '0'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Upgrade Cost</div>
            <div className="text-lg font-semibold">${recommendation.upgradeCost?.toString() || '0'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Revenue Impact</div>
            <div className="text-lg font-semibold text-green-600">${recommendation.revenueImpact?.toString() || '0'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">ROI</div>
            <div className="text-lg font-semibold text-green-600">{recommendation.roi.toFixed(0)}%</div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <a
          href="https://vercel.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Upgrade on Vercel
        </a>
        <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm font-medium">
          Dismiss
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: 'ok' | 'warning' | 'critical' }) {
  const colors = {
    ok: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800',
  };

  const labels = {
    ok: 'Healthy',
    warning: 'Warning',
    critical: 'Critical',
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded ${colors[status]}`}>
      {labels[status]}
    </span>
  );
}

function formatServiceName(service: string): string {
  return service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatMetricName(metric: string): string {
  return metric.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatValue(value: number, metric: string): string {
  if (metric.includes('MB')) return `${value.toFixed(1)} MB`;
  if (metric.includes('GB')) return `${value.toFixed(2)} GB`;
  if (metric.includes('MINUTES')) return `${value.toFixed(0)} min`;
  if (metric.includes('PERCENT')) return `${value.toFixed(1)}%`;
  if (metric.includes('MS')) return `${value.toFixed(0)} ms`;
  return value.toFixed(0);
}

