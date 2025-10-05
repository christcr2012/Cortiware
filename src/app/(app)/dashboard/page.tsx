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
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Overview of your workflow management</p>
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
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Billing Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-white">{kpis.monthBillableCount}</div>
              <div className="text-sm text-gray-400">Billable Leads This Month</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                ${kpis.monthBillableAmountUSD.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Amount</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
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
  const colorClasses = {
    blue: 'border-blue-500/30 bg-blue-500/5',
    green: 'border-green-500/30 bg-green-500/5',
    red: 'border-red-500/30 bg-red-500/5',
    purple: 'border-purple-500/30 bg-purple-500/5',
  }[color];

  return (
    <div className={`${colorClasses} border rounded-xl p-6`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-3xl font-bold text-white mb-1">{value.toLocaleString()}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

function ActionButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="block px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-blue-400 text-center font-medium transition-all"
    >
      {label}
    </a>
  );
}

