'use client';

import { useState } from 'react';
import type { TenantHealthScore } from '@/services/provider/tenant-health.service';

interface Props {
  initialHealthScores: TenantHealthScore[];
}

export default function TenantHealthClient({ initialHealthScores }: Props) {
  const [healthScores, setHealthScores] = useState(initialHealthScores);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'name' | 'risk'>('score');
  const [selectedTenant, setSelectedTenant] = useState<TenantHealthScore | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter and sort
  let filteredScores = healthScores.filter(score => {
    const matchesSearch = score.tenantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'all' || score.churnRisk === riskFilter;
    const matchesStage = stageFilter === 'all' || score.lifecycleStage === stageFilter;
    return matchesSearch && matchesRisk && matchesStage;
  });

  if (sortBy === 'score') {
    filteredScores = filteredScores.sort((a, b) => a.overallScore - b.overallScore);
  } else if (sortBy === 'name') {
    filteredScores = filteredScores.sort((a, b) => a.tenantName.localeCompare(b.tenantName));
  } else if (sortBy === 'risk') {
    const riskOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
    filteredScores = filteredScores.sort((a, b) => riskOrder[a.churnRisk] - riskOrder[b.churnRisk]);
  }

  // Calculate summary stats
  const totalTenants = healthScores.length;
  const avgScore = healthScores.length > 0
    ? Math.round(healthScores.reduce((sum, s) => sum + s.overallScore, 0) / healthScores.length)
    : 0;
  const atRiskCount = healthScores.filter(s => s.churnRisk === 'High' || s.churnRisk === 'Critical').length;
  const excellentCount = healthScores.filter(s => s.healthGrade === 'Excellent').length;

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    if (score >= 20) return '#ef4444';
    return '#991b1b';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return '#10b981';
      case 'Medium': return '#f59e0b';
      case 'High': return '#ef4444';
      case 'Critical': return '#991b1b';
      default: return '#6b7280';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Onboarding': return '#3b82f6';
      case 'Active': return '#10b981';
      case 'At-Risk': return '#f59e0b';
      case 'Churned': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="text-responsive-sm" style={{ color: 'var(--text-secondary)' }}>Total Tenants</div>
          <div className="text-responsive-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
            {totalTenants}
          </div>
        </div>

        <div className="kpi-card">
          <div className="text-responsive-sm" style={{ color: 'var(--text-secondary)' }}>Average Health Score</div>
          <div className="text-responsive-3xl font-bold mt-1" style={{ color: getScoreColor(avgScore) }}>
            {avgScore}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Out of 100
          </div>
        </div>

        <div className="kpi-card">
          <div className="text-responsive-sm" style={{ color: 'var(--text-secondary)' }}>At-Risk Tenants</div>
          <div className="text-responsive-3xl font-bold mt-1" style={{ color: atRiskCount > 0 ? '#ef4444' : '#10b981' }}>
            {atRiskCount}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            {((atRiskCount / totalTenants) * 100).toFixed(1)}% of total
          </div>
        </div>

        <div className="kpi-card">
          <div className="text-responsive-sm" style={{ color: 'var(--text-secondary)' }}>Excellent Health</div>
          <div className="text-responsive-3xl font-bold mt-1" style={{ color: '#10b981' }}>
            {excellentCount}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
            {((excellentCount / totalTenants) * 100).toFixed(1)}% of total
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="glass-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tenant name..."
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Churn Risk</label>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="input-field w-full"
            >
              <option value="all">All Risks</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Lifecycle Stage</label>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="input-field w-full"
            >
              <option value="all">All Stages</option>
              <option value="Onboarding">Onboarding</option>
              <option value="Active">Active</option>
              <option value="At-Risk">At-Risk</option>
              <option value="Churned">Churned</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="input-field w-full"
            >
              <option value="score">Health Score</option>
              <option value="name">Name</option>
              <option value="risk">Churn Risk</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded font-medium ${viewMode === 'grid' ? 'btn-primary' : ''}`}
              style={viewMode !== 'grid' ? { background: 'var(--surface-3)', color: 'var(--text-primary)' } : {}}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded font-medium ${viewMode === 'list' ? 'btn-primary' : ''}`}
              style={viewMode !== 'list' ? { background: 'var(--surface-3)', color: 'var(--text-primary)' } : {}}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Tenant Cards/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScores.length === 0 ? (
            <div className="col-span-full text-center py-12" style={{ color: 'var(--text-tertiary)' }}>
              No tenants found matching filters
            </div>
          ) : (
            filteredScores.map((score) => (
              <div
                key={score.tenantId}
                className="premium-card cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedTenant(score)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                      {score.tenantName}
                    </h3>
                    <span
                      className="text-xs px-2 py-1 rounded mt-1 inline-block"
                      style={{ background: `${getStageColor(score.lifecycleStage)}20`, color: getStageColor(score.lifecycleStage) }}
                    >
                      {score.lifecycleStage}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold" style={{ color: getScoreColor(score.overallScore) }}>
                      {score.overallScore}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {score.healthGrade}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>Churn Risk</span>
                    <span className="font-medium" style={{ color: getRiskColor(score.churnRisk) }}>
                      {score.churnRisk}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>Active Users</span>
                    <span style={{ color: 'var(--text-primary)' }}>
                      {score.userEngagement.activeUsers}/{score.userEngagement.totalUsers}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>Feature Adoption</span>
                    <span style={{ color: 'var(--text-primary)' }}>
                      {score.featureAdoption.adoptionRate.toFixed(0)}%
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>MRR</span>
                    <span style={{ color: 'var(--text-primary)' }}>
                      ${(score.billingHealth.mrr / 100).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    Last updated: {new Date(score.lastUpdated).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Tenant</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Score</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Grade</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Risk</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Stage</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Users</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Adoption</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredScores.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center" style={{ color: 'var(--text-tertiary)' }}>
                      No tenants found matching filters
                    </td>
                  </tr>
                ) : (
                  filteredScores.map((score) => (
                    <tr key={score.tenantId} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                      <td className="p-4">
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{score.tenantName}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-2xl font-bold" style={{ color: getScoreColor(score.overallScore) }}>
                          {score.overallScore}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{score.healthGrade}</span>
                      </td>
                      <td className="p-4">
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{ background: `${getRiskColor(score.churnRisk)}20`, color: getRiskColor(score.churnRisk) }}
                        >
                          {score.churnRisk}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{ background: `${getStageColor(score.lifecycleStage)}20`, color: getStageColor(score.lifecycleStage) }}
                        >
                          {score.lifecycleStage}
                        </span>
                      </td>
                      <td className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {score.userEngagement.activeUsers}/{score.userEngagement.totalUsers}
                      </td>
                      <td className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {score.featureAdoption.adoptionRate.toFixed(0)}%
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => setSelectedTenant(score)}
                          className="text-xs px-3 py-1 rounded"
                          style={{ background: 'var(--brand-primary)', color: 'var(--bg-main)' }}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tenant Details Modal */}
      {selectedTenant && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedTenant(null)}
        >
          <div
            className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {selectedTenant.tenantName}
                  </h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Comprehensive Health Analysis
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTenant(null)}
                  className="text-2xl"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  ×
                </button>
              </div>

              {/* Overall Score */}
              <div className="mb-6 p-6 rounded-lg" style={{ background: 'var(--surface-2)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Overall Health Score</div>
                    <div className="text-5xl font-bold mt-2" style={{ color: getScoreColor(selectedTenant.overallScore) }}>
                      {selectedTenant.overallScore}
                    </div>
                    <div className="text-lg mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {selectedTenant.healthGrade}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Churn Risk</div>
                    <span
                      className="px-4 py-2 rounded text-lg font-bold"
                      style={{ background: `${getRiskColor(selectedTenant.churnRisk)}20`, color: getRiskColor(selectedTenant.churnRisk) }}
                    >
                      {selectedTenant.churnRisk}
                    </span>
                    <div className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                      Stage: {selectedTenant.lifecycleStage}
                    </div>
                  </div>
                </div>
              </div>

              {/* Component Scores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* User Engagement */}
                <div className="p-4 rounded-lg" style={{ background: 'var(--surface-2)' }}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>User Engagement</h3>
                    <span className="text-2xl font-bold" style={{ color: getScoreColor(selectedTenant.userEngagement.score) }}>
                      {Math.round(selectedTenant.userEngagement.score)}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>Active Users</span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {selectedTenant.userEngagement.activeUsers}/{selectedTenant.userEngagement.totalUsers}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>Growth Rate</span>
                      <span style={{ color: selectedTenant.userEngagement.growthRate >= 0 ? '#10b981' : '#ef4444' }}>
                        {selectedTenant.userEngagement.growthRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>Last Login</span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {selectedTenant.userEngagement.lastLoginDays} days ago
                      </span>
                    </div>
                  </div>
                </div>

                {/* Feature Adoption */}
                <div className="p-4 rounded-lg" style={{ background: 'var(--surface-2)' }}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Feature Adoption</h3>
                    <span className="text-2xl font-bold" style={{ color: getScoreColor(selectedTenant.featureAdoption.score) }}>
                      {Math.round(selectedTenant.featureAdoption.score)}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>Features Used</span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {selectedTenant.featureAdoption.featuresUsed}/{selectedTenant.featureAdoption.totalFeatures}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>Adoption Rate</span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {selectedTenant.featureAdoption.adoptionRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full mt-2" style={{ background: 'var(--surface-3)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${selectedTenant.featureAdoption.adoptionRate}%`,
                          background: 'var(--brand-primary)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Billing Health */}
                <div className="p-4 rounded-lg" style={{ background: 'var(--surface-2)' }}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Billing Health</h3>
                    <span className="text-2xl font-bold" style={{ color: getScoreColor(selectedTenant.billingHealth.score) }}>
                      {Math.round(selectedTenant.billingHealth.score)}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                      <span style={{ color: selectedTenant.billingHealth.status === 'Current' ? '#10b981' : '#ef4444' }}>
                        {selectedTenant.billingHealth.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>MRR</span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        ${(selectedTenant.billingHealth.mrr / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>Days Past Due</span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {selectedTenant.billingHealth.daysPastDue}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Support Metrics */}
                <div className="p-4 rounded-lg" style={{ background: 'var(--surface-2)' }}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Support Metrics</h3>
                    <span className="text-2xl font-bold" style={{ color: getScoreColor(selectedTenant.supportMetrics.score) }}>
                      {Math.round(selectedTenant.supportMetrics.score)}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>Open Tickets</span>
                      <span style={{ color: selectedTenant.supportMetrics.openTickets > 0 ? '#f59e0b' : '#10b981' }}>
                        {selectedTenant.supportMetrics.openTickets}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>Avg Resolution</span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {selectedTenant.supportMetrics.avgResolutionDays.toFixed(1)} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>Satisfaction</span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {selectedTenant.supportMetrics.satisfactionScore.toFixed(1)}/5.0
                      </span>
                    </div>
                  </div>
                </div>

                {/* API Usage */}
                <div className="p-4 rounded-lg col-span-full" style={{ background: 'var(--surface-2)' }}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>API Usage</h3>
                    <span className="text-2xl font-bold" style={{ color: getScoreColor(selectedTenant.apiUsage.score) }}>
                      {Math.round(selectedTenant.apiUsage.score)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div style={{ color: 'var(--text-secondary)' }}>Requests (30d)</div>
                      <div className="text-lg font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                        {selectedTenant.apiUsage.requestsLast30Days.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-secondary)' }}>Error Rate</div>
                      <div className="text-lg font-bold mt-1" style={{ color: selectedTenant.apiUsage.errorRate > 2 ? '#ef4444' : '#10b981' }}>
                        {selectedTenant.apiUsage.errorRate.toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-secondary)' }}>Trend</div>
                      <div className="text-lg font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                        {selectedTenant.apiUsage.trend}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  className="btn-primary flex-1"
                  onClick={() => {
                    // In production, navigate to tenant management
                    alert(`Navigate to tenant management for ${selectedTenant.tenantName}`);
                  }}
                >
                  Manage Tenant
                </button>
                <button
                  className="px-4 py-2 rounded font-medium"
                  style={{ background: 'var(--surface-3)', color: 'var(--text-primary)' }}
                  onClick={() => {
                    // In production, send alert/notification
                    alert(`Alert sent for ${selectedTenant.tenantName}`);
                  }}
                >
                  Send Alert
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

