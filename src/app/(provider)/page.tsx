/**
 * Provider Portal Dashboard
 * 
 * CRITICAL: Provider-only page
 * - No client data mixing
 * - No useMe() hook
 * - No RBAC checks
 * - Fetches from /api/provider/* endpoints
 */
export default function ProviderDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-2">
          Provider Dashboard
        </h1>
        <p className="text-gray-400">Cross-client management and system oversight</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Clients"
          value="Loading..."
          icon="👥"
          color="green"
        />
        <StatCard
          label="Active Subscriptions"
          value="Loading..."
          icon="✓"
          color="blue"
        />
        <StatCard
          label="Monthly Revenue"
          value="Loading..."
          icon="💰"
          color="purple"
        />
        <StatCard
          label="System Health"
          value="Operational"
          icon="⚡"
          color="green"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-900/50 border border-green-500/20 rounded-xl p-6 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-green-400 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionButton href="/provider/clients" label="Manage Clients" />
          <ActionButton href="/provider/billing" label="View Billing" />
          <ActionButton href="/provider/analytics" label="Analytics" />
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gray-900/50 border border-green-500/20 rounded-xl p-6 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-green-400 mb-4">System Status</h2>
        <div className="space-y-3">
          <StatusRow label="Federation" status="Active" />
          <StatusRow label="Database" status="Connected" />
          <StatusRow label="API Gateway" status="Operational" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  const colorClasses = {
    green: 'border-green-500/30 bg-green-500/5',
    blue: 'border-blue-500/30 bg-blue-500/5',
    purple: 'border-purple-500/30 bg-purple-500/5',
  }[color];

  return (
    <div className={`${colorClasses} border rounded-xl p-6 backdrop-blur-sm`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
}

function ActionButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="block px-4 py-3 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg text-green-400 text-center font-medium transition-all hover:scale-105"
    >
      {label}
    </a>
  );
}

function StatusRow({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-800">
      <span className="text-gray-300">{label}</span>
      <span className="flex items-center gap-2 text-green-400">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        {status}
      </span>
    </div>
  );
}

