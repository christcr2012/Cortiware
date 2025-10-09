'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

// Password strength calculator
function calculatePasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' };

  let score = 0;

  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  // Determine label and color
  if (score <= 2) return { score, label: 'Weak', color: '#ef4444' };
  if (score <= 4) return { score, label: 'Fair', color: '#f59e0b' };
  if (score <= 6) return { score, label: 'Good', color: '#10b981' };
  return { score, label: 'Strong', color: '#10b981' };
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const error = searchParams.get('error');
  const totpRequired = searchParams.get('totp') === 'required';
  const locked = searchParams.get('locked') === 'true';

  const passwordStrength = calculatePasswordStrength(password);

  const errorMessages: Record<string, string> = {
    missing: 'Please enter your email and password',
    invalid: 'Invalid email or password',
    locked: 'Account locked due to too many failed attempts. Try again in 15 minutes.',
    rate_limit: 'Too many login attempts. Please try again later.',
  };

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('provider_remembered_email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Save or clear remembered email
    if (rememberMe) {
      localStorage.setItem('provider_remembered_email', email);
    } else {
      localStorage.removeItem('provider_remembered_email');
    }

    const form = e.target as HTMLFormElement;
    form.action = '/api/auth/login';
    form.method = 'POST';
    form.submit();
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      if (res.ok) {
        setForgotPasswordSent(true);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'github') => {
    window.location.href = `/api/auth/oauth/${provider}`;
  };

  // Forgot Password Modal
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-main)' }}>
        <div className="premium-card w-full max-w-md">
          <div>
            <h2 className="text-responsive-2xl font-bold text-center" style={{ color: 'var(--text-primary)' }}>
              Reset Password
            </h2>
            <p className="mt-2 text-responsive-sm text-center" style={{ color: 'var(--text-secondary)' }}>
              Enter your email to receive a password reset link
            </p>
          </div>

          {forgotPasswordSent ? (
            <div className="mt-6">
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <p className="font-medium">Check your email</p>
                <p className="text-sm mt-1">We've sent a password reset link to {forgotPasswordEmail}</p>
              </div>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordSent(false);
                  setForgotPasswordEmail('');
                }}
                className="btn-primary w-full mt-4 touch-target-comfortable"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleForgotPassword}>
              <div>
                <label htmlFor="forgot-email" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Email address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="input-field touch-target w-full"
                  placeholder="you@example.com"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex-1 touch-target-comfortable"
                >
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="px-4 py-2 rounded font-medium touch-target-comfortable"
                  style={{ background: 'var(--surface-3)', color: 'var(--text-primary)' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

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
          <div className="mt-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--accent-error)', color: 'var(--accent-error)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
            {errorMessages[error] || 'An error occurred'}
          </div>
        )}

        {locked && (
          <div className="mt-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--accent-error)', color: 'var(--accent-error)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
            {errorMessages.locked}
          </div>
        )}

        {totpRequired && (
          <div className="mt-4" style={{ background: 'var(--surface-1)', border: '1px solid var(--accent-info)', color: 'var(--accent-info)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
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
                className="input-field touch-target w-full"
                placeholder="provider@example.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-responsive-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs"
                  style={{ color: 'var(--brand-primary)' }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field touch-target w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--surface-2)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${(passwordStrength.score / 7) * 100}%`,
                          background: passwordStrength.color,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium" style={{ color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    Use 12+ characters with mix of letters, numbers & symbols
                  </p>
                </div>
              )}
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
                  className="input-field touch-target w-full"
                />
              </div>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded"
              style={{ accentColor: 'var(--brand-primary)' }}
            />
            <label htmlFor="remember-me" className="ml-2 text-responsive-sm" style={{ color: 'var(--text-secondary)' }}>
              Remember me for 30 days
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || locked}
              className="btn-primary w-full touch-target-comfortable"
              style={{ opacity: isSubmitting || locked ? 0.6 : 1 }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          {/* Social Login */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'var(--border-primary)' }} />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2" style={{ background: 'var(--surface-1)', color: 'var(--text-tertiary)' }}>
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded font-medium touch-target-comfortable"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('github')}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded font-medium touch-target-comfortable"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Protected by rate limiting. 5 failed attempts will lock your account for 15 minutes.
          </p>
        </div>
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

