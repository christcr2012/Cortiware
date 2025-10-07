'use client';

import { useSearchParams } from 'next/navigation';

export default function ForbiddenPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  const messages: Record<string, { title: string; description: string }> = {
    'cross-tenant-restricted': {
      title: 'Cross-Tenant Navigation Restricted',
      description:
        'You are in Direct Access Mode (single-tenant context). Cross-tenant navigation is not allowed for security reasons. Please use the Provider Portal for multi-tenant operations.',
    },
    default: {
      title: 'Access Forbidden',
      description: 'You do not have permission to access this resource.',
    },
  };

  const message = messages[reason || 'default'] || messages.default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 text-red-600 mb-4">
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-full h-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">403</h2>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{message.title}</h3>
          <p className="text-gray-600 mb-8">{message.description}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
            >
              Go Back
            </button>
            <button
              onClick={() => (window.location.href = '/dashboard')}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 font-medium"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

