'use client';

import { useState, useEffect } from 'react';

type WebhookRegistration = {
  id: string;
  orgId: string;
  url: string;
  secretHash: string;
  enabled: boolean;
  createdAt: string;
};

type RateLimitConfig = {
  orgId: string;
  requestsPerMinute: number;
  burstSize: number;
};

export default function FederationSettingsPage() {
  const [webhooks, setWebhooks] = useState<WebhookRegistration[]>([]);
  const [rateLimits, setRateLimits] = useState<RateLimitConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const [newRateLimit, setNewRateLimit] = useState<RateLimitConfig>({
    orgId: '',
    requestsPerMinute: 60,
    burstSize: 10,
  });

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch webhooks
      const webhooksRes = await fetch('/api/webhooks');
      if (webhooksRes.ok) {
        const webhooksData = await webhooksRes.json();
        setWebhooks(webhooksData.items || []);
      }

      // Fetch rate limits (placeholder - would need actual endpoint)
      // For now, using mock data
      setRateLimits([
        { orgId: 'org_example1', requestsPerMinute: 60, burstSize: 10 },
        { orgId: 'org_example2', requestsPerMinute: 120, burstSize: 20 },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleTestWebhook = async (webhookId: string, url: string) => {
    setTestingWebhook(webhookId);
    try {
      const res = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookId,
          url,
          payload: {
            event: 'test',
            timestamp: new Date().toISOString(),
            data: { message: 'This is a test webhook' },
          },
        }),
      });

      if (!res.ok) {
        throw new Error('Webhook test failed');
      }

      alert('Webhook test successful! Check your endpoint logs.');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Webhook test failed');
    } finally {
      setTestingWebhook(null);
    }
  };

  const handleToggleWebhook = async (webhookId: string, currentEnabled: boolean) => {
    try {
      const res = await fetch(`/api/webhooks/${webhookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentEnabled }), // API expects isActive, converts to enabled
      });

      if (!res.ok) {
        throw new Error('Failed to toggle webhook');
      }

      fetchSettings();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to toggle webhook');
    }
  };

  const handleSaveRateLimit = async () => {
    if (!newRateLimit.orgId) {
      alert('Organization ID is required');
      return;
    }

    try {
      // This would call an actual API endpoint
      alert('Rate limit configuration saved (mock)');
      setShowRateLimitModal(false);
      setNewRateLimit({ orgId: '', requestsPerMinute: 60, burstSize: 10 });
      fetchSettings();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save rate limit');
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--brand-gradient)' }}>
          Federation Settings
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Manage webhook configurations and rate limit settings
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
          <p className="mt-2 text-sm text-gray-600">Loading settings...</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Webhook Configuration Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Webhook Registrations</h2>
              <button
                onClick={fetchSettings}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Refresh
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              {webhooks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No webhooks registered
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Organization
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Webhook URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {webhooks.map((webhook) => (
                      <tr key={webhook.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {webhook.orgId}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="max-w-xs truncate">{webhook.url}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            webhook.enabled
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {webhook.enabled ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <button
                            onClick={() => handleTestWebhook(webhook.id, webhook.url)}
                            disabled={testingWebhook === webhook.id}
                            className="text-blue-600 hover:text-blue-900 disabled:text-gray-400"
                          >
                            {testingWebhook === webhook.id ? 'Testing...' : 'Test'}
                          </button>
                          <button
                            onClick={() => handleToggleWebhook(webhook.id, webhook.enabled)}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            {webhook.enabled ? 'Disable' : 'Enable'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Rate Limit Configuration Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Rate Limit Configuration</h2>
              <button
                onClick={() => setShowRateLimitModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add Rate Limit
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requests/Minute
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Burst Size
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rateLimits.map((config) => (
                    <tr key={config.orgId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {config.orgId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {config.requestsPerMinute}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {config.burstSize}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Rate Limit Modal */}
      {showRateLimitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Configure Rate Limit</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization ID
                </label>
                <input
                  type="text"
                  value={newRateLimit.orgId}
                  onChange={(e) => setNewRateLimit({ ...newRateLimit, orgId: e.target.value })}
                  placeholder="org_example"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requests per Minute
                </label>
                <input
                  type="number"
                  value={newRateLimit.requestsPerMinute}
                  onChange={(e) => setNewRateLimit({ ...newRateLimit, requestsPerMinute: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Burst Size
                </label>
                <input
                  type="number"
                  value={newRateLimit.burstSize}
                  onChange={(e) => setNewRateLimit({ ...newRateLimit, burstSize: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSaveRateLimit}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Save Configuration
              </button>
              <button
                onClick={() => setShowRateLimitModal(false)}
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

