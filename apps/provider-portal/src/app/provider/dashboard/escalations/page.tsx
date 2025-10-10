'use client';

import { useState, useEffect } from 'react';

type EscalationTicket = {
  id: string;
  escalationId: string;
  tenantId: string;
  orgId: string;
  type: string; // DB field is 'type' not 'incidentType'
  severity: string;
  description: string;
  state: string; // DB field is 'state' not 'status'
  createdAt: string;
};

export default function EscalationsPage() {
  const [tickets, setTickets] = useState<EscalationTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }
      
      const res = await fetch(`/api/admin/escalations?${params}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch escalations: ${res.statusText}`);
      }
      const data = await res.json();
      setTickets(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load escalations');
      console.error('Error fetching escalations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/escalations/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update status');
      }

      // Refresh the list
      fetchTickets();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'received': return 'text-blue-600 bg-blue-50';
      case 'sandbox_created': return 'text-yellow-600 bg-yellow-50';
      case 'pr_opened': return 'text-purple-600 bg-purple-50';
      case 'canary_requested': return 'text-orange-600 bg-orange-50';
      case 'rolled_out': return 'text-green-600 bg-green-50';
      case 'rolled_back': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--brand-gradient)' }}>
          Escalation Tickets
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Manage escalation tickets from federated clients
        </p>
      </header>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <label className="text-sm font-medium">Filter by status:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <button
          onClick={fetchTickets}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Refresh
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
          <p className="mt-2 text-sm text-gray-600">Loading escalations...</p>
        </div>
      )}

      {/* Tickets List */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {tickets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No escalation tickets found
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant / Org
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ticket.escalationId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{ticket.tenantId}</div>
                      <div className="text-xs text-gray-400">{ticket.orgId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ticket.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(ticket.severity)}`}>
                        {ticket.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.state)}`}>
                        {ticket.state.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select
                        value={ticket.state}
                        onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                        className="px-2 py-1 border rounded text-xs"
                      >
                        <option value="received">Received</option>
                        <option value="sandbox_created">Sandbox Created</option>
                        <option value="pr_opened">PR Opened</option>
                        <option value="canary_requested">Canary Requested</option>
                        <option value="rolled_out">Rolled Out</option>
                        <option value="rolled_back">Rolled Back</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Summary Stats */}
      {!loading && !error && tickets.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Total Tickets</div>
            <div className="text-2xl font-bold">{tickets.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Received</div>
            <div className="text-2xl font-bold text-blue-600">
              {tickets.filter(t => t.state === 'received').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">In Progress</div>
            <div className="text-2xl font-bold text-yellow-600">
              {tickets.filter(t => ['sandbox_created', 'pr_opened', 'canary_requested'].includes(t.state)).length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Rolled Out</div>
            <div className="text-2xl font-bold text-green-600">
              {tickets.filter(t => t.state === 'rolled_out').length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

