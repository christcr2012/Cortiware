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
        <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-6">
          <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-blue-300 text-sm font-medium mb-1">
              Unified Client-Side Theme
            </p>
            <p className="text-gray-400 text-sm">
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

