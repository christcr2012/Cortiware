import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function OwnerSupportPage() {
  const jar = await cookies();
  if (!jar.get('rs_user') && !jar.get('mv_user')) redirect('/login');
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color:'var(--brand-primary)' }}>Support</h1>
      <p style={{ color:'var(--text-secondary)' }}>Tickets, priorities, attachments, SLA, messaging thread.</p>
      {/* TODO: Wire to tickets.service (list/create/reply/close) */}
    </div>
  );
}

