import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getAccountantStats, getRecentTransactions } from '@/services/accountant/stats.service';

/**
 * Accountant Dashboard - Financial Operations & Reporting
 *
 * Uses client scope theme (controlled by Owner)
 * Accountant portal respects the Owner's theme selection
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

  // Fetch real statistics
  const stats = await getAccountantStats();
  const recentTransactions = await getRecentTransactions(5);

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
              Accountant Portal
            </h1>
            <p
              className="text-sm font-mono tracking-wider"
              style={{ color: 'var(--brand-primary)', opacity: 0.7 }}
            >
              FINANCIAL OPERATIONS • REPORTING • COMPLIANCE
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Logged in as</p>
            <p className="font-mono" style={{ color: 'var(--brand-primary)' }}>{accountantEmail}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-3xl font-bold" style={{ color: 'var(--brand-primary)' }}>${stats.totalRevenue.toFixed(2)}</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Revenue</p>
          </div>

          {/* Total Invoices */}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-3xl font-bold" style={{ color: 'var(--brand-primary)' }}>{stats.invoiceCount}</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Invoices</p>
          </div>

          {/* Pending Payments */}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <span className="text-3xl font-bold" style={{ color: 'var(--brand-primary)' }}>{stats.pendingPayments}</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Pending Payments</p>
          </div>

          {/* Overdue Invoices */}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-3xl font-bold" style={{ color: 'var(--brand-primary)' }}>{stats.overdueInvoices}</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Overdue Invoices</p>
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
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--brand-primary)' }}>Financial Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              className="p-4 rounded-lg transition-all text-left"
              style={{
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-accent)',
              }}
            >
              <div className="font-semibold mb-1" style={{ color: 'var(--brand-primary)' }}>Generate Report</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Create financial reports and statements</div>
            </button>
            <button
              className="p-4 rounded-lg transition-all text-left"
              style={{
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-accent)',
              }}
            >
              <div className="font-semibold mb-1" style={{ color: 'var(--brand-primary)' }}>Manage Invoices</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>View and process client invoices</div>
            </button>
            <button
              className="p-4 rounded-lg transition-all text-left"
              style={{
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-accent)',
              }}
            >
              <div className="font-semibold mb-1" style={{ color: 'var(--brand-primary)' }}>Expense Tracking</div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Monitor and categorize expenses</div>
            </button>
          </div>
        </div>

        {/* Recent Transactions */}
        <div
          className="backdrop-blur-sm rounded-xl p-6"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--border-accent)',
          }}
        >
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--brand-primary)' }}>Recent Transactions</h2>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: 'var(--surface-2)' }}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: transaction.type === 'invoice_paid'
                          ? 'rgb(34, 197, 94)'
                          : transaction.type === 'invoice_issued'
                          ? 'rgb(59, 130, 246)'
                          : 'var(--brand-primary)'
                      }}
                    ></div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {transaction.type === 'invoice_paid' ? 'Payment Received' : 'Invoice Issued'}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {transaction.orgName} • ${transaction.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase font-mono" style={{
                      color: transaction.status === 'paid'
                        ? 'rgb(34, 197, 94)'
                        : 'rgb(234, 179, 8)'
                    }}>
                      {transaction.status}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {formatRelativeTime(transaction.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8" style={{ color: 'var(--text-tertiary)' }}>
                <p className="text-sm">No recent transactions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto mt-8 text-center">
        <p className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>ROBINSON AI SYSTEMS • ACCOUNTANT PORTAL • FINANCIAL ACCESS</p>
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

