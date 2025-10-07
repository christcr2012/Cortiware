'use client';

/**
 * Direct Access Mode Banner
 * 
 * Displays a prominent warning banner when Provider/Developer
 * is accessing tenant systems via emergency/direct access.
 * 
 * Features:
 * - High visibility (red/orange)
 * - Shows current role and email
 * - Indicates single-tenant mode
 * - Provides logout option
 */

interface DirectAccessBannerProps {
  role: 'provider' | 'developer';
  email: string;
}

export function DirectAccessBanner({ role, email }: DirectAccessBannerProps) {
  const handleLogout = () => {
    // Clear cookie and redirect to login
    document.cookie = `rs_${role}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    window.location.href = '/login';
  };

  return (
    <div className="bg-orange-600 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <div className="font-semibold">
              ⚠️ Direct Access Mode - Single Tenant Context
            </div>
            <div className="text-sm opacity-90">
              Logged in as {role.charAt(0).toUpperCase() + role.slice(1)}: {email}
              {' • '}
              All actions are audited
              {' • '}
              Cross-tenant navigation is restricted
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-white text-orange-600 rounded hover:bg-orange-50 font-medium text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

