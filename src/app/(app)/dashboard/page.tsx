'use client';

import { useEffect, useState } from 'react';

/**
 * Client Dashboard - For CLIENT TENANT USERS ONLY
 * Uses mv_user cookie authentication and RBAC permissions
 */

type SummaryKpis = {
  totalLeads90d: number;
  converted90d: number;
  rfp90d: number;
  hot90d: number;
  cold90d: number;
  monthBillableCount: number;
  monthBillableAmountUSD: number;
};

export default function DashboardPage() {
  const [kpis, setKpis] = useState<SummaryKpis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSummary() {
      try {
        const res = await fetch('/api/dashboard/summary');
        const data = await res.json();
        if (data.ok) {
          setKpis(data.kpis);
        }
      } catch (error) {
        console.error('Failed to load dashboard summary:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSummary();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Overview of your workflow management</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          label="Total Leads (90d)"
          value={kpis?.totalLeads90d ?? 0}
          icon="📊"
          color="blue"
        />
        <KpiCard
          label="Converted (90d)"
          value={kpis?.converted90d ?? 0}
          icon="✓"
          color="green"
        />
        <KpiCard
          label="Hot Leads"
          value={kpis?.hot90d ?? 0}
          icon="🔥"
          color="red"
        />
        <KpiCard
          label="RFP Leads"
          value={kpis?.rfp90d ?? 0}
          icon="📄"
          color="purple"
        />
      </div>

      {/* Billing Summary */}
      {kpis && kpis.monthBillableCount > 0 && (
        <div
          className="rounded-xl p-6"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--border-accent)',
          }}
        >
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Billing Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{kpis.monthBillableCount}</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Billable Leads This Month</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: 'var(--brand-primary)' }}>
                ${kpis.monthBillableAmountUSD.toLocaleString()}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Amount</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div
        className="rounded-xl p-6"
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--border-accent)',
        }}
      >
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionButton href="/leads" label="View Leads" />
          <ActionButton href="/contacts" label="Manage Contacts" />
          <ActionButton href="/opportunities" label="Track Opportunities" />
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  // Use theme CSS variables instead of hardcoded colors
  const colorStyles = {
    blue: { border: '1px solid var(--border-accent)', background: 'var(--glass-bg)' },
    green: { border: '1px solid var(--border-accent)', background: 'var(--glass-bg)' },
    red: { border: '1px solid var(--border-accent)', background: 'var(--glass-bg)' },
    purple: { border: '1px solid var(--border-accent)', background: 'var(--glass-bg)' },
  }[color];

  return (
    <div className="rounded-xl p-6" style={colorStyles}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{value.toLocaleString()}</div>
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</div>
    </div>
  );
}

function ActionButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="block px-4 py-3 rounded-lg text-center font-medium transition-all"
      style={{
        background: 'var(--surface-hover)',
        border: '1px solid var(--border-accent)',
        color: 'var(--brand-primary)',
      }}
    >
      {label}
    </a>
  );
}

