import { ThemeSwitcher } from "@/components/dev-aids/ThemeSwitcher";

export default function DeveloperDevAidsPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Developer Dev Aids</h1>
      <ThemeSwitcher scope="admin" />
      <p style={{ marginTop: 12 }}>Admin (Provider/Developer) theme scope persists separately from client scope.</p>
    </div>
  );
}

