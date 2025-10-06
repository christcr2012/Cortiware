import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your account and portal preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme Settings Card */}
        <Link href="/settings/theme">
          <div
            className="rounded-xl p-6 transition-all cursor-pointer group"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-primary)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                style={{ background: 'var(--surface-hover)' }}
              >
                <svg className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <svg className="w-5 h-5 transition-colors" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 transition-colors" style={{ color: 'var(--text-primary)' }}>
              Theme Customization
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Choose from 15 premium themes to customize your portal appearance
            </p>
          </div>
        </Link>

        {/* Security Settings Card */}
        <Link href="/settings/security">
          <div
            className="rounded-xl p-6 transition-all cursor-pointer group"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--border-primary)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                style={{ background: 'var(--surface-hover)' }}
              >
                <svg className="w-6 h-6" style={{ color: 'var(--brand-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <svg className="w-5 h-5 transition-colors" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 transition-colors" style={{ color: 'var(--text-primary)' }}>
              Security
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Manage your password, two-factor authentication, and security preferences
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

