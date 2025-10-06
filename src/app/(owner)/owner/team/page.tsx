import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function OwnerTeamPage() {
  const jar = await cookies();
  if (!jar.get('rs_user') && !jar.get('mv_user')) redirect('/login');
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color:'var(--brand-primary)' }}>Team</h1>
      <p style={{ color:'var(--text-secondary)' }}>Members, invites, roles (Owner, Admin, Analyst, Billing).</p>
      {/* TODO: Wire to team.service (list/invite/setRole) */}
    </div>
  );
}

