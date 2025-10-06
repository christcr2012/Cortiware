import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAddonSummary, listAddonPurchases } from '@/services/provider/addons.service';

export default async function ProviderAddonsPage(props: any) {
  const jar = await cookies();
  if (!jar.get('rs_provider') && !jar.get('provider-session') && !jar.get('ws_provider')) {
    redirect('/provider/login');
  }

  const summary = await getAddonSummary();
  const sp = typeof props?.searchParams?.then === 'function' ? await props.searchParams : props?.searchParams;
  const page = await listAddonPurchases({ limit: 20, cursor: sp?.cursor, status: sp?.status });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--brand-gradient)' }}>
          Add-on Purchases
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          SKU purchases, refunds, and revenue tracking
        </p>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Purchases</div>
          <div className="text-3xl font-bold mt-2" style={{ color: 'var(--brand-primary)' }}>
            {summary.totalPurchases}
          </div>
        </div>

        <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Refunds</div>
          <div className="text-3xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>
            {summary.totalRefunds}
          </div>
        </div>

        <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Gross Revenue</div>
          <div className="text-3xl font-bold mt-2" style={{ color: 'var(--brand-primary)' }}>
            ${(summary.totalRevenueCents / 100).toLocaleString()}
          </div>
        </div>

        <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Net Revenue</div>
          <div className="text-3xl font-bold mt-2" style={{ color: 'var(--brand-primary)' }}>
            ${(summary.netRevenueCents / 100).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Top SKUs */}
      <div className="rounded-xl p-6" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Top SKUs</h2>
        <div className="space-y-2">
          {summary.topSkus.map((sku) => (
            <div key={sku.sku} className="flex justify-between items-center">
              <span style={{ color: 'var(--text-primary)' }}>{sku.sku}</span>
              <div className="text-right">
                <div style={{ color: 'var(--brand-primary)' }}>${(sku.revenueCents / 100).toLocaleString()}</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{sku.count} purchases</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <a
          href="/provider/addons"
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
          href="/provider/addons?status=purchased"
          className="px-4 py-2 rounded-lg text-sm"
          style={{
            background: sp?.status === 'purchased' ? 'var(--brand-primary)' : 'var(--glass-bg)',
            color: sp?.status === 'purchased' ? 'var(--bg-main)' : 'var(--text-primary)',
            border: '1px solid var(--border-accent)',
          }}
        >
          Purchased
        </a>
        <a
          href="/provider/addons?status=refunded"
          className="px-4 py-2 rounded-lg text-sm"
          style={{
            background: sp?.status === 'refunded' ? 'var(--brand-primary)' : 'var(--glass-bg)',
            color: sp?.status === 'refunded' ? 'var(--bg-main)' : 'var(--text-primary)',
            border: '1px solid var(--border-accent)',
          }}
        >
          Refunded
        </a>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-accent)' }}>
              <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Organization</th>
              <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>SKU</th>
              <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Amount</th>
              <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Status</th>
              <th className="text-left p-4 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Purchased</th>
            </tr>
          </thead>
          <tbody>
            {page.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
                  No add-on purchases found
                </td>
              </tr>
            ) : (
              page.items.map((purchase) => (
                <tr key={purchase.id} style={{ borderBottom: '1px solid var(--border-accent)' }}>
                  <td className="p-4" style={{ color: 'var(--text-primary)' }}>{purchase.orgName}</td>
                  <td className="p-4" style={{ color: 'var(--text-primary)' }}>{purchase.sku}</td>
                  <td className="p-4" style={{ color: 'var(--brand-primary)' }}>
                    ${parseFloat(purchase.amount).toFixed(2)}
                  </td>
                  <td className="p-4">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        background: purchase.status === 'purchased' ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                        color: purchase.status === 'purchased' ? 'var(--brand-primary)' : '#ff6b6b',
                      }}
                    >
                      {purchase.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(purchase.purchasedAt).toLocaleDateString()}
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
              href={`/provider/addons?cursor=${page.nextCursor}${sp?.status ? `&status=${sp.status}` : ''}`}
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

