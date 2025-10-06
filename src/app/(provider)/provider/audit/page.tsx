import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuditSummary, listAuditEvents } from '@/services/provider/audit.service';

export default async function ProviderAuditPage(props: any) {
  const jar = await cookies();
  if (!jar.get('rs_provider') && !jar.get('provider-session') && !jar.get('ws_provider')) {
    redirect('/provider/login');
  }

  const summary = await getAuditSummary();
  const sp = typeof props?.searchParams?.then === 'function' ? await props.searchParams : props?.searchParams;
  const page = await listAuditEvents({ 
    limit: 50, 
    cursor: sp?.cursor,
    entity: sp?.entity,
    orgId: sp?.orgId,
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--brand-gradient)' }}>
          Audit Log
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Searchable event feed with filters and drill-down
        </p>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Events</div>
          <div className="text-3xl font-bold mt-2" style={{ color: 'var(--brand-primary)' }}>
            {summary.totalEvents.toLocaleString()}
          </div>
        </div>

        <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Last 24h</div>
          <div className="text-3xl font-bold mt-2" style={{ color: 'var(--brand-primary)' }}>
            {summary.recentEvents.toLocaleString()}
          </div>
        </div>

        <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Top Entity</div>
          <div className="text-xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>
            {summary.topEntities[0]?.entity || 'N/A'}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            {summary.topEntities[0]?.count || 0} events
          </div>
        </div>

        <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Active Users</div>
          <div className="text-3xl font-bold mt-2" style={{ color: 'var(--brand-primary)' }}>
            {summary.topUsers.length}
          </div>
        </div>
      </div>

      {/* Top Entities */}
      <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Top Entities</h2>
        <div className="space-y-2">
          {summary.topEntities.map((entity) => (
            <div key={entity.entity} className="flex justify-between items-center">
              <span style={{ color: 'var(--text-primary)' }}>{entity.entity}</span>
              <span style={{ color: 'var(--brand-primary)' }}>{entity.count.toLocaleString()} events</span>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-accent)' }}>
              <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Time</th>
              <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Organization</th>
              <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Entity</th>
              <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Field</th>
              <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Change</th>
            </tr>
          </thead>
          <tbody>
            {page.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
                  No audit events found
                </td>
              </tr>
            ) : (
              page.items.map((evt) => (
                <tr key={evt.id} style={{ borderBottom: '1px solid var(--border-accent)' }}>
                  <td className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(evt.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4" style={{ color: 'var(--text-primary)' }}>{evt.orgName}</td>
                  <td className="p-4" style={{ color: 'var(--text-primary)' }}>
                    {evt.entity}
                    {evt.entityId && <span className="text-xs ml-2" style={{ color: 'var(--text-secondary)' }}>#{evt.entityId.substring(0, 8)}</span>}
                  </td>
                  <td className="p-4" style={{ color: 'var(--text-primary)' }}>{evt.field || 'N/A'}</td>
                  <td className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {evt.oldValue && evt.newValue ? (
                      <span>
                        <span style={{ color: '#ff6b6b' }}>{JSON.stringify(evt.oldValue).substring(0, 20)}</span>
                        {' → '}
                        <span style={{ color: 'var(--brand-primary)' }}>{JSON.stringify(evt.newValue).substring(0, 20)}</span>
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {page.nextCursor && (
          <div className="p-4 border-t" style={{ borderColor: 'var(--border-accent)' }}>
            <a
              href={`/provider/audit?cursor=${page.nextCursor}${sp?.entity ? `&entity=${sp.entity}` : ''}${sp?.orgId ? `&orgId=${sp.orgId}` : ''}`}
              className="px-4 py-2 rounded-lg text-sm inline-block"
              style={{
                background: 'var(--brand-primary)',
                color: 'var(--bg-main)',
              }}
            >
              Load More
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

