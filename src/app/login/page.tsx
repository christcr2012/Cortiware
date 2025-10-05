import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

/**
 * Login page for CLIENT TENANT USERS ONLY
 * Provider/Developer/Accountant have separate authentication flows
 */
export default async function LoginPage(
  props: { searchParams?: Promise<Record<string, string | string[] | undefined>> }
) {
  const cookieStore = await cookies();
  const spAny: any = props.searchParams ? await props.searchParams : {};
  const error = typeof spAny.error === 'string' ? spAny.error : Array.isArray(spAny.error) ? spAny.error[0] : undefined;
  const next = typeof spAny.next === 'string' ? spAny.next : Array.isArray(spAny.next) ? spAny.next[0] : '/dashboard';
  
  // Already logged in as client user (accept legacy mv_user during transition)
  const hasTenant = cookieStore.get('rs_user') || cookieStore.get('mv_user');
  if (hasTenant) {
    redirect('/dashboard');
  }
  

  
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 100%)' }}>
      <div className="max-w-md w-full bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-green-500/30">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-2">
            Robinson Solutions
          </h1>
          <p className="text-green-400/70 text-sm font-mono tracking-wider">UNIFIED LOGIN • ALL PORTALS</p>
          <p className="text-gray-400 text-xs mt-2">Provider • Developer • Accountant • Client Access</p>
        </div>

        {error === 'missing' && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 backdrop-blur-sm">
            <p className="text-sm text-red-400">⚠️ Please enter email and password.</p>
          </div>
        )}

        {error === 'invalid' && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 backdrop-blur-sm">
            <p className="text-sm text-red-400">❌ Invalid email or password.</p>
          </div>
        )}

        {error === 'server' && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 backdrop-blur-sm">
            <p className="text-sm text-red-400">🔥 Server error. Please try again.</p>
          </div>
        )}

        <form method="POST" action="/api/auth/login" className="space-y-6">
          <input type="hidden" name="next" value={next} />

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-green-400/90 mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-3 bg-gray-900/50 border border-green-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-green-500/50"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-green-400/90 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 bg-gray-900/50 border border-green-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:border-green-500/50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg shadow-green-500/20"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-600 font-mono">
            ROBINSON SOLUTIONS PLATFORM
          </p>
          <p className="text-xs text-gray-700 mt-1 font-mono">
            CLIENT PORTAL • SECURE ACCESS
          </p>
        </div>
      </div>
    </div>
  );
}

