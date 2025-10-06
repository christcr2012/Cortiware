import { ThemeSwitcher } from "@/components/dev-aids/ThemeSwitcher";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ClientThemeSettingsPage() {
  // Check if user is Owner (only Owners can change client-side themes)
  const cookieStore = await cookies();
  const userEmail = cookieStore.get('rs_user')?.value || cookieStore.get('mv_user')?.value;

  if (!userEmail) {
    redirect('/login');
  }

  // TODO: Add proper RBAC check here when user role is available
  // For now, allow access but show the info message
  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Theme Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Customize the appearance of your client portal
        </p>
      </div>

      {/* Theme Settings Card */}
      <div
        className="rounded-xl p-6"
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--border-primary)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Theme Customization</h2>
        <div
          className="flex items-start gap-3 p-4 rounded-lg mb-6"
          style={{
            background: 'var(--surface-hover)',
            border: '1px solid var(--border-accent)',
          }}
        >
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--brand-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--brand-primary)' }}>
              Unified Client-Side Theme
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              This theme applies to all client-side portals: Owner portal, Accountant portal, and future vendor portals.
              Only Owner accounts can change this setting. Accountants will see the theme you select here.
            </p>
          </div>
        </div>
        <ThemeSwitcher scope="client" />
      </div>
    </div>
  );
}

