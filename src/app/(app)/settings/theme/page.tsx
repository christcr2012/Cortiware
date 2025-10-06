import { ThemeSwitcher } from "@/components/dev-aids/ThemeSwitcher";

export default function ClientThemeSettingsPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Client Theme Settings</h1>
      <ThemeSwitcher scope="client" />
      <p style={{ marginTop: 12 }}>This affects all client-side portals (Owner, Accountant, future vendor portals).</p>
    </div>
  );
}

