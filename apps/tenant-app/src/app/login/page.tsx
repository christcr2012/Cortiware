'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [emergencyRole, setEmergencyRole] = useState<'provider' | 'developer'>('provider');

  const error = searchParams.get('error');
  const totpRequired = searchParams.get('totp') === 'required';
  const emailParam = searchParams.get('email');

  const errorMessages: Record<string, string> = {
    missing: 'Please enter your email and password',
    invalid: 'Invalid email or password',
    missing_ticket: 'Missing authentication ticket',
    invalid_ticket: 'Invalid or expired authentication ticket',
    server_error: 'Server error. Please try again later.',
    unavailable: 'Emergency access is not available',
    forbidden: 'Access forbidden',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const endpoint = isEmergency ? '/api/auth/emergency' : '/api/auth/login';
    
    // Submit form
    form.action = endpoint;
    form.method = 'POST';
    form.submit();
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-main)', padding:'var(--space-xl)' }}>
      <div className="premium-card" style={{ width:'100%', maxWidth:480 }}>
        <div>
          <h2 className="text-3xl font-bold" style={{ color:'var(--text-primary)', textAlign:'center' }}>
            {isEmergency ? 'Emergency Access' : 'Sign in to your account'}
          </h2>
          {isEmergency && (
            <p className="mt-2 text-center text-sm" style={{ color:'var(--accent-error)' }}>
              ⚠️ Emergency access mode - all actions will be audited
            </p>
          )}
        </div>

        {error && (
          <div style={{ background:'var(--surface-1)', border:'1px solid var(--accent-error)', color:'var(--accent-error)', padding:'12px', borderRadius:'var(--radius-md)' }}>
            {errorMessages[error] || 'An error occurred'}
          </div>
        )}

        {totpRequired && (
          <div style={{ background:'var(--surface-1)', border:'1px solid var(--accent-info)', color:'var(--accent-info)', padding:'12px', borderRadius:'var(--radius-md)' }}>
            Two-factor authentication required. Please enter your TOTP code.
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {isEmergency && (
              <div>
                <label htmlFor="role" className="block text-sm font-medium" style={{ color:'var(--text-secondary)' }}>
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={emergencyRole}
                  onChange={(e) => setEmergencyRole(e.target.value as 'provider' | 'developer')}
                  className="input-field"
                >
                  <option value="provider">Provider</option>
                  <option value="developer">Developer</option>
                </select>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium" style={{ color:'var(--text-secondary)' }}>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={emailParam || email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium" style={{ color:'var(--text-secondary)' }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
              />
            </div>

            {totpRequired && (
              <div>
                <label htmlFor="totpCode" className="block text-sm font-medium" style={{ color:'var(--text-secondary)' }}>
                  TOTP Code
                </label>
                <input
                  id="totpCode"
                  name="totpCode"
                  type="text"
                  autoComplete="one-time-code"
                  required
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="input-field"
                />
              </div>
            )}
          </div>

          <div>
            <button type="submit" className="btn-primary" style={{ width:'100%' }}>
              Sign in
            </button>
          </div>

          <div className="text-center">
            <button type="button" onClick={() => setIsEmergency(!isEmergency)} style={{ color:'var(--text-accent)' }} className="text-sm">
              {isEmergency ? 'Switch to normal login' : 'Emergency access'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

