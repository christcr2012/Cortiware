import { ThemeSwitcher } from "@/components/dev-aids/ThemeSwitcher";

export default function ProviderSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-2">
          Provider Settings
        </h1>
        <p className="text-gray-400">
          Configure your provider portal preferences and appearance
        </p>
      </div>

      {/* Theme Settings Card */}
      <div 
        className="rounded-xl border border-green-500/20 p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(5,150,105,0.02) 100%)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <h2 className="text-xl font-semibold text-green-400 mb-4">Theme Customization</h2>
        <p className="text-gray-400 text-sm mb-6">
          Choose a theme for the Provider and Developer portals. This setting is separate from client-side themes.
        </p>
        <ThemeSwitcher scope="admin" />
      </div>

      {/* Additional Settings Placeholder */}
      <div 
        className="rounded-xl border border-green-500/20 p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(5,150,105,0.02) 100%)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <h2 className="text-xl font-semibold text-green-400 mb-4">Provider Configuration</h2>
        <p className="text-gray-400 text-sm">
          Additional provider settings will be available here.
        </p>
      </div>
    </div>
  );
}

