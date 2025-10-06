"use client";
import React from "react";

export default function SubscriptionClient() {
  const [loading, setLoading] = React.useState(false);
  const [sub, setSub] = React.useState<null | { plan: string; status: string; renewsAt: string | null; priceCents: number }>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/owner/subscription/status');
        if (!r.ok) throw new Error('Failed to load subscription');
        const j = await r.json();
        setSub(j.subscription || null);
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

  return (
    <div className="space-y-3">
      {sub ? (
        <div className="text-sm" style={{ color:'var(--text-secondary)' }}>
          <div>Plan: <span style={{ color:'var(--text-primary)' }}>{sub.plan}</span></div>
          <div>Status: <span style={{ color:'var(--text-primary)' }}>{sub.status}</span></div>
          <div>Renews: <span style={{ color:'var(--text-primary)' }}>{sub.renewsAt || '—'}</span></div>
          <div>Price: <span style={{ color:'var(--text-primary)' }}>${(sub.priceCents/100).toFixed(2)}/mo</span></div>
        </div>
      ) : (
        <div className="text-sm" style={{ color:'var(--text-secondary)' }}>No active subscription detected.</div>
      )}
      <button onClick={openPortal} disabled={loading} className="px-3 py-2 rounded" style={{ background:'var(--brand-primary)', color:'var(--bg-main)', opacity:loading?0.7:1 }}>
        {loading ? 'Opening	Portal…' : 'Open Billing Portal'}
      </button>
      {error && <div className="text-sm" style={{ color:'#f66' }}>Error: {error}</div>}
    </div>
  );
}

