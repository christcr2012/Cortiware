'use client';

import { useState } from 'react';
import { ThemeSwitcher } from "@/components/dev-aids/ThemeSwitcher";

export default function ProviderSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'notifications' | 'integrations'>('general');

  return (
    <div className="container-responsive spacing-responsive-md">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-responsive-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Provider Settings
        </h1>
        <p className="text-responsive-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
          Configure your provider portal preferences and settings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b mb-6" style={{ borderColor: 'var(--border-primary)' }}>
        <button
          onClick={() => setActiveTab('general')}
          className="px-4 py-2 font-medium transition-colors touch-target"
          style={{
            color: activeTab === 'general' ? 'var(--brand-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'general' ? '2px solid var(--brand-primary)' : 'none'
          }}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className="px-4 py-2 font-medium transition-colors touch-target"
          style={{
            color: activeTab === 'security' ? 'var(--brand-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'security' ? '2px solid var(--brand-primary)' : 'none'
          }}
        >
          Security
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className="px-4 py-2 font-medium transition-colors touch-target"
          style={{
            color: activeTab === 'notifications' ? 'var(--brand-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'notifications' ? '2px solid var(--brand-primary)' : 'none'
          }}
        >
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('integrations')}
          className="px-4 py-2 font-medium transition-colors touch-target"
          style={{
            color: activeTab === 'integrations' ? 'var(--brand-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'integrations' ? '2px solid var(--brand-primary)' : 'none'
          }}
        >
          Integrations
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && <GeneralSettings />}
      {activeTab === 'security' && <SecuritySettings />}
      {activeTab === 'notifications' && <NotificationSettings />}
      {activeTab === 'integrations' && <IntegrationSettings />}
    </div>
  );
}

// General Settings Component
function GeneralSettings() {
  const [providerName, setProviderName] = useState('Cortiware Provider');
  const [contactEmail, setContactEmail] = useState('provider@cortiware.com');
  const [supportUrl, setSupportUrl] = useState('https://support.cortiware.com');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Settings saved successfully');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <div className="premium-card spacing-responsive-sm">
        <h2 className="text-responsive-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Theme Customization</h2>
        <p className="text-responsive-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Choose a theme for the Provider portal. This setting is separate from client-side themes.
        </p>
        <ThemeSwitcher scope="admin" />
      </div>

      {/* Provider Information */}
      <div className="premium-card spacing-responsive-sm">
        <h2 className="text-responsive-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Provider Information</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="providerName" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Provider Name
            </label>
            <input
              type="text"
              id="providerName"
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              className="input-field touch-target w-full"
            />
          </div>

          <div>
            <label htmlFor="contactEmail" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Contact Email
            </label>
            <input
              type="email"
              id="contactEmail"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="input-field touch-target w-full"
            />
          </div>

          <div>
            <label htmlFor="supportUrl" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Support URL
            </label>
            <input
              type="url"
              id="supportUrl"
              value={supportUrl}
              onChange={(e) => setSupportUrl(e.target.value)}
              className="input-field touch-target w-full"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary touch-target-comfortable"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Security Settings Component
function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [saving, setSaving] = useState(false);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setSaving(false);
    }
  };

  const handleSecuritySave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Security settings saved successfully');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <div className="premium-card spacing-responsive-sm">
        <h2 className="text-responsive-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Change Password</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-field touch-target w-full"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field touch-target w-full"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field touch-target w-full"
            />
          </div>

          <button
            onClick={handlePasswordChange}
            disabled={saving || !currentPassword || !newPassword || !confirmPassword}
            className="btn-primary touch-target-comfortable"
          >
            {saving ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="premium-card spacing-responsive-sm">
        <h2 className="text-responsive-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Two-Factor Authentication</h2>
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            id="twoFactor"
            checked={twoFactorEnabled}
            onChange={(e) => setTwoFactorEnabled(e.target.checked)}
            className="w-5 h-5"
          />
          <label htmlFor="twoFactor" className="text-responsive-base" style={{ color: 'var(--text-primary)' }}>
            Enable Two-Factor Authentication
          </label>
        </div>
        <p className="text-responsive-sm" style={{ color: 'var(--text-secondary)' }}>
          Add an extra layer of security to your account by requiring a verification code in addition to your password.
        </p>
      </div>

      {/* Session Settings */}
      <div className="premium-card spacing-responsive-sm">
        <h2 className="text-responsive-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Session Settings</h2>
        <div>
          <label htmlFor="sessionTimeout" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            Session Timeout (minutes)
          </label>
          <select
            id="sessionTimeout"
            value={sessionTimeout}
            onChange={(e) => setSessionTimeout(e.target.value)}
            className="input-field touch-target w-full"
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
            <option value="240">4 hours</option>
          </select>
        </div>

        <button
          onClick={handleSecuritySave}
          disabled={saving}
          className="btn-primary touch-target-comfortable mt-4"
        >
          {saving ? 'Saving...' : 'Save Security Settings'}
        </button>
      </div>
    </div>
  );
}

