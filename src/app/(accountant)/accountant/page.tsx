import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

/**
 * Accountant Dashboard - Financial Operations & Reporting
 *
 * Green futuristic theme
 * Client-side with special implementation
 */
export default async function AccountantDashboard() {
  const cookieStore = await cookies();

  // Verify accountant authentication
  if (!cookieStore.get('rs_accountant') && !cookieStore.get('accountant-session')) {
    redirect('/login');
  }

  const accountantEmail = cookieStore.get('rs_accountant')?.value ||
                          cookieStore.get('accountant-session')?.value ||
                          'accountant@system';

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
              Accountant Portal
            </h1>
            <p className="text-green-400/70 text-sm font-mono tracking-wider">
              FINANCIAL OPERATIONS • REPORTING • COMPLIANCE
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Logged in as</p>
            <p className="text-green-400 font-mono">{accountantEmail}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 hover:border-green-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-green-400">$0</span>
            </div>
            <p className="text-gray-400 text-sm">Total Revenue</p>
          </div>

          {/* Invoices */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 hover:border-green-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-green-400">0</span>
            </div>
            <p className="text-gray-400 text-sm">Pending Invoices</p>
          </div>

          {/* Expenses */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 hover:border-green-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-green-400">$0</span>
            </div>
            <p className="text-gray-400 text-sm">Monthly Expenses</p>
          </div>

          {/* Reports */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 hover:border-green-500/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-green-400">0</span>
            </div>
            <p className="text-gray-400 text-sm">Reports Generated</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-4">Financial Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 hover:border-green-500/50 rounded-lg transition-all text-left">
              <div className="text-green-400 font-semibold mb-1">Generate Report</div>
              <div className="text-gray-400 text-sm">Create financial reports and statements</div>
            </button>
            <button className="p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 hover:border-green-500/50 rounded-lg transition-all text-left">
              <div className="text-green-400 font-semibold mb-1">Manage Invoices</div>
              <div className="text-gray-400 text-sm">View and process client invoices</div>
            </button>
            <button className="p-4 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 hover:border-green-500/50 rounded-lg transition-all text-left">
              <div className="text-green-400 font-semibold mb-1">Expense Tracking</div>
              <div className="text-gray-400 text-sm">Monitor and categorize expenses</div>
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
                  <p className="text-gray-300 text-sm">Accountant login successful</p>
                  <p className="text-gray-500 text-xs font-mono">{accountantEmail}</p>
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
        <p className="text-xs text-gray-600 font-mono">ROBINSON SOLUTIONS • ACCOUNTANT PORTAL • FINANCIAL ACCESS</p>
      </div>
    </div>
  );
}

