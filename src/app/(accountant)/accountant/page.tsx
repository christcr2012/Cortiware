export default function AccountantDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
          Accountant Dashboard
        </h1>
        <p className="text-gray-400">Financial operations and reporting</p>
      </div>

      <div className="bg-gray-900/50 border border-yellow-500/20 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-yellow-400 mb-4">Financial Overview</h2>
        <p className="text-gray-300">Accountant portal active</p>
      </div>
    </div>
  );
}

