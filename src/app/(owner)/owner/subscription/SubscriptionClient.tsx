"use client";
import React from "react";

export default function SubscriptionClient() {
  const [loading, setLoading] = React.useState(false);
  const [sub, setSub] = React.useState<null | { plan: string; status: string; renewsAt: string | null; priceCents: number }>(null);
  const [hasPM, setHasPM] = React.useState<boolean | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const [r1, r2] = await Promise.all([
          fetch('/api/owner/subscription/status'),
          fetch('/api/owner/payment-methods/status'),
        ]);
        if (!r1.ok) throw new Error('Failed to load subscription');
        const j1 = await r1.json();
        setSub(j1.subscription || null);
        if (r2.ok) {
          const j2 = await r2.json();
          setHasPM(!!j2.hasPaymentMethod);
        }
      } catch (e:any) {
        setError(String(e?.message || e));
      }
    })();
  }, []);

  async function openPortal() {
    setLoading(true); setError(null);
    try {
      const r = await fetch('/api/owner/subscription/portal', { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({}) });
      const j = await r.json();
      if (!r.ok || !j?.url) throw new Error(j?.error || 'Failed to open portal');
      window.location.href = j.url as string;
    } catch (e:any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  const showPaymentNudge = sub && (sub.status === 'trialing' || sub.priceCents === 0);
  return (
    <div className="space-y-3">
      {sub ? (
        <div className="text-sm" style={{ color:'var(--text-secondary)' }}>
          <div>Plan: <span style={{ color:'var(--text-primary)' }}>{sub.plan}</span></div>
          <div>Status: <span style={{ color:'var(--text-primary)' }}>{sub.status}</span></div>
          <div>Renews: <span style={{ color:'var(--text-primary)' }}>{sub.renewsAt || '—'}</span></div>
          <div>Price: <span style={{ color:'var(--text-primary)' }}>${(sub.priceCents/100).toFixed(2)}/mo</span></div>
          <div>Payment method on file: <span style={{ color:'var(--text-primary)' }}>{hasPM==null? '—' : (hasPM ? 'Yes' : 'No')}</span></div>
        </div>
      ) : (
        <div className="text-sm" style={{ color:'var(--text-secondary)' }}>No active subscription detected.</div>
      )}
      {showPaymentNudge && (
        <div className="rounded-md p-3" style={{ background:'rgba(255,255,255,0.04)', border:'1px dashed var(--border-accent)' }}>
          <div className="text-sm" style={{ color:'var(--text-secondary)' }}>Add a payment method to avoid service interruption when the trial ends.</div>
        </div>
      )}
      <button onClick={openPortal} disabled={loading} className="px-3 py-2 rounded" style={{ background:'var(--brand-primary)', color:'var(--bg-main)', opacity:loading?0.7:1 }}>
        {loading ? 'Opening Portal…' : 'Open Billing Portal'}
      </button>
      {error && <div className="text-sm" style={{ color:'#f66' }}>Error: {error}</div>}
    </div>
  );
}

