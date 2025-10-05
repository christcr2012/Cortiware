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
      style={{ background: 'linear-gradient(135deg, #1a0a1a 0%, #2e1a2e 100%)' }}
    >
      <div className="max-w-md w-full bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-purple-500/30">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
            Robinson Solutions
          </h1>
          <p className="text-purple-400/70 text-sm font-mono tracking-wider">DEVELOPER PORTAL</p>
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
              required
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-4 py-3 bg-black/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all"
          >
            DEVELOPER LOGIN
          </button>
        </form>
      </div>
    </div>
  );
}

