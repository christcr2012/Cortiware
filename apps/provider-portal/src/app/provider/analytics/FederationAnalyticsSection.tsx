'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, TrendingUp, AlertTriangle, Users } from 'lucide-react';

type FederatedClient = {
  id: string;
  name: string;
  monthlyRevenue: number;
  convertedLeads: number;
  lastSeen: string | null;
};

type EscalationTicket = {
  id: string;
  state: string;
  severity: string;
  createdAt: string;
};

export default function FederationAnalyticsSection() {
  const [clients, setClients] = useState<FederatedClient[]>([]);
  const [escalations, setEscalations] = useState<EscalationTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientsRes, escalationsRes] = await Promise.all([
        fetch('/api/federation/clients'),
        fetch('/api/federation/escalations'),
      ]);

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData.clients || []);
      }

      if (escalationsRes.ok) {
        const escalationsData = await escalationsRes.json();
        setEscalations(escalationsData.escalations || []);
      }
    } catch (error) {
      console.error('Error fetching federation analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = {
    totalClients: clients.length,
    activeEscalations: escalations.filter(e => !['rolled_out', 'rolled_back'].includes(e.state)).length,
    monthlyRevenue: clients.reduce((sum, c) => sum + c.monthlyRevenue, 0),
    totalLeads: clients.reduce((sum, c) => sum + c.convertedLeads, 0),
  };

  // Prepare escalation trends data (last 7 days)
  const escalationTrends = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    
    const dayEscalations = escalations.filter(e => {
      const escalationDate = new Date(e.createdAt).toISOString().split('T')[0];
      return escalationDate === dateStr;
    });

    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: dayEscalations.length,
      critical: dayEscalations.filter(e => e.severity === 'critical').length,
      high: dayEscalations.filter(e => e.severity === 'high').length,
    };
  });

  // Top clients by revenue
  const topClientsByRevenue = [...clients]
    .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
    .slice(0, 5)
    .map(c => ({
      name: c.name.length > 20 ? c.name.substring(0, 20) + '...' : c.name,
      revenue: c.monthlyRevenue / 100,
    }));

  // Top clients by lead conversion
  const topClientsByLeads = [...clients]
    .sort((a, b) => b.convertedLeads - a.convertedLeads)
    .slice(0, 5)
    .map(c => ({
      name: c.name.length > 20 ? c.name.substring(0, 20) + '...' : c.name,
      leads: c.convertedLeads,
    }));

  if (loading) {
    return (
      <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
        Loading federation analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Federation Analytics
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Monitor federation performance, revenue, and escalation trends
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl p-6" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-primary)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg" style={{ background: 'var(--brand-primary)20' }}>
              <Users className="h-5 w-5" style={{ color: 'var(--brand-primary)' }} />
            </div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Total Federated Clients
            </div>
          </div>
          <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {stats.totalClients}
          </div>
        </div>

        <div className="rounded-xl p-6" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-primary)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg" style={{ background: 'var(--accent-warning)20' }}>
              <AlertTriangle className="h-5 w-5" style={{ color: 'var(--accent-warning)' }} />
            </div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Active Escalations
            </div>
          </div>
          <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {stats.activeEscalations}
          </div>
        </div>

        <div className="rounded-xl p-6" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-primary)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg" style={{ background: 'var(--accent-success)20' }}>
              <DollarSign className="h-5 w-5" style={{ color: 'var(--accent-success)' }} />
            </div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Monthly Federation Revenue
            </div>
          </div>
          <div className="text-3xl font-bold" style={{ color: 'var(--accent-success)' }}>
            ${(stats.monthlyRevenue / 100).toLocaleString()}
          </div>
        </div>

        <div className="rounded-xl p-6" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-primary)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg" style={{ background: 'var(--accent-info)20' }}>
              <TrendingUp className="h-5 w-5" style={{ color: 'var(--accent-info)' }} />
            </div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Total Converted Leads
            </div>
          </div>
          <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {stats.totalLeads}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Escalation Trends */}
        <div className="rounded-xl p-6" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-primary)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Escalation Trends (7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={escalationTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
              <XAxis dataKey="date" stroke="var(--text-secondary)" style={{ fontSize: '12px' }} />
              <YAxis stroke="var(--text-secondary)" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="var(--brand-primary)" strokeWidth={2} name="Total" />
              <Line type="monotone" dataKey="critical" stroke="var(--accent-error)" strokeWidth={2} name="Critical" />
              <Line type="monotone" dataKey="high" stroke="var(--accent-warning)" strokeWidth={2} name="High" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Clients by Revenue */}
        <div className="rounded-xl p-6" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-primary)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Top Clients by Revenue
          </h3>
          {topClientsByRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topClientsByRevenue} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
                <XAxis type="number" stroke="var(--text-secondary)" style={{ fontSize: '12px' }} />
                <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" style={{ fontSize: '12px' }} width={120} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
                <Bar dataKey="revenue" fill="var(--accent-success)" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
              No revenue data available
            </div>
          )}
        </div>

        {/* Top Clients by Lead Conversion */}
        <div className="rounded-xl p-6" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-primary)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Top Clients by Lead Conversion
          </h3>
          {topClientsByLeads.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topClientsByLeads} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
                <XAxis type="number" stroke="var(--text-secondary)" style={{ fontSize: '12px' }} />
                <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" style={{ fontSize: '12px' }} width={120} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                />
                <Bar dataKey="leads" fill="var(--accent-info)" name="Converted Leads" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
              No lead conversion data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

