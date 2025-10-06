import { ThemeSwitcher } from "@/components/dev-aids/ThemeSwitcher";

export default function ClientThemeSettingsPage() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Theme Settings
        </h1>
        <p className="text-gray-400">
          Customize the appearance of your client portal
        </p>
      </div>

      {/* Theme Settings Card */}
      <div
        className="rounded-xl border border-white/10 p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(17,24,39,0.8) 0%, rgba(31,41,55,0.8) 100%)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <h2 className="text-xl font-semibold text-white mb-4">Theme Customization</h2>
        <p className="text-gray-400 text-sm mb-6">
          Choose a theme for your client portal. This setting affects all client-side portals (Owner, Accountant, future vendor portals).
        </p>
        <ThemeSwitcher scope="client" />
      </div>
    </div>
  );
}

