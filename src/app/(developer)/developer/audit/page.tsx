import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function DeveloperAuditPage(props: any) {
  const sp = typeof props?.searchParams?.then === 'function' ? await props.searchParams : props?.searchParams;
  const entity = typeof sp?.entity === 'string' ? sp!.entity : undefined;
  const action = typeof sp?.action === 'string' ? sp!.action : undefined;
  const limit = Math.min(Number(sp?.limit ?? 25), 100);
  const offset = Math.max(Number(sp?.offset ?? 0), 0);

  const where: any = {};
  if (entity) where.entity = entity;
  if (action) where.field = action;

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit, skip: offset }),
    prisma.auditLog.count({ where }),
  ]);

  return (
    <div style={{ padding: 24 }}>
      <h1>Audit Log (Developer)</h1>
      <p>Total: {total}</p>

      {/* Filters */}
      <div style={{ marginBottom: 24, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
        <h3>Filters</h3>
        <form method="get" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 12 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Entity</label>
            <input
              type="text"
              name="entity"
              defaultValue={entity || ''}
              placeholder="e.g., onboarding"
              style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Action</label>
            <input
              type="text"
              name="action"
              defaultValue={action || ''}
              placeholder="e.g., create"
              style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Limit</label>
            <input
              type="number"
              name="limit"
              defaultValue={limit}
              min="1"
              max="100"
              style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <button type="submit" style={{ padding: '8px 16px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
              Apply
            </button>
            <a href="/developer/audit" style={{ padding: '8px 16px', background: '#e5e7eb', color: '#111', textDecoration: 'none', borderRadius: 4 }}>
              Clear
            </a>
          </div>
        </form>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign:'left' }}>Time</th>
            <th style={{ textAlign:'left' }}>Entity</th>
            <th style={{ textAlign:'left' }}>Action</th>
            <th style={{ textAlign:'left' }}>Org</th>
            <th style={{ textAlign:'left' }}>Actor</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.id}>
              <td>{new Date(row.createdAt).toLocaleString()}</td>
              <td>{row.entity}</td>
              <td>{row.field}</td>
              <td>{row.orgId}</td>
              <td>{row.actorUserId || '\u2014'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 12, display:'flex', gap: 8 }}>
        <a href={`?entity=${entity||''}&action=${action||''}&limit=${limit}&offset=${Math.max(0, offset - limit)}`}>
          Prev
        </a>
        <a href={`?entity=${entity||''}&action=${action||''}&limit=${limit}&offset=${offset + limit}`}>
          Next
        </a>
      </div>
    </div>
  );
}

