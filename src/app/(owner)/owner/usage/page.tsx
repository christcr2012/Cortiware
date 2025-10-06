import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import UsageClient from './UsageClient';

export default async function OwnerUsagePage() {
  const jar = await cookies();
  if (!jar.get('rs_user') && !jar.get('mv_user')) redirect('/login');
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color:'var(--brand-primary)' }}>Usage</h1>
      <p style={{ color:'var(--text-secondary)' }}>Meters by product/add-on; charts; export CSV.</p>
      {/* Client wiring */}
      <UsageClient />
    </div>
  );
}

