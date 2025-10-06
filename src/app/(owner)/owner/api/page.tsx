import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function OwnerApiPage() {
  const jar = await cookies();
  if (!jar.get('rs_user') && !jar.get('mv_user')) redirect('/login');
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color:'var(--brand-primary)' }}>API Access</h1>
      <p style={{ color:'var(--text-secondary)' }}>API keys (scoped), rotation, IP allowlist, rate limits, webhooks.</p>
      {/* TODO: Wire to api-keys.service (list/create/revoke) */}
    </div>
  );
}

