import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function OwnerIncidentsPage() {
  const jar = await cookies();
  if (!jar.get('rs_user') && !jar.get('mv_user')) redirect('/login');
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color:'var(--brand-primary)' }}>Incidents</h1>
      <p style={{ color:'var(--text-secondary)' }}>Tenant-affecting incidents; SLA clocks; acknowledgements.</p>
      {/* TODO: Wire to incidents service (list/acknowledge) */}
    </div>
  );
}

