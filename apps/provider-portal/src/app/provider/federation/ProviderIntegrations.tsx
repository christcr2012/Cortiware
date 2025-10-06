import { useState, useEffect } from 'react';

export default function ProviderIntegrations() {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newProvider, setNewProvider] = useState({ name: '', url: '' });
  const [adding, setAdding] = useState(false);

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
                  <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{provider.name}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{provider.url}</td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        background: provider.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: provider.status === 'active' ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
                      }}
                    >
                      {provider.status}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(provider.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(provider.id)}
                      className="px-3 py-1 rounded text-sm font-medium"
                      style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'rgb(239, 68, 68)' }}
                    >
                      Remove
                    </button>
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

