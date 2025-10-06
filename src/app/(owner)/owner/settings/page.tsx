import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function OwnerSettingsPage() {
  const jar = await cookies();
  if (!jar.get('rs_user') && !jar.get('mv_user')) redirect('/login');
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color:'var(--brand-primary)' }}>Settings</h1>
      <p style={{ color:'var(--text-secondary)' }}>Org profile, billing contacts, legal entity, tax IDs, invoice memo fields.</p>
      {/* TODO: Wire to owner settings service */}
    </div>
  );
}

