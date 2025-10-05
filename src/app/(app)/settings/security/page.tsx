'use client';

/**
 * Security Settings Page
 * 
 * Allows users to:
 * - Enable/disable two-factor authentication (TOTP)
 * - View and regenerate backup codes
 * - Change password
 * - View login history
 */

import { useState } from 'react';

export default function SecuritySettingsPage() {
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [enrollmentStep, setEnrollmentStep] = useState<'initial' | 'scan' | 'verify' | 'complete'>('initial');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get user email from cookie or session
  const getUserEmail = () => {
    // TODO: Get from actual session/cookie
    return 'user@example.com';
  };

  const handleEnableTOTP = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/totp/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: getUserEmail() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start enrollment');
      }

      setQrCode(data.qrCode);
      setSecret(data.secret);
      setBackupCodes(data.backupCodes);
      setEnrollmentStep('scan');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTOTP = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/totp/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: getUserEmail(),
          code: verificationCode,
          secret: secret,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }

      setTotpEnabled(true);
      setEnrollmentStep('complete');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisableTOTP = async () => {
    const password = prompt('Enter your password to disable 2FA:');
    if (!password) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/totp/enroll', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: getUserEmail(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to disable 2FA');
      }

      setTotpEnabled(false);
      setEnrollmentStep('initial');
      setQrCode('');
      setSecret('');
      setBackupCodes([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Security Settings</h1>

        {/* Two-Factor Authentication Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Two-Factor Authentication</h2>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {!totpEnabled && enrollmentStep === 'initial' && (
            <div>
              <p className="text-gray-300 mb-4">
                Add an extra layer of security to your account by enabling two-factor authentication.
                You'll need to enter a code from your authenticator app when you log in.
              </p>
              <button
                onClick={handleEnableTOTP}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Enable 2FA'}
              </button>
            </div>
          )}

          {enrollmentStep === 'scan' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Step 1: Scan QR Code</h3>
              <p className="text-gray-300 mb-4">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.)
              </p>
              {qrCode && (
                <div className="bg-white p-4 rounded-lg inline-block mb-4">
                  <img src={qrCode} alt="TOTP QR Code" className="w-64 h-64" />
                </div>
              )}
              <p className="text-gray-400 text-sm mb-4">
                Can't scan? Enter this code manually: <code className="bg-gray-700 px-2 py-1 rounded">{secret}</code>
              </p>
              
              <h3 className="text-lg font-semibold text-white mb-4 mt-6">Step 2: Save Backup Codes</h3>
              <p className="text-gray-300 mb-4">
                Save these backup codes in a safe place. You can use them to log in if you lose access to your authenticator app.
              </p>
              <div className="bg-gray-900 p-4 rounded-lg mb-4 font-mono text-sm">
                {backupCodes.map((code, i) => (
                  <div key={i} className="text-gray-300">{code}</div>
                ))}
              </div>

              <h3 className="text-lg font-semibold text-white mb-4 mt-6">Step 3: Verify</h3>
              <p className="text-gray-300 mb-4">
                Enter the 6-digit code from your authenticator app to complete setup:
              </p>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg w-32 text-center text-lg font-mono"
                />
                <button
                  onClick={handleVerifyTOTP}
                  disabled={loading || verificationCode.length !== 6}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Enable'}
                </button>
              </div>
            </div>
          )}

          {enrollmentStep === 'complete' && (
            <div>
              <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded mb-4">
                ✅ Two-factor authentication enabled successfully!
              </div>
              <button
                onClick={() => setEnrollmentStep('initial')}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium"
              >
                Done
              </button>
            </div>
          )}

          {totpEnabled && enrollmentStep === 'initial' && (
            <div>
              <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded mb-4">
                ✅ Two-factor authentication is enabled
              </div>
              <button
                onClick={handleDisableTOTP}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Disable 2FA'}
              </button>
            </div>
          )}
        </div>

        {/* Password Change Section */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Change Password</h2>
          <p className="text-gray-300 mb-4">
            Coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}

