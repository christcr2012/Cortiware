"use client";
import React from "react";

export default function UsageClient() {
  const [summary, setSummary] = React.useState<null | { totalQuantity: number }>(null);
  const [series, setSeries] = React.useState<Array<{ date:string; total:number }>>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const [r1, r2] = await Promise.all([
          fetch('/api/owner/usage/summary'),
          fetch('/api/owner/usage/series?days=30'),
        ]);
        if (!r1.ok) throw new Error('Failed to load usage');
        if (!r2.ok) throw new Error('Failed to load usage series');
        const j1 = await r1.json();
        const j2 = await r2.json();
        setSummary(j1.summary || null);
        setSeries(j2.series || []);
      } catch (e:any) {
        setError(String(e?.message || e));
      }
    })();
  }, []);

  async function exportCsv() {
    try {
      const url = '/api/owner/usage/export';
      window.open(url, '_blank');
    } catch (e:any) {
      setError(String(e?.message || e));
    }
  }

  return (
    <div className="space-y-3">
      <div className="text-sm" style={{ color:'var(--text-secondary)' }}>
        Total Quantity: <span style={{ color:'var(--text-primary)' }}>{summary?.totalQuantity ?? 0}</span>
      </div>
      <div className="text-xs font-mono" style={{ color:'var(--text-tertiary)' }}>
        {series.slice(-30).map(p=>{
          const lvl = p.total>50? '\u2588' : p.total>20? '\u2593' : p.total>5? '\u2592' : p.total>0? '\u2591' : '\u00b7';
          return <span key={p.date} title={`${p.date}: ${p.total}`}>{lvl}</span>;
        })}
      </div>

      <button onClick={exportCsv} className="px-3 py-2 rounded" style={{ background:'var(--brand-primary)', color:'var(--bg-main)' }}>
        Export CSV
      </button>
      {error && <div className="text-sm" style={{ color:'#f66' }}>Error: {error}</div>}
    </div>
  );
}
