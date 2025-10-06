import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function OwnerSecurityPage() {
  const jar = await cookies();
  if (!jar.get('rs_user') && !jar.get('mv_user')) redirect('/login');
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color:'var(--brand-primary)' }}>Security</h1>
      <p style={{ color:'var(--text-secondary)' }}>2FA/TOTP, recovery codes, sessions/devices.</p>
      {/* TODO: Wire to security.service (enable/verify TOTP, sessions) */}
    </div>
  );
}

