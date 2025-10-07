import { getAuthContext } from '@/lib/auth-context';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const authContext = await getAuthContext();

  // Require authentication
  if (!authContext.isAuthenticated) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Dashboard
          </h1>

          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
              <h2 className="text-lg font-semibold text-blue-900">
                Welcome to Tenant App
              </h2>
              <p className="text-blue-700 mt-2">
                You are logged in as: <strong>{authContext.email}</strong>
              </p>
              {authContext.role && (
                <p className="text-blue-700">
                  Role: <strong>{authContext.role}</strong>
                </p>
              )}
              {authContext.isDirectAccess && (
                <p className="text-orange-700 font-semibold mt-2">
                  ⚠️ Direct Access Mode - Single tenant context only
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-50 p-4 rounded border">
                <h3 className="font-semibold text-gray-900">Tenants</h3>
                <p className="text-gray-600 text-sm mt-1">Manage tenant accounts</p>
              </div>
              <div className="bg-gray-50 p-4 rounded border">
                <h3 className="font-semibold text-gray-900">Users</h3>
                <p className="text-gray-600 text-sm mt-1">Manage user access</p>
              </div>
              <div className="bg-gray-50 p-4 rounded border">
                <h3 className="font-semibold text-gray-900">Settings</h3>
                <p className="text-gray-600 text-sm mt-1">Configure your account</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-900 mb-2">Authentication Details</h3>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-600">Email:</dt>
                  <dd className="font-mono text-gray-900">{authContext.email || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Role:</dt>
                  <dd className="font-mono text-gray-900">{authContext.role || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">User ID:</dt>
                  <dd className="font-mono text-gray-900">{authContext.userId || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-gray-600">Direct Access:</dt>
                  <dd className="font-mono text-gray-900">{authContext.isDirectAccess ? 'Yes' : 'No'}</dd>
                </div>
                {authContext.providerId && (
                  <div>
                    <dt className="text-gray-600">Provider ID:</dt>
                    <dd className="font-mono text-gray-900">{authContext.providerId}</dd>
                  </div>
                )}
                {authContext.developerId && (
                  <div>
                    <dt className="text-gray-600">Developer ID:</dt>
                    <dd className="font-mono text-gray-900">{authContext.developerId}</dd>
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

