import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSubscriptionSummary, listSubscriptions, type SubscriptionListItem } from '@/services/provider/subscriptions.service';

type SubscriptionSummary = {
  totalActive: number;
  totalTrialing: number;
  totalCanceled: number;
  mrrCents: number;
  arrCents: number;
  churnRate: number;
};

export default async function ProviderSubscriptionsPage(props: any) {
  const jar = await cookies();
  if (!jar.get('rs_provider') && !jar.get('provider-session') && !jar.get('ws_provider')) {
    redirect('/provider/login');
  }

  // Handle build-time gracefully (no DATABASE_URL available)
  let summary: SubscriptionSummary = {
    totalActive: 0,
    totalTrialing: 0,
    totalCanceled: 0,
    mrrCents: 0,
    arrCents: 0,
    churnRate: 0
  };
  let page: { items: SubscriptionListItem[]; nextCursor: string | null } = { items: [], nextCursor: null };

  try {
    summary = await getSubscriptionSummary();
    const sp = typeof props?.searchParams?.then === 'function' ? await props.searchParams : props?.searchParams;
    page = await listSubscriptions({ limit: 20, cursor: sp?.cursor, status: sp?.status });
  } catch (error) {
    console.log('Subscriptions page: Database not available during build, using empty data');
  }

  const sp = typeof props?.searchParams?.then === 'function' ? await props.searchParams : props?.searchParams;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--brand-gradient)' }}>
          Subscriptions
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Plan lifecycle, MRR/ARR, and churn analysis
        </p>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Active</div>
          <div className="text-3xl font-bold mt-2" style={{ color: 'var(--brand-primary)' }}>
            {summary.totalActive}
          </div>
        </div>

        <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Trialing</div>
          <div className="text-3xl font-bold mt-2" style={{ color: 'var(--brand-primary)' }}>
            {summary.totalTrialing}
          </div>
        </div>

        <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>MRR</div>
          <div className="text-3xl font-bold mt-2" style={{ color: 'var(--brand-primary)' }}>
            ${(summary.mrrCents / 100).toLocaleString()}
          </div>
        </div>

        <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>ARR</div>
          <div className="text-3xl font-bold mt-2" style={{ color: 'var(--brand-primary)' }}>
            ${(summary.arrCents / 100).toLocaleString()}
          </div>
        </div>

        <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Churn Rate</div>
          <div className="text-3xl font-bold mt-2" style={{ color: 'var(--brand-primary)' }}>
            {summary.churnRate}%
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <a
          href="/provider/subscriptions"
          className="px-4 py-2 rounded-lg text-sm"
          style={{
            background: !sp?.status ? 'var(--brand-primary)' : 'var(--glass-bg)',
            color: !sp?.status ? 'var(--bg-main)' : 'var(--text-primary)',
            border: '1px solid var(--border-accent)',
          }}
        >
          All
        </a>
        <a
          href="/provider/subscriptions?status=active"
          className="px-4 py-2 rounded-lg text-sm"
          style={{
            background: sp?.status === 'active' ? 'var(--brand-primary)' : 'var(--glass-bg)',
            color: sp?.status === 'active' ? 'var(--bg-main)' : 'var(--text-primary)',
            border: '1px solid var(--border-accent)',
          }}
        >
          Active
        </a>
        <a
          href="/provider/subscriptions?status=trialing"
          className="px-4 py-2 rounded-lg text-sm"
          style={{
            background: sp?.status === 'trialing' ? 'var(--brand-primary)' : 'var(--glass-bg)',
            color: sp?.status === 'trialing' ? 'var(--bg-main)' : 'var(--text-primary)',
            border: '1px solid var(--border-accent)',
          }}
        >
          Trialing
        </a>
        <a
          href="/provider/subscriptions?status=canceled"
          className="px-4 py-2 rounded-lg text-sm"
          style={{
            background: sp?.status === 'canceled' ? 'var(--brand-primary)' : 'var(--glass-bg)',
            color: sp?.status === 'canceled' ? 'var(--bg-main)' : 'var(--text-primary)',
            border: '1px solid var(--border-accent)',
          }}
        >
          Canceled
        </a>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-accent)' }}>
              <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Organization</th>
              <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Plan</th>
              <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Status</th>
              <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Price</th>
              <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Started</th>
              <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Renews</th>
            </tr>
          </thead>
          <tbody>
            {page.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
                  No subscriptions found
                </td>
              </tr>
            ) : (
              page.items.map((sub) => (
                <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-accent)' }}>
                  <td className="p-4" style={{ color: 'var(--text-primary)' }}>{sub.orgName}</td>
                  <td className="p-4" style={{ color: 'var(--text-primary)' }}>{sub.plan}</td>
                  <td className="p-4">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        background: sub.status === 'active' ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                        color: sub.status === 'active' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                      }}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="p-4" style={{ color: 'var(--text-primary)' }}>
                    ${(sub.priceCents / 100).toFixed(2)}/mo
                  </td>
                  <td className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(sub.startedAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {sub.renewsAt ? new Date(sub.renewsAt).toLocaleDateString() : 'N/A'}
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
              href={`/provider/subscriptions?cursor=${page.nextCursor}${sp?.status ? `&status=${sp.status}` : ''}`}
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

