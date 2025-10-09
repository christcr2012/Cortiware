'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');

  const error = searchParams.get('error');
  const totpRequired = searchParams.get('totp') === 'required';

  const errorMessages: Record<string, string> = {
    missing: 'Please enter your email and password',
    invalid: 'Invalid email or password',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    form.action = '/api/auth/login';
    form.method = 'POST';
    form.submit();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-main)' }}>
      <div className="premium-card w-full max-w-md">
        <div>
          <h2 className="text-responsive-2xl font-bold text-center" style={{ color: 'var(--text-primary)' }}>
            Provider Portal
          </h2>
          <p className="mt-2 text-responsive-sm text-center" style={{ color: 'var(--text-secondary)' }}>
            Sign in to access the provider dashboard
          </p>
        </div>

        {error && (
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--accent-error)', color: 'var(--accent-error)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
            {errorMessages[error] || 'An error occurred'}
          </div>
        )}

        {totpRequired && (
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--accent-info)', color: 'var(--accent-info)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
            Two-factor authentication required. Please enter your TOTP code.
          </div>
        )}

        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="email" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field touch-target"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
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
                className="input-field touch-target"
              />
            </div>

            {totpRequired && (
              <div>
                <label htmlFor="totpCode" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
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
                  className="input-field touch-target"
                />
              </div>
            )}
          </div>

          <div className="pt-2">
            <button type="submit" className="btn-primary w-full touch-target-comfortable">
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProviderLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

