import { ThemeSwitcher } from "@/components/dev-aids/ThemeSwitcher";

export default function ProviderSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-3xl font-bold bg-clip-text text-transparent mb-2"
          style={{ backgroundImage: 'var(--brand-gradient)' }}
        >
          Provider Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Configure your provider portal preferences and appearance
        </p>
      </div>

      {/* Theme Settings Card */}
      <div
        className="rounded-xl p-6"
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--border-accent)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--brand-primary)' }}>Theme Customization</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          Choose a theme for the Provider and Developer portals. This setting is separate from client-side themes.
        </p>
        <ThemeSwitcher scope="admin" />
      </div>

      {/* Additional Settings Placeholder */}
      <div
        className="rounded-xl p-6"
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--border-accent)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--brand-primary)' }}>Provider Configuration</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Additional provider settings will be available here.
        </p>
      </div>
    </div>
  );
}

