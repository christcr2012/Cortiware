import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

/**
 * Provider Dashboard - Cross-Client Administration
 * 
 * Green futuristic theme
 * Full system access
 * Cross-client context
 */
export default async function ProviderDashboardPage() {
  const cookieStore = await cookies();

  // Verify provider authentication
  if (!cookieStore.get('rs_provider') && !cookieStore.get('provider-session') && !cookieStore.get('ws_provider')) {
    redirect('/provider/login');
  }

  const providerEmail = cookieStore.get('rs_provider')?.value || 
                        cookieStore.get('provider-session')?.value || 
                        cookieStore.get('ws_provider')?.value || 
                        'provider@system';

  return (
    <div
      className="min-h-screen p-8"
      style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 100%)' }}
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-2">
              Provider Portal
            </h1>
            <p className="text-green-400/70 text-sm font-mono tracking-wider">
              CROSS-CLIENT ADMINISTRATION • SYSTEM-LEVEL ACCESS
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Logged in as</p>
            <p className="text-green-400 font-mono">{providerEmail}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Clients */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 hover:border-green-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-green-400">0</span>
            </div>
            <p className="text-gray-400 text-sm">Total Clients</p>
          </div>

          {/* Active Users */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 hover:border-green-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-green-400">0</span>
            </div>
            <p className="text-gray-400 text-sm">Active Users</p>
          </div>

          {/* System Health */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 hover:border-green-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-green-400">100%</span>
            </div>
            <p className="text-gray-400 text-sm">System Health</p>
          </div>

          {/* API Status */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 hover:border-green-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-green-400">ONLINE</span>
            </div>
            <p className="text-gray-400 text-sm">API Status</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 hover:border-green-500/50 rounded-lg transition-all text-left">
              <div className="text-green-400 font-semibold mb-1">Manage Clients</div>
              <div className="text-gray-400 text-sm">View and manage all client organizations</div>
            </button>
            <button className="p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 hover:border-green-500/50 rounded-lg transition-all text-left">
              <div className="text-green-400 font-semibold mb-1">System Configuration</div>
              <div className="text-gray-400 text-sm">Configure platform settings and features</div>
            </button>
            <button className="p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 hover:border-green-500/50 rounded-lg transition-all text-left">
              <div className="text-green-400 font-semibold mb-1">View Audit Logs</div>
              <div className="text-gray-400 text-sm">Review system activity and security events</div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
          <h2 className="text-xl font-bold text-green-400 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <div>
                  <p className="text-gray-300 text-sm">Provider login successful</p>
                  <p className="text-gray-500 text-xs font-mono">{providerEmail}</p>
                </div>
              </div>
              <span className="text-gray-500 text-xs">Just now</span>
            </div>
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No recent activity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-8 text-center">
        <p className="text-xs text-gray-600 font-mono">ROBINSON SOLUTIONS • PROVIDER PORTAL • SYSTEM ACCESS</p>
      </div>
    </div>
  );
}

