import { useState, useEffect } from 'react';

type Provider = {
  id: string;
  name: string;
  url: string;
  type: string;
  enabled: boolean;
  createdAt: string;
  lastSyncAt?: string;
  syncStatus?: 'success' | 'failed' | 'pending' | 'never';
  healthStatus?: 'healthy' | 'degraded' | 'down' | 'unknown';
  errorMessage?: string;
};

export default function ProviderIntegrations() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newProvider, setNewProvider] = useState({ name: '', url: '' });
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: '', type: '', enabled: true });

  // New state for enhancements
  const [selectedProviders, setSelectedProviders] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSync, setFilterSync] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'lastSync'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkAction, setBulkAction] = useState<'enable' | 'disable' | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Map<string, { success: boolean; message: string }>>(new Map());
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/federation/providers');
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers || []);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newProvider.name.trim() || !newProvider.url.trim()) return;
    
    setAdding(true);
    try {
      const res = await fetch('/api/federation/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProvider)
      });
      
      if (res.ok) {
        setNewProvider({ name: '', url: '' });
        setShowAdd(false);
        fetchProviders();
      }
    } catch (error) {
      console.error('Error adding provider:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = (provider: any) => {
    setEditingId(provider.id);
    setEditData({
      name: provider.name,
      type: provider.type || 'api_key',
      enabled: provider.enabled !== false,
    });
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/federation/providers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (res.ok) {
        setEditingId(null);
        fetchProviders();
      }
    } catch (error) {
      console.error('Error updating provider:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({ name: '', type: '', enabled: true });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this provider integration?')) return;

    try {
      const res = await fetch(`/api/federation/providers/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchProviders();
      }
    } catch (error) {
      console.error('Error deleting provider:', error);
    }
  };

  // Bulk operations
  const handleSelectAll = () => {
    if (selectedProviders.size === filteredProviders.length) {
      setSelectedProviders(new Set());
    } else {
      setSelectedProviders(new Set(filteredProviders.map(p => p.id)));
    }
  };

  const handleSelectProvider = (id: string) => {
    const newSelected = new Set(selectedProviders);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProviders(newSelected);
  };

  const handleBulkAction = async (action: 'enable' | 'disable') => {
    setBulkAction(action);
    setShowBulkConfirm(true);
  };

  const confirmBulkAction = async () => {
    if (!bulkAction) return;

    try {
      const promises = Array.from(selectedProviders).map(id =>
        fetch(`/api/federation/providers/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled: bulkAction === 'enable' }),
        })
      );

      await Promise.all(promises);
      setSelectedProviders(new Set());
      setShowBulkConfirm(false);
      setBulkAction(null);
      fetchProviders();
    } catch (error) {
      console.error('Bulk action error:', error);
    }
  };

  // Test connection
  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    try {
      const res = await fetch(`/api/federation/providers/${id}/test`, {
        method: 'POST',
      });
      const data = await res.json();

      const newResults = new Map(testResults);
      newResults.set(id, {
        success: data.success || false,
        message: data.message || (data.success ? 'Connection successful' : 'Connection failed'),
      });
      setTestResults(newResults);
    } catch (error) {
      const newResults = new Map(testResults);
      newResults.set(id, {
        success: false,
        message: 'Test failed: ' + (error as Error).message,
      });
      setTestResults(newResults);
    } finally {
      setTestingId(null);
    }
  };

  // Filtering and sorting
  const filteredProviders = providers
    .filter(p => {
      if (filterStatus !== 'all' && (p.enabled ? 'active' : 'inactive') !== filterStatus) return false;
      if (filterType !== 'all' && p.type !== filterType) return false;
      if (filterSync !== 'all') {
        if (filterSync === 'recent' && (!p.lastSyncAt || new Date(p.lastSyncAt) < new Date(Date.now() - 24 * 60 * 60 * 1000))) return false;
        if (filterSync === 'failed' && p.syncStatus !== 'failed') return false;
        if (filterSync === 'never' && p.syncStatus !== 'never') return false;
      }
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.url.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
      else if (sortBy === 'created') comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortBy === 'lastSync') comparison = (a.lastSyncAt ? new Date(a.lastSyncAt).getTime() : 0) - (b.lastSyncAt ? new Date(b.lastSyncAt).getTime() : 0);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const providerTypes = Array.from(new Set(providers.map(p => p.type)));

  // Configuration templates
  const templates = [
    { name: 'OAuth Provider', type: 'oauth', config: { clientId: '', clientSecret: '', redirectUri: '' } },
    { name: 'API Key Provider', type: 'api_key', config: { apiKey: '', apiSecret: '' } },
    { name: 'SAML Provider', type: 'saml', config: { entityId: '', ssoUrl: '', certificate: '' } },
  ];

  const applyTemplate = (template: typeof templates[0]) => {
    setNewProvider({ name: template.name, url: '' });
    setShowAdd(true);
    setShowTemplates(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Provider Integrations</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {providers.length} total • {providers.filter(p => p.enabled).length} active • {selectedProviders.size} selected
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTemplates(true)}
            className="px-4 py-2 rounded font-medium"
            style={{ background: 'var(--surface-3)', color: 'var(--text-primary)' }}
          >
            Templates
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 rounded font-medium"
            style={{ background: 'var(--brand-primary)', color: 'var(--text-on-brand)' }}
          >
            Add Provider
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="rounded-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search providers..."
              className="w-full px-3 py-2 rounded"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 rounded"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 rounded"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
            >
              <option value="all">All Types</option>
              {providerTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Last Sync</label>
            <select
              value={filterSync}
              onChange={(e) => setFilterSync(e.target.value)}
              className="w-full px-3 py-2 rounded"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
            >
              <option value="all">All</option>
              <option value="recent">Last 24h</option>
              <option value="failed">Failed</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProviders.size > 0 && (
        <div className="rounded-xl p-4 flex justify-between items-center" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgb(59, 130, 246)' }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
            {selectedProviders.size} provider{selectedProviders.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-3">
            <button
              onClick={() => handleBulkAction('enable')}
              className="px-4 py-2 rounded font-medium"
              style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'rgb(34, 197, 94)' }}
            >
              Enable Selected
            </button>
            <button
              onClick={() => handleBulkAction('disable')}
              className="px-4 py-2 rounded font-medium"
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'rgb(239, 68, 68)' }}
            >
              Disable Selected
            </button>
            <button
              onClick={() => setSelectedProviders(new Set())}
              className="px-4 py-2 rounded font-medium"
              style={{ background: 'var(--surface-3)', color: 'var(--text-primary)' }}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Add Provider Integration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Provider Name</label>
              <input
                type="text"
                value={newProvider.name}
                onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                placeholder="e.g., External Provider"
                className="w-full px-3 py-2 rounded"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Provider URL</label>
              <input
                type="text"
                value={newProvider.url}
                onChange={(e) => setNewProvider({ ...newProvider, url: e.target.value })}
                placeholder="https://provider.example.com"
                className="w-full px-3 py-2 rounded"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAdd}
                disabled={adding || !newProvider.name.trim() || !newProvider.url.trim()}
                className="px-4 py-2 rounded font-medium"
                style={{ background: 'var(--brand-primary)', color: 'var(--text-on-brand)' }}
              >
                {adding ? 'Adding...' : 'Add Provider'}
              </button>
              <button
                onClick={() => {
                  setShowAdd(false);
                  setNewProvider({ name: '', url: '' });
                }}
                className="px-4 py-2 rounded font-medium"
                style={{ background: 'var(--input-bg)', color: 'var(--text-primary)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
        {loading ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>Loading providers...</div>
        ) : filteredProviders.length === 0 ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
            {providers.length === 0 ? 'No provider integrations yet. Add one to get started.' : 'No providers match your filters.'}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <th className="px-4 py-3 text-left" style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedProviders.size === filteredProviders.length && filteredProviders.length > 0}
                    onChange={handleSelectAll}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                <th
                  className="px-4 py-3 text-left cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => {
                    if (sortBy === 'name') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortBy('name'); setSortOrder('asc'); }
                  }}
                >
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-left" style={{ color: 'var(--text-primary)' }}>Type</th>
                <th className="px-4 py-3 text-left" style={{ color: 'var(--text-primary)' }}>Status</th>
                <th className="px-4 py-3 text-left" style={{ color: 'var(--text-primary)' }}>Health</th>
                <th
                  className="px-4 py-3 text-left cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                  onClick={() => {
                    if (sortBy === 'lastSync') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else { setSortBy('lastSync'); setSortOrder('asc'); }
                  }}
                >
                  Last Sync {sortBy === 'lastSync' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-right" style={{ color: 'var(--text-primary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProviders.map((provider) => {
                const testResult = testResults.get(provider.id);
                return (
                  <tr key={provider.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedProviders.has(provider.id)}
                        onChange={() => handleSelectProvider(provider.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {editingId === provider.id ? (
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="px-2 py-1 rounded w-full"
                          style={{ background: 'var(--input-bg)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                        />
                      ) : (
                        <div>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{provider.name}</div>
                          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{provider.url}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded text-xs font-medium" style={{ background: 'var(--surface-3)', color: 'var(--text-secondary)' }}>
                        {provider.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {editingId === provider.id ? (
                        <select
                          value={editData.enabled ? 'active' : 'inactive'}
                          onChange={(e) => setEditData({ ...editData, enabled: e.target.value === 'active' })}
                          className="px-2 py-1 rounded text-xs"
                          style={{ background: 'var(--input-bg)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      ) : (
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            background: provider.enabled ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: provider.enabled ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
                          }}
                        >
                          {provider.enabled ? 'Active' : 'Inactive'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          background: provider.healthStatus === 'healthy' ? 'rgba(34, 197, 94, 0.1)' :
                                     provider.healthStatus === 'degraded' ? 'rgba(251, 191, 36, 0.1)' :
                                     provider.healthStatus === 'down' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                          color: provider.healthStatus === 'healthy' ? 'rgb(34, 197, 94)' :
                                provider.healthStatus === 'degraded' ? 'rgb(251, 191, 36)' :
                                provider.healthStatus === 'down' ? 'rgb(239, 68, 68)' : 'rgb(156, 163, 175)'
                        }}
                      >
                        {provider.healthStatus || 'unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {provider.lastSyncAt ? (
                        <div>
                          <div className="text-xs" style={{ color: 'var(--text-primary)' }}>
                            {new Date(provider.lastSyncAt).toLocaleString()}
                          </div>
                          <div className="text-xs" style={{ color: provider.syncStatus === 'success' ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)' }}>
                            {provider.syncStatus}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Never</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2 items-end">
                        {editingId === provider.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveEdit(provider.id)}
                              className="px-3 py-1 rounded text-sm font-medium"
                              style={{ background: 'var(--brand-primary)', color: 'white' }}
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 rounded text-sm font-medium"
                              style={{ background: 'var(--surface-3)', color: 'var(--text-primary)' }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleTestConnection(provider.id)}
                                disabled={testingId === provider.id}
                                className="px-3 py-1 rounded text-sm font-medium"
                                style={{ background: 'rgba(168, 85, 247, 0.1)', color: 'rgb(168, 85, 247)' }}
                              >
                                {testingId === provider.id ? 'Testing...' : 'Test'}
                              </button>
                              <button
                                onClick={() => handleEdit(provider)}
                                className="px-3 py-1 rounded text-sm font-medium"
                                style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'rgb(59, 130, 246)' }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(provider.id)}
                                className="px-3 py-1 rounded text-sm font-medium"
                                style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'rgb(239, 68, 68)' }}
                              >
                                Remove
                              </button>
                            </div>
                            {testResult && (
                              <div
                                className="text-xs px-2 py-1 rounded"
                                style={{
                                  background: testResult.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                  color: testResult.success ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
                                }}
                              >
                                {testResult.message}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Bulk Confirmation Modal */}
      {showBulkConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-xl p-6 max-w-md w-full" style={{ background: 'var(--bg-main)', border: '1px solid var(--border-accent)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Confirm Bulk Action
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Are you sure you want to {bulkAction} {selectedProviders.size} provider{selectedProviders.size > 1 ? 's' : ''}?
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={confirmBulkAction}
                className="px-4 py-2 rounded font-medium flex-1"
                style={{ background: 'var(--brand-primary)', color: 'white' }}
              >
                Confirm
              </button>
              <button
                onClick={() => { setShowBulkConfirm(false); setBulkAction(null); }}
                className="px-4 py-2 rounded font-medium flex-1"
                style={{ background: 'var(--surface-3)', color: 'var(--text-primary)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-xl p-6 max-w-2xl w-full" style={{ background: 'var(--bg-main)', border: '1px solid var(--border-accent)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Configuration Templates
            </h3>
            <div className="space-y-3">
              {templates.map((template, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-primary)' }}
                  onClick={() => applyTemplate(template)}
                >
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{template.name}</div>
                  <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Type: {template.type}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowTemplates(false)}
              className="mt-4 px-4 py-2 rounded font-medium w-full"
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

