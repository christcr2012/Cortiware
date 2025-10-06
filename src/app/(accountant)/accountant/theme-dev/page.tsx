import { ThemeSwitcher } from "@/components/dev-aids/ThemeSwitcher";

export default function AccountantThemeDevPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Accountant Theme (Client Scope)</h1>
      <ThemeSwitcher scope="client" />
      <p style={{ marginTop: 12 }}>Client theme also applies here and to future vendor portals.</p>
    </div>
  );
}

