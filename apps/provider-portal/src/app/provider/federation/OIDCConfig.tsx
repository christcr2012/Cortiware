import { useState, useEffect } from 'react';

export default function OIDCConfig() {
  const [config, setConfig] = useState({
    enabled: false,
    issuer: '',
    clientId: '',
    clientSecret: '',
    redirectUri: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/provider/federation/oidc');
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
      }
    } catch (error) {
      console.error('Error fetching OIDC config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/provider/federation/oidc', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (res.ok) {
        alert('OIDC configuration saved successfully');
      }
    } catch (error) {
      console.error('Error saving OIDC config:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/provider/federation/oidc/test', {
        method: 'POST'
      });
      
      if (res.ok) {
        const data = await res.json();
        setTestResult({ success: true, message: data.message });
      } else {
        setTestResult({ success: false, message: 'Connection failed' });
      }
    } catch (error) {
      setTestResult({ success: false, message: 'Connection error' });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>Loading configuration...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>OIDC Configuration</h2>

      <div className="rounded-xl p-6 space-y-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
            className="w-5 h-5"
          />
          <label className="font-medium" style={{ color: 'var(--text-primary)' }}>Enable OIDC Authentication</label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Issuer URL</label>
          <input
            type="text"
            value={config.issuer}
            onChange={(e) => setConfig({ ...config, issuer: e.target.value })}
            placeholder="https://auth.example.com"
            className="w-full px-3 py-2 rounded"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Client ID</label>
          <input
            type="text"
            value={config.clientId}
            onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
            placeholder="your-client-id"
            className="w-full px-3 py-2 rounded"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Client Secret</label>
          <input
            type="password"
            value={config.clientSecret}
            onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
            placeholder="your-client-secret"
            className="w-full px-3 py-2 rounded"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Redirect URI</label>
          <input
            type="text"
            value={config.redirectUri}
            onChange={(e) => setConfig({ ...config, redirectUri: e.target.value })}
            placeholder="https://your-app.com/auth/callback"
            className="w-full px-3 py-2 rounded"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
          />
        </div>

        {testResult && (
          <div
            className="p-4 rounded"
            style={{
              background: testResult.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: testResult.success ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
            }}
          >
            {testResult.message}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded font-medium"
            style={{ background: 'var(--brand-primary)', color: 'var(--text-on-brand)' }}
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
          <button
            onClick={handleTest}
            disabled={testing || !config.enabled}
            className="px-4 py-2 rounded font-medium"
            style={{ background: 'var(--input-bg)', color: 'var(--text-primary)' }}
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
        </div>
      </div>
    </div>
  );
}

