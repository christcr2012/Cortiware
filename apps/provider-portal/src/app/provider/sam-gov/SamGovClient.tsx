'use client';

import { useState } from 'react';
import type { ClientSamStatus } from '@/services/provider/sam-gov.service';

interface Props {
  initialStatuses: ClientSamStatus[];
  initialNaicsAnalytics: any[];
  initialBulkValidation: any;
}

export default function SamGovClient({ initialStatuses, initialNaicsAnalytics, initialBulkValidation }: Props) {
  const [statuses, setStatuses] = useState(initialStatuses);
  const [naicsAnalytics, setNaicsAnalytics] = useState(initialNaicsAnalytics);
  const [bulkValidation, setBulkValidation] = useState(initialBulkValidation);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expirationFilter, setExpirationFilter] = useState<string>('all');
  const [isValidating, setIsValidating] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientSamStatus | null>(null);

  // Filter statuses
  const filteredStatuses = statuses.filter(status => {
    const matchesSearch = status.orgName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         status.ueiSAM?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || status.registrationStatus === statusFilter;
    
    let matchesExpiration = true;
    if (expirationFilter === '30days' && status.daysUntilExpiration) {
      matchesExpiration = status.daysUntilExpiration <= 30;
    } else if (expirationFilter === '60days' && status.daysUntilExpiration) {
      matchesExpiration = status.daysUntilExpiration <= 60;
    } else if (expirationFilter === '90days' && status.daysUntilExpiration) {
      matchesExpiration = status.daysUntilExpiration <= 90;
    }

    return matchesSearch && matchesStatus && matchesExpiration;
  });

  const handleBulkValidation = async () => {
    setIsValidating(true);
    try {
      const res = await fetch('/api/provider/sam-gov/bulk-validate', {
        method: 'POST',
      });
      const data = await res.json();
      setBulkValidation(data);
      setStatuses(data.statuses || []);
    } catch (error) {
      console.error('Bulk validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Organization', 'UEI SAM', 'Status', 'Expiration Date', 'Days Until Expiration', 'NAICS Codes', 'Excluded'];
    const rows = filteredStatuses.map(s => [
      s.orgName,
      s.ueiSAM || 'N/A',
      s.registrationStatus,
      s.expirationDate || 'N/A',
      s.daysUntilExpiration?.toString() || 'N/A',
      s.naicsCodes.join('; '),
      s.isExcluded ? 'Yes' : 'No',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sam-gov-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#10b981';
      case 'Expired': return '#ef4444';
      case 'Inactive': return '#f59e0b';
      case 'Not Registered': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getExpirationColor = (days?: number) => {
    if (!days) return 'var(--text-tertiary)';
    if (days <= 30) return '#ef4444';
    if (days <= 60) return '#f59e0b';
    if (days <= 90) return '#eab308';
    return '#10b981';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {bulkValidation && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="kpi-card">
            <div className="text-responsive-sm" style={{ color: 'var(--text-secondary)' }}>Total Clients</div>
            <div className="text-responsive-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
              {bulkValidation.total}
            </div>
          </div>

          <div className="kpi-card">
            <div className="text-responsive-sm" style={{ color: 'var(--text-secondary)' }}>Active Registrations</div>
            <div className="text-responsive-3xl font-bold mt-1" style={{ color: '#10b981' }}>
              {bulkValidation.active}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              {((bulkValidation.active / bulkValidation.total) * 100).toFixed(1)}% of total
            </div>
          </div>

          <div className="kpi-card">
            <div className="text-responsive-sm" style={{ color: 'var(--text-secondary)' }}>Expiring Soon (30d)</div>
            <div className="text-responsive-3xl font-bold mt-1" style={{ color: '#f59e0b' }}>
              {bulkValidation.expiringSoon}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Requires immediate attention
            </div>
          </div>

          <div className="kpi-card">
            <div className="text-responsive-sm" style={{ color: 'var(--text-secondary)' }}>Excluded Entities</div>
            <div className="text-responsive-3xl font-bold mt-1" style={{ color: bulkValidation.excluded > 0 ? '#ef4444' : '#10b981' }}>
              {bulkValidation.excluded}
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              {bulkValidation.excluded > 0 ? '⚠️ Action required' : '✓ All clear'}
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="glass-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Organization or UEI..."
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field w-full"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Inactive">Inactive</option>
              <option value="Not Registered">Not Registered</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Expiration</label>
            <select
              value={expirationFilter}
              onChange={(e) => setExpirationFilter(e.target.value)}
              className="input-field w-full"
            >
              <option value="all">All</option>
              <option value="30days">Within 30 days</option>
              <option value="60days">Within 60 days</option>
              <option value="90days">Within 90 days</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={handleBulkValidation}
              disabled={isValidating}
              className="btn-primary flex-1"
              style={{ opacity: isValidating ? 0.6 : 1 }}
            >
              {isValidating ? 'Validating...' : 'Bulk Validate'}
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded font-medium"
              style={{ background: 'var(--surface-3)', color: 'var(--text-primary)' }}
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Client Status Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Organization</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>UEI SAM</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Status</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Expiration</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Days Left</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>NAICS</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Excluded</th>
                <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStatuses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center" style={{ color: 'var(--text-tertiary)' }}>
                    No clients found matching filters
                  </td>
                </tr>
              ) : (
                filteredStatuses.map((status) => (
                  <tr key={status.orgId} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                    <td className="p-4">
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{status.orgName}</div>
                    </td>
                    <td className="p-4">
                      <code className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {status.ueiSAM || 'N/A'}
                      </code>
                    </td>
                    <td className="p-4">
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{ background: `${getStatusColor(status.registrationStatus)}20`, color: getStatusColor(status.registrationStatus) }}
                      >
                        {status.registrationStatus}
                      </span>
                    </td>
                    <td className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {status.expirationDate ? new Date(status.expirationDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4">
                      {status.daysUntilExpiration !== undefined ? (
                        <span className="font-medium" style={{ color: getExpirationColor(status.daysUntilExpiration) }}>
                          {status.daysUntilExpiration} days
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-tertiary)' }}>N/A</span>
                      )}
                    </td>
                    <td className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {status.naicsCodes.length > 0 ? `${status.naicsCodes.length} codes` : 'None'}
                    </td>
                    <td className="p-4">
                      {status.isExcluded ? (
                        <span className="text-xs font-medium" style={{ color: '#ef4444' }}>⚠️ Yes</span>
                      ) : (
                        <span className="text-xs" style={{ color: '#10b981' }}>✓ No</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedClient(status)}
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

      {/* NAICS Analytics */}
      {naicsAnalytics.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            NAICS Code Distribution
          </h2>
          <div className="space-y-3">
            {naicsAnalytics.slice(0, 10).map((naics) => (
              <div key={naics.code}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {naics.code}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {naics.count} clients
                  </span>
                </div>
                <div className="h-2 rounded-full" style={{ background: 'var(--surface-2)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(naics.count / statuses.length) * 100}%`,
                      background: 'var(--brand-primary)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Client Details Modal */}
      {selectedClient && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedClient(null)}
        >
          <div
            className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {selectedClient.orgName}
                  </h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    SAM.gov Registration Details
                  </p>
                </div>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="text-2xl"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>UEI SAM</label>
                  <p className="mt-1" style={{ color: 'var(--text-primary)' }}>{selectedClient.ueiSAM || 'Not registered'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Registration Status</label>
                  <p className="mt-1">
                    <span
                      className="px-3 py-1 rounded text-sm font-medium"
                      style={{ background: `${getStatusColor(selectedClient.registrationStatus)}20`, color: getStatusColor(selectedClient.registrationStatus) }}
                    >
                      {selectedClient.registrationStatus}
                    </span>
                  </p>
                </div>

                {selectedClient.expirationDate && (
                  <div>
                    <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Expiration Date</label>
                    <p className="mt-1" style={{ color: 'var(--text-primary)' }}>
                      {new Date(selectedClient.expirationDate).toLocaleDateString()}
                      {selectedClient.daysUntilExpiration !== undefined && (
                        <span className="ml-2" style={{ color: getExpirationColor(selectedClient.daysUntilExpiration) }}>
                          ({selectedClient.daysUntilExpiration} days remaining)
                        </span>
                      )}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>NAICS Codes</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedClient.naicsCodes.length > 0 ? (
                      selectedClient.naicsCodes.map((code) => (
                        <span
                          key={code}
                          className="px-2 py-1 rounded text-xs font-mono"
                          style={{ background: 'var(--surface-3)', color: 'var(--text-primary)' }}
                        >
                          {code}
                        </span>
                      ))
                    ) : (
                      <p style={{ color: 'var(--text-tertiary)' }}>No NAICS codes registered</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Exclusion Status</label>
                  <p className="mt-1">
                    {selectedClient.isExcluded ? (
                      <span className="font-medium" style={{ color: '#ef4444' }}>⚠️ Entity is on exclusion list</span>
                    ) : (
                      <span style={{ color: '#10b981' }}>✓ Not excluded</span>
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Last Checked</label>
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    {new Date(selectedClient.lastChecked).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

