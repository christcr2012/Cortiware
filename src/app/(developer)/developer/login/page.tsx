import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function DeveloperLoginPage() {
  const cookieStore = await cookies();

  if (cookieStore.get('rs_developer') || cookieStore.get('developer-session') || cookieStore.get('ws_developer')) {
    redirect('/developer');
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 100%)' }}
    >
      <div className="max-w-md w-full bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-green-500/30">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-2">
            Robinson Solutions
          </h1>
          <p className="text-green-400/70 text-sm font-mono tracking-wider">DEVELOPER PORTAL</p>
          <p className="text-gray-400 text-xs mt-2">Secure Developer Access</p>
        </div>

        <form method="POST" action="/api/developer/login" className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Developer Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className="w-full px-4 py-3 bg-black/50 border border-green-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-mono"
              placeholder="developer-username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Developer Password
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
            DEVELOPER LOGIN
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 font-mono">DEVELOPER AUTHENTICATION SYSTEM</p>
          <p className="text-xs text-gray-600 mt-1">Environment-Based • Cross-Client Access</p>
        </div>
      </div>
    </div>
  );
}

