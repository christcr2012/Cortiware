'use client';

import { useState } from 'react';
import Link from 'next/link';
import { INDUSTRY_NAICS_CODES } from '@/services/sam-gov.service';

export default function SamGovSearchPage() {
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [searchParams, setSearchParams] = useState({
    keywords: '',
    naicsCodes: [] as string[],
    state: '',
    city: '',
    zipCode: '',
    radius: 50,
    postedFrom: '',
    postedTo: '',
    setAsideTypes: [] as string[],
  });
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedOpportunities, setSelectedOpportunities] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveApiKey = async () => {
    try {
      const res = await fetch('/api/v2/settings/sam-gov', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });

      if (res.ok) {
        setHasApiKey(true);
        setError(null);
      } else {
        setError('Failed to save API key');
      }
    } catch (err) {
      setError('Error saving API key');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setError(null);

    try {
      const res = await fetch('/api/v2/sam-gov/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams),
      });

      if (!res.ok) {
        throw new Error('Search failed');
      }

      const data = await res.json();
      setResults(data.opportunities || []);
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleImportSelected = async () => {
    if (selectedOpportunities.size === 0) return;

    setIsImporting(true);
    setError(null);

    try {
      const opportunitiesToImport = results.filter(opp => 
        selectedOpportunities.has(opp.noticeId)
      );

      const res = await fetch('/api/v2/sam-gov/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunities: opportunitiesToImport }),
      });

      if (!res.ok) {
        throw new Error('Import failed');
      }

      const data = await res.json();
      alert(`Successfully imported ${data.imported} opportunities as leads!`);
      setSelectedOpportunities(new Set());
    } catch (err: any) {
      setError(err.message || 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  const toggleSelection = (noticeId: string) => {
    const newSelection = new Set(selectedOpportunities);
    if (newSelection.has(noticeId)) {
      newSelection.delete(noticeId);
    } else {
      newSelection.add(noticeId);
    }
    setSelectedOpportunities(newSelection);
  };

  // API Key Setup Screen
  if (!hasApiKey) {
    return (
      <div className="container-responsive">
        <div className="mb-6">
          <h1 className="text-responsive-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            SAM.gov Lead Generation
          </h1>
          <p className="text-responsive-base mt-2" style={{ color: 'var(--text-secondary)' }}>
            Search federal contract opportunities and import them as leads
          </p>
        </div>

        <div className="premium-card max-w-2xl">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Setup Required
          </h2>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
            To use SAM.gov lead generation, you need a free API key from SAM.gov.
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                How to get your SAM.gov API Key:
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <li>Visit <a href="https://open.gsa.gov/api/get-opportunities-public-api/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">SAM.gov API Documentation</a></li>
                <li>Click "Request an API Key" and fill out the form</li>
                <li>You'll receive your API key via email (usually within minutes)</li>
                <li>Copy your API key and paste it below</li>
              </ol>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                SAM.gov API Key
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your SAM.gov API key"
                className="input-field w-full"
              />
            </div>

            {error && (
              <div className="p-3 rounded" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                {error}
              </div>
            )}

            <button
              onClick={handleSaveApiKey}
              disabled={!apiKey}
              className="btn-primary w-full"
              style={{ opacity: !apiKey ? 0.5 : 1 }}
            >
              Save API Key & Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Search Interface
  return (
    <div className="container-responsive">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-responsive-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            SAM.gov Lead Generation
          </h1>
          <p className="text-responsive-base mt-2" style={{ color: 'var(--text-secondary)' }}>
            Search federal contract opportunities and import them as leads
          </p>
        </div>
        <Link href="/leads" className="btn-secondary">
          Back to Leads
        </Link>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="premium-card mb-6">
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Search Criteria
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Keywords
            </label>
            <input
              type="text"
              value={searchParams.keywords}
              onChange={(e) => setSearchParams({ ...searchParams, keywords: e.target.value })}
              placeholder="e.g., roofing, HVAC, janitorial"
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Industry (NAICS Codes)
            </label>
            <select
              onChange={(e) => {
                const codes = e.target.value ? INDUSTRY_NAICS_CODES[e.target.value as keyof typeof INDUSTRY_NAICS_CODES] : [];
                setSearchParams({ ...searchParams, naicsCodes: codes });
              }}
              className="input-field w-full"
            >
              <option value="">Select Industry</option>
              <option value="roofing">Roofing</option>
              <option value="hvac">HVAC</option>
              <option value="janitorial">Janitorial/Cleaning</option>
              <option value="construction">Construction</option>
              <option value="landscaping">Landscaping</option>
              <option value="painting">Painting</option>
              <option value="electrical">Electrical</option>
              <option value="plumbing">Plumbing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              State
            </label>
            <input
              type="text"
              value={searchParams.state}
              onChange={(e) => setSearchParams({ ...searchParams, state: e.target.value.toUpperCase() })}
              placeholder="e.g., CA, TX, NY"
              maxLength={2}
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Posted From
            </label>
            <input
              type="date"
              value={searchParams.postedFrom}
              onChange={(e) => setSearchParams({ ...searchParams, postedFrom: e.target.value })}
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Posted To
            </label>
            <input
              type="date"
              value={searchParams.postedTo}
              onChange={(e) => setSearchParams({ ...searchParams, postedTo: e.target.value })}
              className="input-field w-full"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={isSearching}
            className="btn-primary"
            style={{ opacity: isSearching ? 0.6 : 1 }}
          >
            {isSearching ? 'Searching...' : 'Search Opportunities'}
          </button>
          {selectedOpportunities.size > 0 && (
            <button
              type="button"
              onClick={handleImportSelected}
              disabled={isImporting}
              className="btn-secondary"
            >
              {isImporting ? 'Importing...' : `Import ${selectedOpportunities.size} Selected`}
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="mb-6 p-4 rounded" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="premium-card">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Found {results.length} Opportunities
          </h2>

          <div className="space-y-4">
            {results.map((opp) => (
              <div
                key={opp.noticeId}
                className="p-4 rounded border"
                style={{
                  borderColor: selectedOpportunities.has(opp.noticeId) ? 'var(--brand-primary)' : 'var(--border-primary)',
                  background: selectedOpportunities.has(opp.noticeId) ? 'rgba(var(--brand-primary-rgb), 0.05)' : 'var(--surface-2)',
                }}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedOpportunities.has(opp.noticeId)}
                    onChange={() => toggleSelection(opp.noticeId)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                      {opp.title}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-2">
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>Agency:</span>{' '}
                        <span style={{ color: 'var(--text-primary)' }}>{opp.department || 'N/A'}</span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>Posted:</span>{' '}
                        <span style={{ color: 'var(--text-primary)' }}>{new Date(opp.postedDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>Deadline:</span>{' '}
                        <span style={{ color: opp.responseDeadLine ? '#ef4444' : 'var(--text-tertiary)' }}>
                          {opp.responseDeadLine ? new Date(opp.responseDeadLine).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>NAICS:</span>{' '}
                        <span style={{ color: 'var(--text-primary)' }}>{opp.naicsCode || 'N/A'}</span>
                      </div>
                    </div>
                    {opp.description && (
                      <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                        {opp.description}
                      </p>
                    )}
                    {opp.uiLink && (
                      <a
                        href={opp.uiLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 underline mt-2 inline-block"
                      >
                        View on SAM.gov →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

