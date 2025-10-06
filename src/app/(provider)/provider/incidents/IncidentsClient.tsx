'use client';

import { useState, useEffect } from 'react';
import { Plus, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

type Incident = {
  id: string;
  orgId: string;
  severity: 'P1' | 'P2' | 'P3';
  status: 'OPEN' | 'ACK' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  title: string;
  description: string;
  assigneeUserId: string | null;
  slaResponseDeadline: string | null;
  slaResolveDeadline: string | null;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  org: { id: string; name: string };
};

export default function IncidentsClient() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchIncidents();
  }, [filter]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);
      
      const res = await fetch(`/api/provider/incidents?${params}`);
      const data = await res.json();
      
      if (data.ok) {
        setIncidents(data.data.incidents);
      }
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <AlertCircle className="h-4 w-4" style={{ color: 'var(--accent-warning)' }} />;
      case 'ACK': return <Clock className="h-4 w-4" style={{ color: 'var(--accent-info)' }} />;
      case 'IN_PROGRESS': return <Clock className="h-4 w-4" style={{ color: 'var(--brand-primary)' }} />;
      case 'RESOLVED': return <CheckCircle className="h-4 w-4" style={{ color: 'var(--accent-success)' }} />;
      case 'CLOSED': return <XCircle className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />;
      default: return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'P1': return 'var(--accent-error)';
      case 'P2': return 'var(--accent-warning)';
      case 'P3': return 'var(--accent-info)';
      default: return 'var(--text-muted)';
    }
  };

  const stats = {
    open: incidents.filter(i => i.status === 'OPEN').length,
    inProgress: incidents.filter(i => i.status === 'IN_PROGRESS' || i.status === 'ACK').length,
    resolved: incidents.filter(i => i.status === 'RESOLVED').length,
    closed: incidents.filter(i => i.status === 'CLOSED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Incidents
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Track and manage customer incidents with SLA monitoring
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
          style={{
            background: 'var(--brand-gradient)',
            color: 'white',
          }}
        >
          <Plus className="h-4 w-4" />
          New Incident
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-primary)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Open</div>
          <div className="text-2xl font-bold mt-1" style={{ color: 'var(--accent-warning)' }}>{stats.open}</div>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-primary)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>In Progress</div>
          <div className="text-2xl font-bold mt-1" style={{ color: 'var(--brand-primary)' }}>{stats.inProgress}</div>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-primary)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Resolved</div>
          <div className="text-2xl font-bold mt-1" style={{ color: 'var(--accent-success)' }}>{stats.resolved}</div>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-primary)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Closed</div>
          <div className="text-2xl font-bold mt-1" style={{ color: 'var(--text-muted)' }}>{stats.closed}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: filter === f ? 'var(--surface-3)' : 'var(--surface-1)',
              color: filter === f ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: `1px solid ${filter === f ? 'var(--border-accent)' : 'var(--border-primary)'}`,
            }}
          >
            {f === 'all' ? 'All' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Incidents List */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-primary)' }}>
        {loading ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>Loading...</div>
        ) : incidents.length === 0 ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
            No incidents found. Create your first incident to get started.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border-primary)' }}>
                <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Severity</th>
                <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Title</th>
                <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Organization</th>
                <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Status</th>
                <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident) => (
                <tr
                  key={incident.id}
                  className="transition-colors cursor-pointer"
                  style={{ borderBottom: '1px solid var(--border-secondary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="p-4">
                    <span
                      className="px-2 py-1 rounded text-xs font-bold"
                      style={{ background: `${getSeverityColor(incident.severity)}20`, color: getSeverityColor(incident.severity) }}
                    >
                      {incident.severity}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{incident.title}</div>
                    <div className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                      {incident.description.substring(0, 60)}...
                    </div>
                  </td>
                  <td className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{incident.org.name}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(incident.status)}
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {incident.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(incident.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="rounded-xl p-6 max-w-md w-full"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border-accent)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Create Incident</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Incident creation form will be implemented here.
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 rounded-lg"
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

