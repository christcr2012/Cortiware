import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

/**
 * Developer Dashboard - System Development & Testing
 *
 * Uses theme CSS variables for dynamic theming
 * Development tools and system access
 */
export default async function DeveloperDashboard() {
  const cookieStore = await cookies();

  // Verify developer authentication
  if (!cookieStore.get('rs_developer') && !cookieStore.get('developer-session') && !cookieStore.get('ws_developer')) {
    redirect('/login');
  }

  const developerEmail = cookieStore.get('rs_developer')?.value ||
                         cookieStore.get('developer-session')?.value ||
                         cookieStore.get('ws_developer')?.value ||
                         'developer@system';

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
              Developer Portal
            </h1>
            <p
              className="text-sm font-mono tracking-wider"
              style={{ color: 'var(--brand-primary)', opacity: 0.7 }}
            >
              SYSTEM DEVELOPMENT • TESTING TOOLS • API ACCESS
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Logged in as</p>
            <p className="font-mono" style={{ color: 'var(--brand-primary)' }}>{developerEmail}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* API Calls */}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-3xl font-bold" style={{ color: 'var(--brand-primary)' }}>0</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>API Calls Today</p>
          </div>

          {/* Test Runs */}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="text-3xl font-bold" style={{ color: 'var(--brand-primary)' }}>0</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Test Runs</p>
          </div>

          {/* Build Status */}
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
              <span className="text-sm font-bold" style={{ color: 'var(--brand-primary)' }}>PASSING</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Build Status</p>
          </div>

          {/* System Load */}
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
              <span className="text-3xl font-bold" style={{ color: 'var(--brand-primary)' }}>12%</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>System Load</p>
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
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--brand-primary)' }}>Development Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              className="p-4 rounded-lg transition-all text-left"
              style={{
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-accent)',
              }}
            >
              <div className="font-semibold mb-1" style={{ color: 'var(--brand-primary)' }}>API Documentation</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>View API endpoints and test requests</div>
            </button>
            <button
              className="p-4 rounded-lg transition-all text-left"
              style={{
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-accent)',
              }}
            >
              <div className="font-semibold mb-1" style={{ color: 'var(--brand-primary)' }}>Database Console</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Query and manage database directly</div>
            </button>
            <button
              className="p-4 rounded-lg transition-all text-left"
              style={{
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-accent)',
              }}
            >
              <div className="font-semibold mb-1" style={{ color: 'var(--brand-primary)' }}>System Logs</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>View real-time application logs</div>
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
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: 'var(--surface-2)' }}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                ></div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Developer login successful</p>
                  <p className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>{developerEmail}</p>
                </div>
              </div>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Just now</span>
            </div>
            <div className="text-center py-8" style={{ color: 'var(--text-tertiary)' }}>
              <p className="text-sm">No recent activity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-8 text-center">
        <p className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>ROBINSON AI SYSTEMS • DEVELOPER PORTAL • SYSTEM ACCESS</p>
      </div>
    </div>
  );
}

