'use client';

/**
 * Tenant Provisioning Client Component
 * 
 * Interactive UI for managing tenant provisioning workflows
 */

import { useState } from 'react';
import type {
  ProvisioningTemplate,
  ProvisioningWorkflow,
} from '@/services/provider/provisioning.service';

type Props = {
  initialTemplates: ProvisioningTemplate[];
  initialWorkflows: ProvisioningWorkflow[];
  initialStats: {
    total: number;
    completed: number;
    inProgress: number;
    awaitingApproval: number;
    failed: number;
    successRate: number;
    avgCompletionTimeMinutes: number;
  };
};

export default function ProvisioningClient({ initialTemplates, initialWorkflows, initialStats }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'workflows' | 'templates'>('overview');
  const [templates] = useState(initialTemplates);
  const [workflows] = useState(initialWorkflows);
  const [stats] = useState(initialStats);
  const [selectedTemplate, setSelectedTemplate] = useState<ProvisioningTemplate | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<ProvisioningWorkflow | null>(null);
  const [showNewWorkflow, setShowNewWorkflow] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredWorkflows = workflows.filter(w => {
    if (filterStatus === 'all') return true;
    return w.status === filterStatus;
  });

  const getStatusColor = (status: ProvisioningWorkflow['status']) => {
    switch (status) {
      case 'completed':
        return { bg: 'rgba(34, 197, 94, 0.1)', text: 'rgb(34, 197, 94)' };
      case 'in_progress':
        return { bg: 'rgba(59, 130, 246, 0.1)', text: 'rgb(59, 130, 246)' };
      case 'awaiting_approval':
        return { bg: 'rgba(251, 191, 36, 0.1)', text: 'rgb(251, 191, 36)' };
      case 'pending':
        return { bg: 'rgba(156, 163, 175, 0.1)', text: 'rgb(156, 163, 175)' };
      case 'failed':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: 'rgb(239, 68, 68)' };
    }
  };

  const getStepTypeIcon = (type: string) => {
    switch (type) {
      case 'create_database': return '🗄️';
      case 'allocate_resources': return '⚙️';
      case 'send_notification': return '📧';
      case 'create_user': return '👤';
      case 'assign_plan': return '📋';
      case 'custom': return '🔧';
      default: return '📌';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Tenant Provisioning
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
          Automated workflows for tenant onboarding and resource allocation
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Workflows</div>
          <div className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{stats.total}</div>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Success Rate</div>
          <div className="text-2xl font-bold mt-1" style={{ color: 'rgb(34, 197, 94)' }}>
            {stats.successRate.toFixed(1)}%
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Awaiting Approval</div>
          <div className="text-2xl font-bold mt-1" style={{ color: 'rgb(251, 191, 36)' }}>
            {stats.awaitingApproval}
          </div>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Avg. Completion</div>
          <div className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
            {stats.avgCompletionTimeMinutes}m
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <button
          onClick={() => setActiveTab('overview')}
          className="px-4 py-2 font-medium transition-colors"
          style={{
            color: activeTab === 'overview' ? 'var(--brand-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'overview' ? '2px solid var(--brand-primary)' : 'none',
          }}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('workflows')}
          className="px-4 py-2 font-medium transition-colors"
          style={{
            color: activeTab === 'workflows' ? 'var(--brand-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'workflows' ? '2px solid var(--brand-primary)' : 'none',
          }}
        >
          Active Workflows ({workflows.length})
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className="px-4 py-2 font-medium transition-colors"
          style={{
            color: activeTab === 'templates' ? 'var(--brand-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'templates' ? '2px solid var(--brand-primary)' : 'none',
          }}
        >
          Templates ({templates.length})
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Status Distribution */}
          <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Workflow Status Distribution
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: 'rgb(34, 197, 94)' }}>{stats.completed}</div>
                <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: 'rgb(59, 130, 246)' }}>{stats.inProgress}</div>
                <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: 'rgb(251, 191, 36)' }}>{stats.awaitingApproval}</div>
                <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Awaiting Approval</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: 'rgb(156, 163, 175)' }}>
                  {workflows.filter(w => w.status === 'pending').length}
                </div>
                <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Pending</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold" style={{ color: 'rgb(239, 68, 68)' }}>{stats.failed}</div>
                <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Failed</div>
              </div>
            </div>
          </div>

          {/* Recent Workflows */}
          <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Recent Workflows
            </h3>
            <div className="space-y-3">
              {workflows.slice(0, 5).map(workflow => {
                const statusColor = getStatusColor(workflow.status);
                return (
                  <div
                    key={workflow.id}
                    className="p-4 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ background: 'var(--surface-3)', border: '1px solid var(--border-primary)' }}
                    onClick={() => setSelectedWorkflow(workflow)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {workflow.tenantName}
                        </div>
                        <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                          {workflow.templateName}
                        </div>
                      </div>
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ background: statusColor.bg, color: statusColor.text }}
                      >
                        {workflow.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                        <span>Progress</span>
                        <span>{workflow.currentStep}/{workflow.totalSteps} steps</span>
                      </div>
                      <div className="w-full h-2 rounded-full" style={{ background: 'var(--surface-2)' }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(workflow.currentStep / workflow.totalSteps) * 100}%`,
                            background: statusColor.text,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setShowNewWorkflow(true)}
                className="p-4 rounded-lg text-left hover:opacity-80 transition-opacity"
                style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgb(59, 130, 246)' }}
              >
                <div className="text-2xl mb-2">🚀</div>
                <div className="font-medium" style={{ color: 'rgb(59, 130, 246)' }}>
                  Start New Workflow
                </div>
                <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Provision a new tenant
                </div>
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className="p-4 rounded-lg text-left hover:opacity-80 transition-opacity"
                style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgb(168, 85, 247)' }}
              >
                <div className="text-2xl mb-2">📋</div>
                <div className="font-medium" style={{ color: 'rgb(168, 85, 247)' }}>
                  Manage Templates
                </div>
                <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Create or edit templates
                </div>
              </button>
              <button
                onClick={() => { setActiveTab('workflows'); setFilterStatus('awaiting_approval'); }}
                className="p-4 rounded-lg text-left hover:opacity-80 transition-opacity"
                style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgb(251, 191, 36)' }}
              >
                <div className="text-2xl mb-2">✅</div>
                <div className="font-medium" style={{ color: 'rgb(251, 191, 36)' }}>
                  Review Approvals
                </div>
                <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {stats.awaitingApproval} pending
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workflows Tab */}
      {activeTab === 'workflows' && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex justify-between items-center">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="awaiting_approval">Awaiting Approval</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
            <button
              onClick={() => setShowNewWorkflow(true)}
              className="px-4 py-2 rounded font-medium"
              style={{ background: 'var(--brand-primary)', color: 'white' }}
            >
              New Workflow
            </button>
          </div>

          {/* Workflows List */}
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
            {filteredWorkflows.length === 0 ? (
              <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
                No workflows found
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                    <th className="px-4 py-3 text-left" style={{ color: 'var(--text-primary)' }}>Tenant</th>
                    <th className="px-4 py-3 text-left" style={{ color: 'var(--text-primary)' }}>Template</th>
                    <th className="px-4 py-3 text-left" style={{ color: 'var(--text-primary)' }}>Status</th>
                    <th className="px-4 py-3 text-left" style={{ color: 'var(--text-primary)' }}>Progress</th>
                    <th className="px-4 py-3 text-left" style={{ color: 'var(--text-primary)' }}>Started</th>
                    <th className="px-4 py-3 text-right" style={{ color: 'var(--text-primary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWorkflows.map(workflow => {
                    const statusColor = getStatusColor(workflow.status);
                    return (
                      <tr key={workflow.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                        <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                          {workflow.tenantName}
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                          {workflow.templateName}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{ background: statusColor.bg, color: statusColor.text }}
                          >
                            {workflow.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 rounded-full" style={{ background: 'var(--surface-2)' }}>
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${(workflow.currentStep / workflow.totalSteps) * 100}%`,
                                  background: statusColor.text,
                                }}
                              />
                            </div>
                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              {workflow.currentStep}/{workflow.totalSteps}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {workflow.startedAt.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setSelectedWorkflow(workflow)}
                            className="px-3 py-1 rounded text-sm font-medium"
                            style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'rgb(59, 130, 246)' }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Provisioning Templates
            </h3>
            <button
              className="px-4 py-2 rounded font-medium"
              style={{ background: 'var(--brand-primary)', color: 'white' }}
            >
              Create Template
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map(template => (
              <div
                key={template.id}
                className="rounded-xl p-6 cursor-pointer hover:opacity-80 transition-opacity"
                style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}
                onClick={() => setSelectedTemplate(template)}
              >
                <h4 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {template.name}
                </h4>
                <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                  {template.description}
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>Steps:</span>
                    <span style={{ color: 'var(--text-primary)' }}>{template.steps.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-secondary)' }}>Approvals:</span>
                    <span style={{ color: 'var(--text-primary)' }}>
                      {template.steps.filter(s => s.requiresApproval).length}
                    </span>
                  </div>
                  {template.defaultResources && (
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--text-secondary)' }}>Resources:</span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {template.defaultResources.cpu}CPU / {template.defaultResources.memory}MB
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {template.steps.slice(0, 3).map(step => (
                    <span
                      key={step.id}
                      className="px-2 py-1 rounded text-xs"
                      style={{ background: 'var(--surface-3)', color: 'var(--text-secondary)' }}
                    >
                      {getStepTypeIcon(step.type)} {step.name}
                    </span>
                  ))}
                  {template.steps.length > 3 && (
                    <span
                      className="px-2 py-1 rounded text-xs"
                      style={{ background: 'var(--surface-3)', color: 'var(--text-secondary)' }}
                    >
                      +{template.steps.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workflow Details Modal */}
      {selectedWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-main)', border: '1px solid var(--border-accent)' }}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Workflow Details
                </h3>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {selectedWorkflow.tenantName}
                </p>
              </div>
              <button
                onClick={() => setSelectedWorkflow(null)}
                className="text-2xl"
                style={{ color: 'var(--text-secondary)' }}
              >
                ×
              </button>
            </div>

            {/* Workflow Info */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Template</div>
                  <div className="font-medium mt-1" style={{ color: 'var(--text-primary)' }}>
                    {selectedWorkflow.templateName}
                  </div>
                </div>
                <div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Status</div>
                  <span
                    className="inline-block px-2 py-1 rounded text-xs font-medium mt-1"
                    style={{
                      background: getStatusColor(selectedWorkflow.status).bg,
                      color: getStatusColor(selectedWorkflow.status).text,
                    }}
                  >
                    {selectedWorkflow.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Started</div>
                  <div className="font-medium mt-1" style={{ color: 'var(--text-primary)' }}>
                    {selectedWorkflow.startedAt.toLocaleString()}
                  </div>
                </div>
                {selectedWorkflow.completedAt && (
                  <div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Completed</div>
                    <div className="font-medium mt-1" style={{ color: 'var(--text-primary)' }}>
                      {selectedWorkflow.completedAt.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {selectedWorkflow.error && (
                <div className="p-4 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgb(239, 68, 68)' }}>
                  <div className="font-medium" style={{ color: 'rgb(239, 68, 68)' }}>Error</div>
                  <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {selectedWorkflow.error}
                  </div>
                </div>
              )}
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                <span>Progress</span>
                <span>{selectedWorkflow.currentStep}/{selectedWorkflow.totalSteps} steps completed</span>
              </div>
              <div className="w-full h-3 rounded-full" style={{ background: 'var(--surface-2)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(selectedWorkflow.currentStep / selectedWorkflow.totalSteps) * 100}%`,
                    background: getStatusColor(selectedWorkflow.status).text,
                  }}
                />
              </div>
            </div>

            {/* Approvals */}
            {selectedWorkflow.approvals.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Pending Approvals
                </h4>
                <div className="space-y-2">
                  {selectedWorkflow.approvals.map(approval => (
                    <div
                      key={approval.stepId}
                      className="p-3 rounded-lg flex justify-between items-center"
                      style={{ background: 'var(--surface-3)', border: '1px solid var(--border-primary)' }}
                    >
                      <div>
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          Step {approval.stepId}
                        </div>
                        {approval.approvedBy && (
                          <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                            Approved by {approval.approvedBy} on {approval.approvedAt?.toLocaleString()}
                          </div>
                        )}
                      </div>
                      {approval.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 rounded text-sm font-medium"
                            style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'rgb(34, 197, 94)' }}
                          >
                            Approve
                          </button>
                          <button
                            className="px-3 py-1 rounded text-sm font-medium"
                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'rgb(239, 68, 68)' }}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedWorkflow(null)}
              className="w-full px-4 py-2 rounded font-medium"
              style={{ background: 'var(--surface-3)', color: 'var(--text-primary)' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Template Details Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-main)', border: '1px solid var(--border-accent)' }}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {selectedTemplate.name}
                </h3>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {selectedTemplate.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-2xl"
                style={{ color: 'var(--text-secondary)' }}
              >
                ×
              </button>
            </div>

            {/* Template Info */}
            {selectedTemplate.defaultResources && (
              <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--surface-3)' }}>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Default Resources
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>CPU</div>
                    <div className="font-medium mt-1" style={{ color: 'var(--text-primary)' }}>
                      {selectedTemplate.defaultResources.cpu} cores
                    </div>
                  </div>
                  <div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Memory</div>
                    <div className="font-medium mt-1" style={{ color: 'var(--text-primary)' }}>
                      {selectedTemplate.defaultResources.memory} MB
                    </div>
                  </div>
                  <div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Storage</div>
                    <div className="font-medium mt-1" style={{ color: 'var(--text-primary)' }}>
                      {selectedTemplate.defaultResources.storage} MB
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Workflow Steps */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Workflow Steps ({selectedTemplate.steps.length})
              </h4>
              <div className="space-y-3">
                {selectedTemplate.steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className="p-4 rounded-lg"
                    style={{ background: 'var(--surface-3)', border: '1px solid var(--border-primary)' }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{getStepTypeIcon(step.type)}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                              {idx + 1}. {step.name}
                            </div>
                            <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                              Type: {step.type.replace('_', ' ')}
                            </div>
                          </div>
                          {step.requiresApproval && (
                            <span
                              className="px-2 py-1 rounded text-xs font-medium"
                              style={{ background: 'rgba(251, 191, 36, 0.1)', color: 'rgb(251, 191, 36)' }}
                            >
                              Requires Approval
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowNewWorkflow(true)}
                className="flex-1 px-4 py-2 rounded font-medium"
                style={{ background: 'var(--brand-primary)', color: 'white' }}
              >
                Use This Template
              </button>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="flex-1 px-4 py-2 rounded font-medium"
                style={{ background: 'var(--surface-3)', color: 'var(--text-primary)' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Workflow Modal */}
      {showNewWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-xl p-6 max-w-md w-full" style={{ background: 'var(--bg-main)', border: '1px solid var(--border-accent)' }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Start New Workflow
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              This feature will be available in the next update. You&apos;ll be able to select a template and tenant to start automated provisioning.
            </p>
            <button
              onClick={() => setShowNewWorkflow(false)}
              className="w-full px-4 py-2 rounded font-medium"
              style={{ background: 'var(--surface-3)', color: 'var(--text-primary)' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

