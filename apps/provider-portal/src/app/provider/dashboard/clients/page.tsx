'use client';

import { useState, useEffect } from 'react';

type FederatedClient = {
  id: string;
  orgId: string;
  name: string;
  contactEmail: string;
  planType: string;
  apiKeyId: string;
  webhookEndpoint: string | null;
  lastSeen: string | null;
  monthlyRevenue: number;
  convertedLeads: number;
  createdAt: string;
  updatedAt: string;
};

type WebhookConfig = {
  orgId: string;
  url: string;
  secret: string;
};

export default function FederatedClientsPage() {
  const [clients, setClients] = useState<FederatedClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<FederatedClient | null>(null);
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>({
    orgId: '',
    url: '',
    secret: '',
  });

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/clients');
      if (!res.ok) {
        throw new Error(`Failed to fetch clients: ${res.statusText}`);
      }
      const data = await res.json();
      setClients(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clients');
      console.error('Error fetching federated clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleRegisterWebhook = async () => {
    if (!webhookConfig.orgId || !webhookConfig.url || !webhookConfig.secret) {
      alert('All fields are required');
      return;
    }

    try {
      const res = await fetch('/api/v1/federation/callbacks/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookConfig),
      });

      if (!res.ok) {
        throw new Error('Failed to register webhook');
      }

      alert('Webhook registered successfully!');
      setShowWebhookModal(false);
      setWebhookConfig({ orgId: '', url: '', secret: '' });
      fetchClients();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to register webhook');
    }
  };

  const openWebhookModal = (client: FederatedClient) => {
    setSelectedClient(client);
    setWebhookConfig({
      orgId: client.orgId,
      url: client.webhookEndpoint || '',
      secret: '',
    });
    setShowWebhookModal(true);
  };

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
          Federated Clients
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Manage federated client organizations and webhook configurations
        </p>
      </header>

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
          <p className="mt-2 text-sm text-gray-600">Loading clients...</p>
        </div>
      )}

      {/* Clients Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {clients.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No federated clients found
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leads
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Webhook
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Seen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{client.name}</div>
                      <div className="text-xs text-gray-500">{client.orgId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.contactEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {client.planType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(client.monthlyRevenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.convertedLeads}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.webhookEndpoint ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Configured
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Not Set
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.lastSeen ? new Date(client.lastSeen).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => openWebhookModal(client)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Configure Webhook
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Summary Stats */}
      {!loading && !error && clients.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Total Clients</div>
            <div className="text-2xl font-bold">{clients.length}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Total Revenue</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(clients.reduce((sum, c) => sum + c.monthlyRevenue, 0))}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Total Leads</div>
            <div className="text-2xl font-bold text-blue-600">
              {clients.reduce((sum, c) => sum + c.convertedLeads, 0)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500">Webhooks Configured</div>
            <div className="text-2xl font-bold text-purple-600">
              {clients.filter(c => c.webhookEndpoint).length}
            </div>
          </div>
        </div>
      )}

      {/* Webhook Configuration Modal */}
      {showWebhookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Configure Webhook</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization ID
                </label>
                <input
                  type="text"
                  value={webhookConfig.orgId}
                  disabled
                  className="w-full px-3 py-2 border rounded-md bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook URL
                </label>
                <input
                  type="url"
                  value={webhookConfig.url}
                  onChange={(e) => setWebhookConfig({ ...webhookConfig, url: e.target.value })}
                  placeholder="https://example.com/webhook"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook Secret
                </label>
                <input
                  type="password"
                  value={webhookConfig.secret}
                  onChange={(e) => setWebhookConfig({ ...webhookConfig, secret: e.target.value })}
                  placeholder="Enter secret for HMAC signing"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleRegisterWebhook}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Register Webhook
              </button>
              <button
                onClick={() => setShowWebhookModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

