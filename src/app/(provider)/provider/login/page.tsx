import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

/**
 * Provider Login Page - SEPARATE from client login
 * - Environment-based authentication (NOT database)
 * - Separate cookie: rs_provider (legacy provider-session/ws_provider accepted during transition)
 */
export default async function ProviderLoginPage() {
  const cookieStore = await cookies();

  // Already logged in as provider (accept legacy cookies during transition)
  if (cookieStore.get('rs_provider') || cookieStore.get('provider-session') || cookieStore.get('ws_provider')) {
    redirect('/provider');
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 100%)' }}
    >
      <div className="max-w-md w/full bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-green-500/30">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-2">
            Robinson Solutions
          </h1>
          <p className="text-green-400/70 text-sm font-mono tracking-wider">PROVIDER PORTAL</p>
          <p className="text-gray-400 text-xs mt-2">Secure Provider Access</p>
        </div>

        <form method="POST" action="/api/provider/login" className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Provider Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-mono"
              placeholder="provider-username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Provider Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-mono"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg shadow-green-500/20"
          >
            PROVIDER LOGIN
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 font-mono">PROVIDER AUTHENTICATION SYSTEM</p>
          <p className="text-xs text-gray-600 mt-1">Environment-Based • Cross-Client Access</p>
        </div>
      </div>
    </div>
  );
}

