export default function DeveloperDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
          Developer Dashboard
        </h1>
        <p className="text-gray-400">System administration and development tools</p>
      </div>

      <div className="bg-gray-900/50 border border-purple-500/20 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-purple-400 mb-4">System Status</h2>
        <p className="text-gray-300">Developer portal active</p>
      </div>
    </div>
  );
}

