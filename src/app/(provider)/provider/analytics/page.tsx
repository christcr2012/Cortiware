'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ProviderAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/provider/analytics?range=${range}`);
      if (res.ok) {
        const analyticsData = await res.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!data) return;
    const csv = 'Analytics Export\n' + JSON.stringify(data, null, 2);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString()}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
        Loading analytics...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
        Failed to load analytics
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--brand-gradient)' }}>
            Analytics Dashboard
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Comprehensive analytics and insights
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="px-3 py-2 rounded"
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded font-medium"
            style={{ background: 'var(--brand-primary)', color: 'var(--text-on-brand)' }}
          >
            Export CSV
          </button>
        </div>
      </header>

      {/* Revenue Trends */}
      <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Revenue Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.revenueTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
            <XAxis dataKey="date" stroke="var(--text-secondary)" />
            <YAxis stroke="var(--text-secondary)" />
            <Tooltip contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--border-primary)' }} />
            <Legend />
            <Line type="monotone" dataKey="mrr" stroke="#10b981" name="MRR" />
            <Line type="monotone" dataKey="arr" stroke="#3b82f6" name="ARR" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* User Growth */}
      <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>User Growth</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.userGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
            <XAxis dataKey="date" stroke="var(--text-secondary)" />
            <YAxis stroke="var(--text-secondary)" />
            <Tooltip contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--border-primary)' }} />
            <Legend />
            <Bar dataKey="newUsers" fill="#10b981" name="New Users" />
            <Bar dataKey="activeUsers" fill="#3b82f6" name="Active Users" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Conversion Funnel */}
      <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Conversion Funnel</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.conversionFunnel} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
            <XAxis type="number" stroke="var(--text-secondary)" />
            <YAxis dataKey="stage" type="category" stroke="var(--text-secondary)" />
            <Tooltip contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--border-primary)' }} />
            <Bar dataKey="count" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Clients & Features */}
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Top Clients by Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topClientsByRevenue.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis dataKey="name" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--border-primary)' }} />
              <Bar dataKey="revenue" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Top Features by Usage</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topFeatures}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis dataKey="feature" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--border-primary)' }} />
              <Bar dataKey="usage" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

