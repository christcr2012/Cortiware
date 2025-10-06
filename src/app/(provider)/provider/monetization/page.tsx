import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

async function fetchJSON(path: string) {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function ProviderMonetizationPage() {
  const jar = await cookies();
  if (!jar.get('rs_provider') && !jar.get('provider-session') && !jar.get('ws_provider')) {
    redirect('/provider/login');
  }

  const [plans, prices, cfg] = await Promise.all([
    fetchJSON(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/provider/monetization/plans`),
    fetchJSON(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/provider/monetization/prices`),
    fetchJSON(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/provider/monetization/global-config`),
  ]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--brand-gradient)' }}>
          Monetization
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Plans, prices, overrides, and onboarding</p>
      </header>

      <section>
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Global Defaults</h2>
        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Default plan: {cfg?.item?.defaultPlan?.name || '—'} • Default price: {cfg?.item?.defaultPrice ? `$${(cfg.item.defaultPrice.unitAmountCents/100).toFixed(2)} / ${cfg.item.defaultPrice.cadence.toLowerCase()}` : '—'} • Trial: {cfg?.item?.defaultTrialDays ?? 0} days
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Plans & Prices</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {(plans?.items || []).map((pl: any) => (
            <div key={pl.id} className="rounded-xl p-4 border" style={{ background: 'var(--glass-bg)', borderColor: 'var(--border-accent)' }}>
              <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{pl.name}</div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{pl.description || '—'}</div>
              <ul className="mt-2 text-sm">
                {(pl.prices || []).map((pr: any) => (
                  <li key={pr.id} className="flex items-center justify-between">
                    <span>{pr.cadence.toLowerCase()}</span>
                    <span className="font-mono">${(pr.unitAmountCents/100).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

