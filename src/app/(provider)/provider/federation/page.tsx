'use client';

import { useState } from 'react';
import FederationKeys from './FederationKeys';
import OIDCConfig from './OIDCConfig';
import ProviderIntegrations from './ProviderIntegrations';

export default function ProviderFederationPage() {
  const [activeTab, setActiveTab] = useState<'keys' | 'oidc' | 'providers'>('keys');

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--brand-gradient)' }}>
          Federation Management
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Manage federation keys, API access, and cross-provider integrations
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <button
          onClick={() => setActiveTab('keys')}
          className="px-4 py-2 font-medium transition-colors"
          style={{
            color: activeTab === 'keys' ? 'var(--brand-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'keys' ? '2px solid var(--brand-primary)' : 'none'
          }}
        >
          Federation Keys
        </button>
        <button
          onClick={() => setActiveTab('oidc')}
          className="px-4 py-2 font-medium transition-colors"
          style={{
            color: activeTab === 'oidc' ? 'var(--brand-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'oidc' ? '2px solid var(--brand-primary)' : 'none'
          }}
        >
          OIDC Configuration
        </button>
        <button
          onClick={() => setActiveTab('providers')}
          className="px-4 py-2 font-medium transition-colors"
          style={{
            color: activeTab === 'providers' ? 'var(--brand-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'providers' ? '2px solid var(--brand-primary)' : 'none'
          }}
        >
          Provider Integrations
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'keys' && <FederationKeys />}
      {activeTab === 'oidc' && <OIDCConfig />}
      {activeTab === 'providers' && <ProviderIntegrations />}
    </div>
  );
}

