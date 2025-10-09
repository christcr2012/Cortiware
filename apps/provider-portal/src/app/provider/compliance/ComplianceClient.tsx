'use client';

import { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Lock,
  FileText,
  Users,
  Download,
  Calendar,
  Activity,
  Database,
  Key,
  Search,
} from 'lucide-react';
import type {
  SecurityMetrics,
  ComplianceStatus,
  DataRetentionPolicy,
  EncryptionStatus,
  VulnerabilityScan,
  AccessControlReview,
} from '@/services/provider/compliance.service';

interface ComplianceClientProps {
  initialMetrics: SecurityMetrics;
  initialCompliance: ComplianceStatus[];
  initialRetention: DataRetentionPolicy[];
  initialEncryption: EncryptionStatus[];
  initialVulnerabilities: VulnerabilityScan[];
  initialAccess: AccessControlReview[];
}

export default function ComplianceClient({
  initialMetrics,
  initialCompliance,
  initialRetention,
  initialEncryption,
  initialVulnerabilities,
  initialAccess,
}: ComplianceClientProps) {
  const [metrics] = useState<SecurityMetrics>(initialMetrics);
  const [compliance] = useState<ComplianceStatus[]>(initialCompliance);
  const [retention] = useState<DataRetentionPolicy[]>(initialRetention);
  const [encryption] = useState<EncryptionStatus[]>(initialEncryption);
  const [vulnerabilities] = useState<VulnerabilityScan[]>(initialVulnerabilities);
  const [access] = useState<AccessControlReview[]>(initialAccess);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'compliance' | 'audit' | 'access' | 'data' | 'encryption' | 'vulnerabilities'
  >('overview');
  const [exportingReport, setExportingReport] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Export compliance report
  const handleExportReport = async () => {
    setExportingReport(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 90); // Last 90 days

      const response = await fetch('/api/provider/compliance/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Report generated: ${data.data.reportId}\nCompliance Score: ${data.data.summary.complianceScore}%`);
      } else {
        alert('Failed to generate report');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export report');
    } finally {
      setExportingReport(false);
    }
  };

  // Get compliance status color
  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'var(--success)';
      case 'partial':
        return 'var(--warning)';
      case 'non-compliant':
        return 'var(--error)';
      default:
        return 'var(--text-secondary)';
    }
  };

  // Get risk level color
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'var(--success)';
      case 'medium':
        return 'var(--warning)';
      case 'high':
        return 'var(--error)';
      default:
        return 'var(--text-secondary)';
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#dc2626';
      case 'high':
        return '#ea580c';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return 'var(--text-secondary)';
    }
  };

  // Filter access control by search
  const filteredAccess = access.filter(
    (item) =>
      item.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Compliance & Security Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Monitor security metrics, compliance status, and audit logs
          </p>
        </div>
        <button
          onClick={handleExportReport}
          disabled={exportingReport}
          className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          style={{
            background: exportingReport ? 'var(--surface-2)' : 'var(--brand-primary)',
            color: exportingReport ? 'var(--text-secondary)' : 'white',
            cursor: exportingReport ? 'not-allowed' : 'pointer',
          }}
        >
          <Download className="w-4 h-4" />
          {exportingReport ? 'Generating...' : 'Export Report'}
        </button>
      </div>

      {/* Security Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          className="p-6 rounded-lg"
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-primary)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-lg"
                style={{ background: 'var(--surface-2)' }}
              >
                <Activity className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Total Audit Events
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {metrics.totalAuditEvents.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {metrics.recentEvents24h} events in last 24h
          </div>
        </div>

        <div
          className="p-6 rounded-lg"
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-primary)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-lg"
                style={{ background: 'var(--surface-2)' }}
              >
                <AlertTriangle className="w-6 h-6" style={{ color: 'var(--warning)' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Suspicious Activity
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {metrics.suspiciousActivity}
                </p>
              </div>
            </div>
          </div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {metrics.failedLogins} failed logins
          </div>
        </div>

        <div
          className="p-6 rounded-lg"
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-primary)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-lg"
                style={{ background: 'var(--surface-2)' }}
              >
                <Database className="w-6 h-6" style={{ color: 'var(--success)' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Data Access Events
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {metrics.dataAccessEvents}
                </p>
              </div>
            </div>
          </div>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {metrics.configChanges} config changes
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-2 p-1 rounded-lg overflow-x-auto"
        style={{ background: 'var(--surface-2)' }}
      >
        {[
          { id: 'overview', label: 'Overview', icon: Shield },
          { id: 'compliance', label: 'Compliance', icon: CheckCircle },
          { id: 'audit', label: 'Audit Logs', icon: FileText },
          { id: 'access', label: 'Access Control', icon: Users },
          { id: 'data', label: 'Data Retention', icon: Clock },
          { id: 'encryption', label: 'Encryption', icon: Lock },
          { id: 'vulnerabilities', label: 'Vulnerabilities', icon: AlertTriangle },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
              style={{
                background: activeTab === tab.id ? 'var(--surface-1)' : 'transparent',
                color: activeTab === tab.id ? 'var(--brand-primary)' : 'var(--text-secondary)',
              }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Compliance Status Overview */}
            <div
              className="p-6 rounded-lg"
              style={{
                background: 'var(--surface-1)',
                border: '1px solid var(--border-primary)',
              }}
            >
              <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Compliance Status
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {compliance.map((item) => (
                  <div
                    key={item.framework}
                    className="p-4 rounded-lg"
                    style={{
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border-primary)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {item.framework}
                      </span>
                      {item.status === 'compliant' && (
                        <CheckCircle className="w-5 h-5" style={{ color: 'var(--success)' }} />
                      )}
                      {item.status === 'partial' && (
                        <Clock className="w-5 h-5" style={{ color: 'var(--warning)' }} />
                      )}
                      {item.status === 'non-compliant' && (
                        <XCircle className="w-5 h-5" style={{ color: 'var(--error)' }} />
                      )}
                    </div>
                    <div
                      className="text-sm capitalize mb-2"
                      style={{ color: getComplianceColor(item.status) }}
                    >
                      {item.status.replace('-', ' ')}
                    </div>
                    <div className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                      <div>{item.findings} findings</div>
                      {item.criticalFindings > 0 && (
                        <div style={{ color: 'var(--error)' }}>
                          {item.criticalFindings} critical
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vulnerability Summary */}
            <div
              className="p-6 rounded-lg"
              style={{
                background: 'var(--surface-1)',
                border: '1px solid var(--border-primary)',
              }}
            >
              <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Vulnerability Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {vulnerabilities.map((scan) => (
                  <div
                    key={scan.id}
                    className="p-4 rounded-lg"
                    style={{
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border-primary)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-xs font-semibold uppercase"
                        style={{ color: getSeverityColor(scan.severity) }}
                      >
                        {scan.severity}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {scan.vulnerabilities} total
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span style={{ color: 'var(--text-secondary)' }}>Resolved:</span>
                        <span style={{ color: 'var(--success)' }}>{scan.resolved}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: 'var(--text-secondary)' }}>Pending:</span>
                        <span style={{ color: 'var(--warning)' }}>{scan.pending}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div
            className="p-6 rounded-lg"
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border-primary)',
            }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Compliance Framework Status
            </h2>
            <div className="space-y-4">
              {compliance.map((item) => (
                <div
                  key={item.framework}
                  className="p-4 rounded-lg"
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {item.status === 'compliant' && (
                        <CheckCircle className="w-6 h-6" style={{ color: 'var(--success)' }} />
                      )}
                      {item.status === 'partial' && (
                        <Clock className="w-6 h-6" style={{ color: 'var(--warning)' }} />
                      )}
                      {item.status === 'non-compliant' && (
                        <XCircle className="w-6 h-6" style={{ color: 'var(--error)' }} />
                      )}
                      <div>
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {item.framework}
                        </h3>
                        <p
                          className="text-sm capitalize"
                          style={{ color: getComplianceColor(item.status) }}
                        >
                          {item.status.replace('-', ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {item.findings} findings
                      </div>
                      {item.criticalFindings > 0 && (
                        <div className="text-sm font-semibold" style={{ color: 'var(--error)' }}>
                          {item.criticalFindings} critical
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Last Audit: </span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {item.lastAudit ? new Date(item.lastAudit).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>Next Audit: </span>
                      <span style={{ color: 'var(--text-primary)' }}>
                        {item.nextAudit ? new Date(item.nextAudit).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div
            className="p-6 rounded-lg"
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border-primary)',
            }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Audit Log Viewer
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                    style={{ color: 'var(--text-secondary)' }}
                  />
                  <input
                    type="text"
                    placeholder="Search audit logs..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg"
                    style={{
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border-primary)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <button
                  className="px-4 py-2 rounded-lg font-medium"
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
              <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Audit log viewer with advanced filtering</p>
                <p className="text-sm mt-2">
                  Connect to existing audit service at /provider/audit
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'access' && (
          <div
            className="p-6 rounded-lg"
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border-primary)',
            }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Access Control Review
            </h2>
            <div className="space-y-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                  style={{ color: 'var(--text-secondary)' }}
                />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg"
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
              <div className="space-y-3">
                {filteredAccess.map((item) => (
                  <div
                    key={item.userId}
                    className="p-4 rounded-lg"
                    style={{
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border-primary)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                          style={{
                            background: 'var(--brand-primary)',
                            color: 'white',
                          }}
                        >
                          {item.userName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {item.userName}
                          </h3>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {item.role}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className="text-sm font-semibold capitalize"
                          style={{ color: getRiskColor(item.riskLevel) }}
                        >
                          {item.riskLevel} Risk
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          Last access:{' '}
                          {item.lastAccess
                            ? new Date(item.lastAccess).toLocaleDateString()
                            : 'Never'}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.permissions.map((perm) => (
                        <span
                          key={perm}
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            background: 'var(--surface-1)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div
            className="p-6 rounded-lg"
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border-primary)',
            }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Data Retention Policies
            </h2>
            <div className="space-y-3">
              {retention.map((policy, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg"
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5" style={{ color: 'var(--brand-primary)' }} />
                      <div>
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {policy.dataType}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {policy.retentionPeriod} days retention
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className="text-sm font-semibold"
                        style={{
                          color: policy.autoDelete ? 'var(--success)' : 'var(--text-secondary)',
                        }}
                      >
                        {policy.autoDelete ? 'Auto-delete enabled' : 'Manual deletion'}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Last review:{' '}
                        {policy.lastReview
                          ? new Date(policy.lastReview).toLocaleDateString()
                          : 'Never'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'encryption' && (
          <div
            className="p-6 rounded-lg"
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border-primary)',
            }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Encryption Status
            </h2>
            <div className="space-y-3">
              {encryption.map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg"
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{
                          background: item.encrypted ? 'var(--success-bg)' : 'var(--error-bg)',
                        }}
                      >
                        {item.encrypted ? (
                          <Lock className="w-5 h-5" style={{ color: 'var(--success)' }} />
                        ) : (
                          <XCircle className="w-5 h-5" style={{ color: 'var(--error)' }} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {item.component}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {item.algorithm}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className="text-sm font-semibold"
                        style={{ color: item.encrypted ? 'var(--success)' : 'var(--error)' }}
                      >
                        {item.encrypted ? 'Encrypted' : 'Not Encrypted'}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Key rotation:{' '}
                        {item.keyRotation
                          ? new Date(item.keyRotation).toLocaleDateString()
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'vulnerabilities' && (
          <div
            className="p-6 rounded-lg"
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border-primary)',
            }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Vulnerability Scan Results
            </h2>
            <div className="space-y-4">
              {vulnerabilities.map((scan) => (
                <div
                  key={scan.id}
                  className="p-4 rounded-lg"
                  style={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{
                          background:
                            scan.severity === 'critical' || scan.severity === 'high'
                              ? 'rgba(220, 38, 38, 0.1)'
                              : 'rgba(16, 185, 129, 0.1)',
                        }}
                      >
                        <AlertTriangle
                          className="w-5 h-5"
                          style={{ color: getSeverityColor(scan.severity) }}
                        />
                      </div>
                      <div>
                        <h3
                          className="font-semibold uppercase text-sm"
                          style={{ color: getSeverityColor(scan.severity) }}
                        >
                          {scan.severity} Severity
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          Scanned: {new Date(scan.scanDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {scan.vulnerabilities}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Total vulnerabilities
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" style={{ color: 'var(--success)' }} />
                      <div>
                        <div className="text-sm font-semibold" style={{ color: 'var(--success)' }}>
                          {scan.resolved} Resolved
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {Math.round((scan.resolved / scan.vulnerabilities) * 100)}% complete
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                      <div>
                        <div className="text-sm font-semibold" style={{ color: 'var(--warning)' }}>
                          {scan.pending} Pending
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          Requires attention
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
