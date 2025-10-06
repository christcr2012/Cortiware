import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function OwnerThemePage() {
  const jar = await cookies();
  if (!jar.get('rs_user') && !jar.get('mv_user')) redirect('/login');
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color:'var(--brand-primary)' }}>Theme</h1>
      <p style={{ color:'var(--text-secondary)' }}>Owner-only theme selector (5 extra themes + futuristic green).</p>
      {/* TODO: Wire to theme.service setTenantTheme(orgId, themeKey) */}
    </div>
  );
}

