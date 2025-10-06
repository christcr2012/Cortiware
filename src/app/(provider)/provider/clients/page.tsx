export default function ProviderClientsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-2">
          Client Management
        </h1>
        <p className="text-gray-400">
          View and manage all client tenants, organizations, and accounts
        </p>
      </div>

      <div 
        className="rounded-xl border border-green-500/20 p-8 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(5,150,105,0.02) 100%)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="text-6xl mb-4">👥</div>
        <h2 className="text-xl font-semibold text-green-400 mb-2">Coming Soon</h2>
        <p className="text-gray-400 text-sm">
          Client management features will be available here.
        </p>
      </div>
    </div>
  );
}

