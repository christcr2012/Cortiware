import { useState, useEffect } from 'react';

export default function ProviderIntegrations() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newProvider, setNewProvider] = useState({ name: '', url: '' });
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: '', type: '', enabled: true });

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/provider/federation/providers');
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
      const res = await fetch('/api/provider/federation/providers', {
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
      const res = await fetch(`/api/provider/federation/providers/${id}`, {
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
      const res = await fetch(`/api/provider/federation/providers/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchProviders();
      }
    } catch (error) {
      console.error('Error deleting provider:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Provider Integrations</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 rounded font-medium"
          style={{ background: 'var(--brand-primary)', color: 'var(--text-on-brand)' }}
        >
          Add Provider
        </button>
      </div>

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
        ) : providers.length === 0 ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>No provider integrations yet. Add one to get started.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <th className="px-4 py-3 text-left" style={{ color: 'var(--text-primary)' }}>Name</th>
                <th className="px-4 py-3 text-left" style={{ color: 'var(--text-primary)' }}>URL</th>
                <th className="px-4 py-3 text-left" style={{ color: 'var(--text-primary)' }}>Status</th>
                <th className="px-4 py-3 text-left" style={{ color: 'var(--text-primary)' }}>Created</th>
                <th className="px-4 py-3 text-right" style={{ color: 'var(--text-primary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((provider) => (
                <tr key={provider.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
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
                      <span style={{ color: 'var(--text-primary)' }}>{provider.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{provider.url || provider.type}</td>
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
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(provider.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingId === provider.id ? (
                      <div className="flex gap-2 justify-end">
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
                      <div className="flex gap-2 justify-end">
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
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

