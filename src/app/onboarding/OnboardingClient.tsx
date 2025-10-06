'use client';

import { useEffect, useMemo, useState } from 'react';

export default function OnboardingClient({ token }: { token?: string }) {
  const [verifying, setVerifying] = useState<boolean>(true);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [invite, setInvite] = useState<any>(null);
  const [publicCfg, setPublicCfg] = useState<any>(null);

  const [companyName, setCompanyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{ orgId: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (token) {
          const res = await fetch(`/api/onboarding/verify?t=${encodeURIComponent(token)}`, { cache: 'no-store' });
          const j = await res.json();
          if (!res.ok || !j?.ok) throw new Error(j?.error || 'Invalid invite');
          setInvite(j.invite);
          if (j.invite?.email) setOwnerEmail(j.invite.email);
        } else {
          const res = await fetch('/api/provider/monetization/global-config', { cache: 'no-store' });
          const j = await res.json();
          setPublicCfg(j?.item || null);
          if (!j?.item?.publicOnboarding) setVerifyError('Public onboarding is currently disabled.');
        }
      } catch (e: any) {
        setVerifyError(String(e?.message || e));
      } finally {
        setVerifying(false);
      }
    })();
  }, [token]);

  async function submit() {
    setSubmitting(true); setSubmitError(null);
    try {
      const path = token ? '/api/onboarding/accept' : '/api/onboarding/accept-public';
      const res = await fetch(path, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify(token ? { token, companyName, ownerName, ownerEmail, password } : { companyName, ownerName, ownerEmail, password }),
      });
      const j = await res.json();
      if (!res.ok || !j?.ok) throw new Error(j?.error || 'Failed to complete onboarding');
      setSubmitted({ orgId: j.orgId });
    } catch (e: any) {
      setSubmitError(String(e?.message || e));
    } finally {
      setSubmitting(false);
    }
  }

  if (verifying) return <div style={{ color: 'var(--text-secondary)' }}>{token ? 'Verifying invite…' : 'Loading configuration…'}</div>;
  if (verifyError) return <div className="text-red-400">{verifyError}</div>;

  if (submitted) {
    return (
      <div className="space-y-4">
        <div className="text-xl font-semibold" style={{ color: 'var(--brand-primary)' }}>Welcome aboard!</div>
        <div style={{ color: 'var(--text-secondary)' }}>Your organization has been created. You can now log in.</div>
        <a href="/login" className="inline-block px-4 py-2 rounded" style={{ background: 'var(--brand-primary)', color: 'var(--bg-main)' }}>Go to Login</a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(invite || (publicCfg && publicCfg.publicOnboarding)) && (
        <div className="rounded p-3 text-sm" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
          {invite ? (
            <div style={{ color: 'var(--text-secondary)' }}>You are accepting an invite {invite.planName ? `to plan ${invite.planName}` : ''}{invite.priceAmountCents ? ` at $${(invite.priceAmountCents/100).toFixed(2)}` : ''}{invite.trialDays ? ` with ${invite.trialDays} day trial` : ''}.</div>
          ) : (
            <div style={{ color: 'var(--text-secondary)' }}>Public onboarding is enabled. Default plan/price will be applied{publicCfg?.defaultTrialDays ? ` with ${publicCfg.defaultTrialDays} day trial` : ''}.</div>
          )}
          {invite?.expiresAt ? (<div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Expires: {new Date(invite.expiresAt).toLocaleString()}</div>) : null}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Company Name</label>
          <input className="w-full px-3 py-2 rounded border" style={{ background: 'var(--glass-bg)', borderColor: 'var(--border-accent)' }} value={companyName} onChange={e=>setCompanyName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Owner Name</label>
          <input className="w-full px-3 py-2 rounded border" style={{ background: 'var(--glass-bg)', borderColor: 'var(--border-accent)' }} value={ownerName} onChange={e=>setOwnerName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Owner Email</label>
          <input className="w-full px-3 py-2 rounded border" style={{ background: 'var(--glass-bg)', borderColor: 'var(--border-accent)' }} value={ownerEmail} onChange={e=>setOwnerEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Password</label>
          <input type="password" className="w-full px-3 py-2 rounded border" style={{ background: 'var(--glass-bg)', borderColor: 'var(--border-accent)' }} value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
      </div>

      {submitError ? <div className="text-red-400 text-sm">{submitError}</div> : null}

      <div className="flex justify-end">
        <button disabled={submitting} onClick={submit} className="px-4 py-2 rounded" style={{ background: 'var(--brand-primary)', color: 'var(--bg-main)' }}>
          {submitting ? 'Submitting…' : 'Complete Onboarding'}
        </button>
      </div>
    </div>
  );
}