// Notification Settings Component
function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [incidentAlerts, setIncidentAlerts] = useState(true);
  const [billingAlerts, setBillingAlerts] = useState(true);
  const [usageAlerts, setUsageAlerts] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Notification settings saved successfully');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div className="premium-card spacing-responsive-sm">
        <h2 className="text-responsive-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Email Notifications</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="emailNotifications"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-5 h-5"
            />
            <label htmlFor="emailNotifications" className="text-responsive-base" style={{ color: 'var(--text-primary)' }}>
              Enable Email Notifications
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="incidentAlerts"
              checked={incidentAlerts}
              onChange={(e) => setIncidentAlerts(e.target.checked)}
              className="w-5 h-5"
            />
            <label htmlFor="incidentAlerts" className="text-responsive-base" style={{ color: 'var(--text-primary)' }}>
              Incident Alerts
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="billingAlerts"
              checked={billingAlerts}
              onChange={(e) => setBillingAlerts(e.target.checked)}
              className="w-5 h-5"
            />
            <label htmlFor="billingAlerts" className="text-responsive-base" style={{ color: 'var(--text-primary)' }}>
              Billing & Payment Alerts
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="usageAlerts"
              checked={usageAlerts}
              onChange={(e) => setUsageAlerts(e.target.checked)}
              className="w-5 h-5"
            />
            <label htmlFor="usageAlerts" className="text-responsive-base" style={{ color: 'var(--text-primary)' }}>
              Usage Threshold Alerts
            </label>
          </div>
        </div>
      </div>

      {/* Webhook Configuration */}
      <div className="premium-card spacing-responsive-sm">
        <h2 className="text-responsive-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Webhook Configuration</h2>
        <div>
          <label htmlFor="webhookUrl" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            Webhook URL
          </label>
          <input
            type="url"
            id="webhookUrl"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://your-app.com/webhooks/provider"
            className="input-field touch-target w-full"
          />
          <p className="text-responsive-sm mt-2" style={{ color: 'var(--text-tertiary)' }}>
            Receive real-time notifications via webhook for important events
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary touch-target-comfortable mt-4"
        >
          {saving ? 'Saving...' : 'Save Notification Settings'}
        </button>
      </div>
    </div>
  );
}

// Integration Settings Component
function IntegrationSettings() {
  const [stripeKey, setStripeKey] = useState('');
  const [samApiKey, setSamApiKey] = useState('');
  const [apiRateLimit, setApiRateLimit] = useState('1000');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Integration settings saved successfully');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Third-Party Integrations */}
      <div className="premium-card spacing-responsive-sm">
        <h2 className="text-responsive-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Third-Party Integrations</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="stripeKey" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Stripe Secret Key
            </label>
            <input
              type="password"
              id="stripeKey"
              value={stripeKey}
              onChange={(e) => setStripeKey(e.target.value)}
              placeholder="sk_live_..."
              className="input-field touch-target w-full"
            />
          </div>

          <div>
            <label htmlFor="samApiKey" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              SAM.gov API Key
            </label>
            <input
              type="password"
              id="samApiKey"
              value={samApiKey}
              onChange={(e) => setSamApiKey(e.target.value)}
              placeholder="Enter SAM.gov API key"
              className="input-field touch-target w-full"
            />
          </div>
        </div>
      </div>

      {/* API Configuration */}
      <div className="premium-card spacing-responsive-sm">
        <h2 className="text-responsive-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>API Configuration</h2>
        <div>
          <label htmlFor="apiRateLimit" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            API Rate Limit (requests per hour)
          </label>
          <select
            id="apiRateLimit"
            value={apiRateLimit}
            onChange={(e) => setApiRateLimit(e.target.value)}
            className="input-field touch-target w-full"
          >
            <option value="100">100 requests/hour</option>
            <option value="500">500 requests/hour</option>
            <option value="1000">1,000 requests/hour</option>
            <option value="5000">5,000 requests/hour</option>
            <option value="10000">10,000 requests/hour</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary touch-target-comfortable mt-4"
        >
          {saving ? 'Saving...' : 'Save Integration Settings'}
        </button>
      </div>
    </div>
  );
}

