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
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);

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
                  onClick={() => setSelectedIncident(incident.id)}
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

      {/* Incident Details Modal */}
      {selectedIncident && (
        <IncidentDetailsModal
          incidentId={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onRefresh={fetchIncidents}
        />
      )}
    </div>
  );
}

// Incident Details Modal Component
function IncidentDetailsModal({ incidentId, onClose, onRefresh }: { incidentId: string; onClose: () => void; onRefresh: () => void }) {
  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'P3',
    status: 'OPEN',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchIncidentDetails();
  }, [incidentId]);

  const fetchIncidentDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/provider/incidents/${incidentId}`);
      const data = await res.json();

      if (data.ok) {
        setIncident(data.data.incident);
        setFormData({
          title: data.data.incident.title,
          description: data.data.incident.description,
          severity: data.data.incident.severity,
          status: data.data.incident.status,
        });
      }
    } catch (error) {
      console.error('Failed to fetch incident details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/provider/incidents/${incidentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setEditing(false);
        fetchIncidentDetails();
        onRefresh();
      } else {
        alert('Failed to update incident');
      }
    } catch (error) {
      console.error('Error updating incident:', error);
      alert('Error updating incident');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/provider/incidents/${incidentId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        onRefresh();
        onClose();
      } else {
        alert('Failed to delete incident');
      }
    } catch (error) {
      console.error('Error deleting incident:', error);
      alert('Error deleting incident');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50" style={{ background: 'rgba(0,0,0,0.5)' }}>
        <div className="rounded-xl p-8 max-w-2xl w-full mx-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-accent)' }}>
          <div className="text-center" style={{ color: 'var(--text-secondary)' }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (!incident) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div
        className="rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border-accent)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            {editing ? (
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="text-2xl font-bold px-3 py-1 rounded w-full"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
              />
            ) : (
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{incident.title}</h2>
            )}
            <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>ID: {incident.id}</p>
          </div>
          <button onClick={onClose} className="text-2xl font-bold hover:opacity-70" style={{ color: 'var(--text-secondary)' }}>×</button>
        </div>

        {/* Edit/Save Buttons */}
        {editing ? (
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded font-medium"
              style={{ background: 'var(--brand-primary)', color: 'white' }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setFormData({
                  title: incident.title,
                  description: incident.description,
                  severity: incident.severity,
                  status: incident.status,
                });
              }}
              className="px-4 py-2 rounded font-medium"
              style={{ background: 'var(--surface-3)', color: 'var(--text-primary)' }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 rounded font-medium mb-6"
            style={{ background: 'var(--brand-primary)', color: 'white' }}
          >
            Edit Incident
          </button>
        )}

        {/* Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Description</label>
            {editing ? (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 rounded"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
              />
            ) : (
              <p style={{ color: 'var(--text-primary)' }}>{incident.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Severity</label>
              {editing ? (
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full px-3 py-2 rounded"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                >
                  <option value="P1">P1 - Critical</option>
                  <option value="P2">P2 - High</option>
                  <option value="P3">P3 - Medium</option>
                </select>
              ) : (
                <p style={{ color: 'var(--text-primary)' }}>{incident.severity}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Status</label>
              {editing ? (
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 rounded"
                  style={{ background: 'var(--input-bg)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                >
                  <option value="OPEN">Open</option>
                  <option value="ACK">Acknowledged</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              ) : (
                <p style={{ color: 'var(--text-primary)' }}>{incident.status}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Organization</label>
              <p style={{ color: 'var(--text-primary)' }}>{incident.org.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Created</label>
              <p style={{ color: 'var(--text-primary)' }}>{new Date(incident.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--accent-error)' }}>Danger Zone</h3>
          {showDeleteConfirm ? (
            <div className="rounded-lg p-4" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-error)' }}>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                Are you sure you want to delete this incident? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 rounded font-medium"
                  style={{ background: 'var(--accent-error)', color: 'white' }}
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete Incident'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded font-medium"
                  style={{ background: 'var(--surface-3)', color: 'var(--text-primary)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 rounded font-medium"
              style={{ background: 'var(--accent-error)', color: 'white' }}
            >
              Delete Incident
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

