import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUsageSummary, listUsageMeters, getMeterRatingSummary } from '@/services/provider/usage.service';

export default async function ProviderUsagePage(props: any) {
  const jar = await cookies();
  if (!jar.get('rs_provider') && !jar.get('provider-session') && !jar.get('ws_provider')) {
    redirect('/provider/login');
  }

  // Handle build-time gracefully (no DATABASE_URL available)
  let summary = { totalMeters: 0, totalQuantity: 0, uniqueOrgs: 0, topMeters: [] };
  let ratingSummary: any[] = [];
  let page = { items: [], nextCursor: null };

  try {
    [summary, ratingSummary] = await Promise.all([
      getUsageSummary(),
      getMeterRatingSummary(),
    ]);
    const sp = typeof props?.searchParams?.then === 'function' ? await props.searchParams : props?.searchParams;
    page = await listUsageMeters({ limit: 20, cursor: sp?.cursor, meter: sp?.meter });
  } catch (error) {
    console.log('Usage page: Database not available during build, using empty data');
  }

  const sp = typeof props?.searchParams?.then === 'function' ? await props.searchParams : props?.searchParams;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--brand-gradient)' }}>
          Usage Metering
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Meters, rating windows, and billable totals
        </p>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Meters</div>
          <div className="text-3xl font-bold mt-2" style={{ color: 'var(--brand-primary)' }}>
            {summary.totalMeters}
          </div>
        </div>

        <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Quantity</div>
          <div className="text-3xl font-bold mt-2" style={{ color: 'var(--brand-primary)' }}>
            {summary.totalQuantity.toLocaleString()}
          </div>
        </div>

        <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Unique Orgs</div>
          <div className="text-3xl font-bold mt-2" style={{ color: 'var(--brand-primary)' }}>
            {summary.uniqueOrgs}
          </div>
        </div>

        <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Meter Types</div>
          <div className="text-3xl font-bold mt-2" style={{ color: 'var(--brand-primary)' }}>
            {ratingSummary.length}
          </div>
        </div>
      </div>

      {/* Top Meters */}
      <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Top Meters</h2>
        <div className="space-y-2">
          {summary.topMeters.map((meter) => (
            <div key={meter.meter} className="flex justify-between items-center">
              <span style={{ color: 'var(--text-primary)' }}>{meter.meter}</span>
              <span style={{ color: 'var(--brand-primary)' }}>{meter.quantity.toLocaleString()} units</span>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-accent)' }}>
              <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Organization</th>
              <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Meter</th>
              <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Quantity</th>
              <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Window Start</th>
              <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Window End</th>
            </tr>
          </thead>
          <tbody>
            {page.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
                  No usage meters found
                </td>
              </tr>
            ) : (
              page.items.map((meter) => (
                <tr key={meter.id} style={{ borderBottom: '1px solid var(--border-accent)' }}>
                  <td className="p-4" style={{ color: 'var(--text-primary)' }}>{meter.orgName}</td>
                  <td className="p-4" style={{ color: 'var(--text-primary)' }}>{meter.meter}</td>
                  <td className="p-4" style={{ color: 'var(--brand-primary)' }}>{meter.quantity.toLocaleString()}</td>
                  <td className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(meter.windowStart).toLocaleString()}
                  </td>
                  <td className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(meter.windowEnd).toLocaleString()}
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
              href={`/provider/usage?cursor=${page.nextCursor}${sp?.meter ? `&meter=${sp.meter}` : ''}`}
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

