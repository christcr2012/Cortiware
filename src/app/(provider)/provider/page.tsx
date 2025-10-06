import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getProviderStats, getRecentActivity } from '@/services/provider/stats.service';

/**
 * Provider Dashboard - Cross-Client Administration
 *
 * Uses theme CSS variables for dynamic theming
 * Full system access
 * Cross-client context
 */
export default async function ProviderDashboardPage() {
  const cookieStore = await cookies();

  // Verify provider authentication
  if (!cookieStore.get('rs_provider') && !cookieStore.get('provider-session') && !cookieStore.get('ws_provider')) {
    redirect('/login');
  }

  const providerEmail = cookieStore.get('rs_provider')?.value ||
                        cookieStore.get('provider-session')?.value ||
                        cookieStore.get('ws_provider')?.value ||
                        'provider@system';

  // Fetch real statistics
  const stats = await getProviderStats();
  const recentActivity = await getRecentActivity(5);

  return (
    <div
      className="min-h-screen p-8"
      style={{ background: 'var(--bg-main)' }}
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-4xl font-bold bg-clip-text text-transparent mb-2"
              style={{ backgroundImage: 'var(--brand-gradient)' }}
            >
              Provider Portal
            </h1>
            <p
              className="text-sm font-mono tracking-wider"
              style={{ color: 'var(--brand-primary)', opacity: 0.7 }}
            >
              CROSS-CLIENT ADMINISTRATION • SYSTEM-LEVEL ACCESS
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Logged in as</p>
            <p className="font-mono" style={{ color: 'var(--brand-primary)' }}>{providerEmail}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Clients */}
          <div
            className="backdrop-blur-sm rounded-xl p-6 transition-all"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-accent)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--surface-hover)' }}
              >
                <svg className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-3xl font-bold" style={{ color: 'var(--brand-primary)' }}>{stats.totalClients}</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Clients</p>
          </div>

          {/* Active Users */}
          <div
            className="backdrop-blur-sm rounded-xl p-6 transition-all"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-accent)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--surface-hover)' }}
              >
                <svg className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className="text-3xl font-bold" style={{ color: 'var(--brand-primary)' }}>{stats.activeUsers}</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Active Users (30d)</p>
          </div>

          {/* System Health */}
          <div
            className="backdrop-blur-sm rounded-xl p-6 transition-all"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-accent)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--surface-hover)' }}
              >
                <svg className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-3xl font-bold" style={{ color: 'var(--brand-primary)' }}>{stats.systemHealth}%</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>System Health</p>
          </div>

          {/* API Status */}
          <div
            className="backdrop-blur-sm rounded-xl p-6 transition-all"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-accent)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--surface-hover)' }}
              >
                <svg className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-sm font-bold" style={{ color: 'var(--brand-primary)' }}>{stats.apiStatus}</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>API Status</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className="backdrop-blur-sm rounded-xl p-6 mb-8"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--border-accent)',
          }}
        >
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--brand-primary)' }}>Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              className="p-4 rounded-lg transition-all text-left"
              style={{
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-accent)',
              }}
            >
              <div className="font-semibold mb-1" style={{ color: 'var(--brand-primary)' }}>Manage Clients</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>View and manage all client organizations</div>
            </button>
            <button
              className="p-4 rounded-lg transition-all text-left"
              style={{
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-accent)',
              }}
            >
              <div className="font-semibold mb-1" style={{ color: 'var(--brand-primary)' }}>System Configuration</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Configure platform settings and features</div>
            </button>
            <button
              className="p-4 rounded-lg transition-all text-left"
              style={{
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-accent)',
              }}
            >
              <div className="font-semibold mb-1" style={{ color: 'var(--brand-primary)' }}>View Audit Logs</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Review system activity and security events</div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div
          className="backdrop-blur-sm rounded-xl p-6"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--border-accent)',
          }}
        >
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--brand-primary)' }}>Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: 'var(--surface-2)' }}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: activity.type === 'invoice_paid'
                          ? 'rgb(34, 197, 94)'
                          : activity.type === 'user_signup'
                          ? 'rgb(59, 130, 246)'
                          : 'var(--brand-primary)'
                      }}
                    ></div>
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{activity.message}</p>
                      {activity.orgName && (
                        <p className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>{activity.orgName}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {formatRelativeTime(activity.timestamp)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8" style={{ color: 'var(--text-tertiary)' }}>
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-8 text-center">
        <p className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>ROBINSON AI SYSTEMS • PROVIDER PORTAL • SYSTEM ACCESS</p>
      </div>
    </div>
  );
}

/**
 * Format timestamp as relative time
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

