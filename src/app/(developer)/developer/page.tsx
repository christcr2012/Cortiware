import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

/**
 * Developer Dashboard - System Development & Testing
 *
 * Green futuristic theme
 * Development tools and system access
 */
export default async function DeveloperDashboard() {
  const cookieStore = await cookies();

  // Verify developer authentication
  if (!cookieStore.get('rs_developer') && !cookieStore.get('developer-session') && !cookieStore.get('ws_developer')) {
    redirect('/developer/login');
  }

  const developerEmail = cookieStore.get('rs_developer')?.value ||
                         cookieStore.get('developer-session')?.value ||
                         cookieStore.get('ws_developer')?.value ||
                         'developer@system';

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
              Developer Portal
            </h1>
            <p className="text-green-400/70 text-sm font-mono tracking-wider">
              SYSTEM DEVELOPMENT • TESTING TOOLS • API ACCESS
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Logged in as</p>
            <p className="text-green-400 font-mono">{developerEmail}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* API Calls */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 hover:border-green-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-green-400">0</span>
            </div>
            <p className="text-gray-400 text-sm">API Calls Today</p>
          </div>

          {/* Test Runs */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 hover:border-green-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-green-400">0</span>
            </div>
            <p className="text-gray-400 text-sm">Test Runs</p>
          </div>

          {/* Build Status */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 hover:border-green-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-bold text-green-400">PASSING</span>
            </div>
            <p className="text-gray-400 text-sm">Build Status</p>
          </div>

          {/* System Load */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 hover:border-green-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-green-400">12%</span>
            </div>
            <p className="text-gray-400 text-sm">System Load</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-4">Development Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 hover:border-green-500/50 rounded-lg transition-all text-left">
              <div className="text-green-400 font-semibold mb-1">API Documentation</div>
              <div className="text-gray-400 text-sm">View API endpoints and test requests</div>
            </button>
            <button className="p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 hover:border-green-500/50 rounded-lg transition-all text-left">
              <div className="text-green-400 font-semibold mb-1">Database Console</div>
              <div className="text-gray-400 text-sm">Query and manage database directly</div>
            </button>
            <button className="p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 hover:border-green-500/50 rounded-lg transition-all text-left">
              <div className="text-green-400 font-semibold mb-1">System Logs</div>
              <div className="text-gray-400 text-sm">View real-time application logs</div>
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
                  <p className="text-gray-300 text-sm">Developer login successful</p>
                  <p className="text-gray-500 text-xs font-mono">{developerEmail}</p>
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
        <p className="text-xs text-gray-600 font-mono">ROBINSON SOLUTIONS • DEVELOPER PORTAL • SYSTEM ACCESS</p>
      </div>
    </div>
  );
}

