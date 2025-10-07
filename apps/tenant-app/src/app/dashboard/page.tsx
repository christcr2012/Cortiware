import { getAuthContext } from '@/lib/auth-context';
import { redirect } from 'next/navigation';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

export default async function DashboardPage() {
  const authContext = await getAuthContext();

  // Require authentication
  if (!authContext.isAuthenticated) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--bg-main)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Dashboard
          </h1>
          <ThemeSwitcher />
        </div>
        <div className="premium-card p-6">

          <div className="space-y-4">
            <div className="p-4 rounded-lg" style={{
              borderLeft: '4px solid var(--brand-primary)',
              background: 'var(--surface-2)'
            }}>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Welcome to Tenant App
              </h2>
              <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
                You are logged in as: <strong>{authContext.email}</strong>
              </p>
              {authContext.role && (
                <p style={{ color: 'var(--text-secondary)' }}>
                  Role: <strong>{authContext.role}</strong>
                </p>
              )}
              {authContext.isDirectAccess && (
                <p className="font-semibold mt-2" style={{ color: 'var(--accent-warning)' }}>
                  ⚠️ Direct Access Mode - Single tenant context only
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-primary)' }}>
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Tenants</h3>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage tenant accounts</p>
              </div>
              <div className="p-4 rounded" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-primary)' }}>
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Users</h3>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage user access</p>
              </div>
              <div className="p-4 rounded" style={{ background: 'var(--surface-2)', border: '1px solid var(--border-primary)' }}>
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Settings</h3>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Configure your account</p>
              </div>
            </div>

            <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-primary)' }}>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Authentication Details</h3>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt style={{ color: 'var(--text-tertiary)' }}>Email:</dt>
                  <dd className="font-mono" style={{ color: 'var(--text-primary)' }}>{authContext.email || 'N/A'}</dd>
                </div>
                <div>
                  <dt style={{ color: 'var(--text-tertiary)' }}>Role:</dt>
                  <dd className="font-mono" style={{ color: 'var(--text-primary)' }}>{authContext.role || 'N/A'}</dd>
                </div>
                <div>
                  <dt style={{ color: 'var(--text-tertiary)' }}>User ID:</dt>
                  <dd className="font-mono" style={{ color: 'var(--text-primary)' }}>{authContext.userId || 'N/A'}</dd>
                </div>
                <div>
                  <dt style={{ color: 'var(--text-tertiary)' }}>Direct Access:</dt>
                  <dd className="font-mono" style={{ color: 'var(--text-primary)' }}>{authContext.isDirectAccess ? 'Yes' : 'No'}</dd>
                </div>
                {authContext.providerId && (
                  <div>
                    <dt style={{ color: 'var(--text-tertiary)' }}>Provider ID:</dt>
                    <dd className="font-mono" style={{ color: 'var(--text-primary)' }}>{authContext.providerId}</dd>
                  </div>
                )}
                {authContext.developerId && (
                  <div>
                    <dt style={{ color: 'var(--text-tertiary)' }}>Developer ID:</dt>
                    <dd className="font-mono" style={{ color: 'var(--text-primary)' }}>{authContext.developerId}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

