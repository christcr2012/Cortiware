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
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8" style={{ background:'var(--bg-main)' }}>
      <div className="premium-card w-full max-w-md">
        <div>
          <h2 className="text-responsive-2xl font-bold text-center" style={{ color:'var(--text-primary)' }}>
            {isEmergency ? 'Emergency Access' : 'Sign in to your account'}
          </h2>
          {isEmergency && (
            <p className="mt-2 text-center text-responsive-sm" style={{ color:'var(--accent-error)' }}>
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

        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3 sm:space-y-4">
            {isEmergency && (
              <div>
                <label htmlFor="role" className="block text-responsive-sm font-medium mb-1.5" style={{ color:'var(--text-secondary)' }}>
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={emergencyRole}
                  onChange={(e) => setEmergencyRole(e.target.value as 'provider' | 'developer')}
                  className="input-field touch-target"
                >
                  <option value="provider">Provider</option>
                  <option value="developer">Developer</option>
                </select>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-responsive-sm font-medium mb-1.5" style={{ color:'var(--text-secondary)' }}>
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
                className="input-field touch-target"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-responsive-sm font-medium mb-1.5" style={{ color:'var(--text-secondary)' }}>
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
                <label htmlFor="totpCode" className="block text-responsive-sm font-medium mb-1.5" style={{ color:'var(--text-secondary)' }}>
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

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsEmergency(!isEmergency)}
              className="text-responsive-sm touch-target inline-flex items-center justify-center px-4"
              style={{ color:'var(--text-accent)' }}
            >
              {isEmergency ? 'Switch to normal login' : 'Emergency access'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

