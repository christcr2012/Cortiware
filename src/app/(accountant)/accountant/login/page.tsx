import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function AccountantLoginPage() {
  const cookieStore = await cookies();

  if (cookieStore.get('rs_accountant') || cookieStore.get('accountant-session') || cookieStore.get('ws_accountant')) {
    redirect('/accountant');
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #1a1a0a 0%, #2e2e1a 100%)' }}
    >
      <div className="max-w-md w-full bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-yellow-500/30">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
            Robinson Solutions
          </h1>
          <p className="text-yellow-400/70 text-sm font-mono tracking-wider">ACCOUNTANT PORTAL</p>
        </div>

        <form method="POST" action="/api/accountant/login" className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Accountant Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full px-4 py-3 bg-black/50 border border-yellow-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all font-mono"
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
              className="w-full px-4 py-3 bg-black/50 border border-yellow-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold rounded-lg transition-all"
          >
            ACCOUNTANT LOGIN
          </button>
        </form>
      </div>
    </div>
  );
}

