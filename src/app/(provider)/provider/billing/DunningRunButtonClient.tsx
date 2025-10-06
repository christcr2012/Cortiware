"use client";
import React from "react";

export default function DunningRunButtonClient() {
  const [loading, setLoading] = React.useState(false);
  const [summary, setSummary] = React.useState<null | { count: number; ok: number; failed: number }>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function run() {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/provider/billing/retry/run', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ limit: 10 }) });
      const j = await res.json();
      const results: Array<{ ok: boolean }> = j?.summary?.results || [];
      const ok = results.filter(r => r.ok).length;
      const failed = results.length - ok;
      setSummary({ count: j?.summary?.count ?? results.length, ok, failed });
    } catch (e:any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button onClick={run} disabled={loading} className="px-4 py-2 rounded" style={{ background:'var(--brand-primary)', color:'var(--bg-main)', opacity: loading?0.7:1 }}>
        {loading ? 'Running…' : 'Run Dunning Cycle'}
      </button>
      {summary && (
        <span className="text-sm" style={{ color:'var(--text-secondary)' }}>
          {summary.count} candidates • {summary.ok} succeeded • {summary.failed} failed
        </span>
      )}
      {error && <span className="text-sm" style={{ color:'#f66' }}>Error: {error}</span>}
    </div>
  );
}

