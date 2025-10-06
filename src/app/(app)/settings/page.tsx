import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-400">
          Manage your account and portal preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Theme Settings Card */}
        <Link href="/settings/theme">
          <div 
            className="rounded-xl border border-white/10 p-6 hover:border-white/20 transition-all cursor-pointer group"
            style={{
              background: 'linear-gradient(135deg, rgba(17,24,39,0.8) 0%, rgba(31,41,55,0.8) 100%)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
              Theme Customization
            </h2>
            <p className="text-gray-400 text-sm">
              Choose from 15 premium themes to customize your portal appearance
            </p>
          </div>
        </Link>

        {/* Security Settings Card */}
        <Link href="/settings/security">
          <div 
            className="rounded-xl border border-white/10 p-6 hover:border-white/20 transition-all cursor-pointer group"
            style={{
              background: 'linear-gradient(135deg, rgba(17,24,39,0.8) 0%, rgba(31,41,55,0.8) 100%)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
              Security
            </h2>
            <p className="text-gray-400 text-sm">
              Manage your password, two-factor authentication, and security preferences
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}

