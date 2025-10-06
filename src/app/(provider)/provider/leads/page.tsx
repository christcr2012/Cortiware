import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getLeadSummary, listLeads } from '@/services/provider/leads.service';

export default async function ProviderLeadsPage(props: any) {
  const cookieStore = await cookies();
  if (!cookieStore.get('rs_provider') && !cookieStore.get('provider-session') && !cookieStore.get('ws_provider')) {
    redirect('/provider/login');
  }

  const summary = await getLeadSummary();
  const sp = typeof props?.searchParams?.then === 'function' ? await props.searchParams : props?.searchParams;
  const page = await listLeads({ limit: 20, cursor: sp?.cursor });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--brand-gradient)' }}>
          Leads Management
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Cross-tenant lead operations and billing</p>
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: summary.total },
          { label: 'Converted', value: summary.converted },
          { label: 'New Today', value: summary.newToday },
          { label: 'Conversion Rate', value: summary.total ? Math.round((summary.converted / summary.total) * 100) + '%' : '0%' },
        ].map((c) => (
          <div key={c.label} className="rounded-xl p-5" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--brand-primary)' }}>{c.value}</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Leads table (minimal) */}
      <div className="rounded-xl" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr style={{ color: 'var(--text-secondary)' }}>
                <th className="text-left p-3">Company</th>
                <th className="text-left p-3">Contact</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Org</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Source</th>
                <th className="text-left p-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {page.items.map((l) => (
                <tr key={l.id} className="border-t" style={{ borderColor: 'var(--border-primary)' }}>
                  <td className="p-3" style={{ color: 'var(--text-primary)' }}>{l.company}</td>
                  <td className="p-3" style={{ color: 'var(--text-primary)' }}>{l.contactName}</td>
                  <td className="p-3" style={{ color: 'var(--text-primary)' }}>{l.email}</td>
                  <td className="p-3" style={{ color: 'var(--text-primary)' }}>{l.orgName}</td>
                  <td className="p-3 font-mono" style={{ color: 'var(--brand-primary)' }}>{l.status}</td>
                  <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{l.sourceType}</td>
                  <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{new Date(l.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 flex justify-end">
          {page.nextCursor ? (
            <Link href={{ pathname: '/provider/leads', query: { cursor: page.nextCursor } }} className="px-4 py-2 rounded-lg font-mono" style={{ color: 'var(--brand-primary)', border: '1px solid var(--border-accent)' }}>
              Next →
            </Link>
          ) : (
            <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>End of results</span>
          )}
        </div>
      </div>
    </div>
  );
}

