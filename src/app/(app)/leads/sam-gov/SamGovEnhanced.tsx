'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  INDUSTRY_NAICS_CODES, 
  NAICS_DESCRIPTIONS, 
  COMMON_PSC_CODES, 
  SET_ASIDE_TYPES, 
  NOTICE_TYPES 
} from '@/services/sam-gov.service';

interface SavedSearch {
  id: string;
  name: string;
  searchParams: any;
  createdAt: string;
  alertEnabled: boolean;
}

export default function SamGovEnhanced() {
  const [apiKey, setApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'saved' | 'analytics'>('search');
  
  // Search state
  const [searchParams, setSearchParams] = useState({
    keywords: '',
    naicsCodes: [] as string[],
    customNaics: '',
    pscCodes: [] as string[],
    state: '',
    city: '',
    zipCode: '',
    radius: 50,
    postedFrom: '',
    postedTo: '',
    responseDeadlineFrom: '',
    responseDeadlineTo: '',
    setAsideTypes: [] as string[],
    noticeTypes: [] as string[],
    active: true,
    minContractValue: '',
    maxContractValue: '',
  });

  const [results, setResults] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedOpportunities, setSelectedOpportunities] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedOpp, setExpandedOpp] = useState<string | null>(null);

  // Saved searches state
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [saveSearchAlert, setSaveSearchAlert] = useState(false);

  // Analytics state
  const [analytics, setAnalytics] = useState<any>(null);

  // Check for API key on mount
  useEffect(() => {
    checkApiKey();
    loadSavedSearches();
    loadAnalytics();
  }, []);

  const checkApiKey = async () => {
    try {
      const res = await fetch('/api/v2/settings/sam-gov');
      const data = await res.json();
      setHasApiKey(data.hasApiKey);
    } catch (err) {
      console.error('Error checking API key:', err);
    }
  };

  const loadSavedSearches = async () => {
    try {
      const res = await fetch('/api/v2/sam-gov/saved-searches');
      if (res.ok) {
        const data = await res.json();
        setSavedSearches(data.searches || []);
      }
    } catch (err) {
      console.error('Error loading saved searches:', err);
    }
  };

  const loadAnalytics = async () => {
    try {
      const res = await fetch('/api/v2/sam-gov/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
    }
  };

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

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    setError(null);

    try {
      // Add custom NAICS codes if provided
      const naicsCodes = [...searchParams.naicsCodes];
      if (searchParams.customNaics) {
        naicsCodes.push(...searchParams.customNaics.split(',').map(c => c.trim()));
      }

      const res = await fetch('/api/v2/sam-gov/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...searchParams, naicsCodes }),
      });

      if (!res.ok) {
        throw new Error('Search failed');
      }

      const data = await res.json();
      setResults(data.opportunities || []);
      setTotalRecords(data.totalRecords || 0);
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveSearch = async () => {
    if (!saveSearchName) return;

    try {
      const res = await fetch('/api/v2/sam-gov/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saveSearchName,
          searchParams,
          alertEnabled: saveSearchAlert,
        }),
      });

      if (res.ok) {
        setShowSaveDialog(false);
        setSaveSearchName('');
        setSaveSearchAlert(false);
        loadSavedSearches();
      }
    } catch (err) {
      setError('Failed to save search');
    }
  };

  const handleLoadSavedSearch = (search: SavedSearch) => {
    setSearchParams(search.searchParams);
    setActiveTab('search');
    handleSearch();
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
      loadAnalytics(); // Refresh analytics
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

  const selectAll = () => {
    setSelectedOpportunities(new Set(results.map(r => r.noticeId)));
  };

  const selectNone = () => {
    setSelectedOpportunities(new Set());
  };

  const exportToCSV = () => {
    const headers = ['Notice ID', 'Title', 'Agency', 'Posted Date', 'Deadline', 'NAICS', 'State', 'Type'];
    const rows = results.map(opp => [
      opp.noticeId,
      opp.title,
      opp.department || '',
      opp.postedDate,
      opp.responseDeadLine || '',
      opp.naicsCode || '',
      opp.placeOfPerformance?.state?.code || '',
      opp.type || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sam-gov-opportunities-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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

  // Main interface will be continued in next part
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

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 rounded font-medium ${activeTab === 'search' ? 'btn-primary' : ''}`}
          style={activeTab !== 'search' ? { background: 'var(--surface-3)', color: 'var(--text-primary)' } : {}}
        >
          Search
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2 rounded font-medium ${activeTab === 'saved' ? 'btn-primary' : ''}`}
          style={activeTab !== 'saved' ? { background: 'var(--surface-3)', color: 'var(--text-primary)' } : {}}
        >
          Saved Searches ({savedSearches.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded font-medium ${activeTab === 'analytics' ? 'btn-primary' : ''}`}
          style={activeTab !== 'analytics' ? { background: 'var(--surface-3)', color: 'var(--text-primary)' } : {}}
        >
          Analytics
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
          {error}
        </div>
      )}

      {/* SEARCH TAB */}
      {activeTab === 'search' && (
        <>
          {/* Enhanced Search Form */}
          <form onSubmit={handleSearch} className="premium-card mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Search Federal Opportunities
              </h2>
              <button
                type="button"
                onClick={() => setShowSaveDialog(true)}
                className="btn-secondary text-sm"
              >
                💾 Save Search
              </button>
            </div>

            <div className="space-y-6">
              {/* Keywords */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Keywords
                </label>
                <input
                  type="text"
                  value={searchParams.keywords}
                  onChange={(e) => setSearchParams({ ...searchParams, keywords: e.target.value })}
                  placeholder="e.g., roofing, HVAC, janitorial, construction"
                  className="input-field w-full"
                />
              </div>

              {/* Industry & NAICS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Industry Preset
                  </label>
                  <select
                    onChange={(e) => {
                      const codes = e.target.value ? INDUSTRY_NAICS_CODES[e.target.value as keyof typeof INDUSTRY_NAICS_CODES] : [];
                      setSearchParams({ ...searchParams, naicsCodes: codes });
                    }}
                    className="input-field w-full"
                  >
                    <option value="">Select Industry</option>
                    <option value="roofing">Roofing (238160)</option>
                    <option value="hvac">HVAC (238220)</option>
                    <option value="janitorial">Janitorial/Cleaning (561720, 561740, 561790)</option>
                    <option value="construction">Construction (236220, 238)</option>
                    <option value="landscaping">Landscaping (561730)</option>
                    <option value="painting">Painting (238320)</option>
                    <option value="electrical">Electrical (238210)</option>
                    <option value="plumbing">Plumbing (238220)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Custom NAICS Codes (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={searchParams.customNaics}
                    onChange={(e) => setSearchParams({ ...searchParams, customNaics: e.target.value })}
                    placeholder="e.g., 238160, 561720"
                    className="input-field w-full"
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                    Selected: {searchParams.naicsCodes.join(', ') || 'None'}
                  </p>
                </div>
              </div>

              {/* PSC Codes */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Product Service Codes (PSC)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(COMMON_PSC_CODES).map(([code, desc]) => (
                    <label key={code} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={searchParams.pscCodes.includes(code)}
                        onChange={(e) => {
                          const newCodes = e.target.checked
                            ? [...searchParams.pscCodes, code]
                            : searchParams.pscCodes.filter(c => c !== code);
                          setSearchParams({ ...searchParams, pscCodes: newCodes });
                        }}
                      />
                      <span style={{ color: 'var(--text-primary)' }}>{code} - {desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Geographic Filters */}
              <div>
                <h3 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Geographic Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>State</label>
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
                    <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>City</label>
                    <input
                      type="text"
                      value={searchParams.city}
                      onChange={(e) => setSearchParams({ ...searchParams, city: e.target.value })}
                      placeholder="e.g., Los Angeles"
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>ZIP Code</label>
                    <input
                      type="text"
                      value={searchParams.zipCode}
                      onChange={(e) => setSearchParams({ ...searchParams, zipCode: e.target.value })}
                      placeholder="e.g., 90210"
                      maxLength={5}
                      className="input-field w-full"
                    />
                  </div>
                </div>
                {searchParams.zipCode && (
                  <div className="mt-3">
                    <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                      Radius: {searchParams.radius} miles
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      step="10"
                      value={searchParams.radius}
                      onChange={(e) => setSearchParams({ ...searchParams, radius: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              {/* Date Filters */}
              <div>
                <h3 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Date Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Posted From</label>
                    <input
                      type="date"
                      value={searchParams.postedFrom}
                      onChange={(e) => setSearchParams({ ...searchParams, postedFrom: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Posted To</label>
                    <input
                      type="date"
                      value={searchParams.postedTo}
                      onChange={(e) => setSearchParams({ ...searchParams, postedTo: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Deadline From</label>
                    <input
                      type="date"
                      value={searchParams.responseDeadlineFrom}
                      onChange={(e) => setSearchParams({ ...searchParams, responseDeadlineFrom: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Deadline To</label>
                    <input
                      type="date"
                      value={searchParams.responseDeadlineTo}
                      onChange={(e) => setSearchParams({ ...searchParams, responseDeadlineTo: e.target.value })}
                      className="input-field w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Contract Value */}
              <div>
                <h3 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Contract Value Range</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Minimum ($)</label>
                    <input
                      type="number"
                      value={searchParams.minContractValue}
                      onChange={(e) => setSearchParams({ ...searchParams, minContractValue: e.target.value })}
                      placeholder="e.g., 10000"
                      className="input-field w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Maximum ($)</label>
                    <input
                      type="number"
                      value={searchParams.maxContractValue}
                      onChange={(e) => setSearchParams({ ...searchParams, maxContractValue: e.target.value })}
                      placeholder="e.g., 1000000"
                      className="input-field w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Notice Types */}
              <div>
                <h3 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Notice Types</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(NOTICE_TYPES).map(([code, desc]) => (
                    <label key={code} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={searchParams.noticeTypes.includes(code)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...searchParams.noticeTypes, code]
                            : searchParams.noticeTypes.filter(t => t !== code);
                          setSearchParams({ ...searchParams, noticeTypes: newTypes });
                        }}
                      />
                      <span style={{ color: 'var(--text-primary)' }}>{desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Set-Aside Types */}
              <div>
                <h3 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>Set-Aside Types</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {Object.entries(SET_ASIDE_TYPES).map(([code, desc]) => (
                    <label key={code} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={searchParams.setAsideTypes.includes(code)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...searchParams.setAsideTypes, code]
                            : searchParams.setAsideTypes.filter(t => t !== code);
                          setSearchParams({ ...searchParams, setAsideTypes: newTypes });
                        }}
                      />
                      <span style={{ color: 'var(--text-primary)' }}>{desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Active/Archived Toggle */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={searchParams.active}
                    onChange={(e) => setSearchParams({ ...searchParams, active: e.target.checked })}
                  />
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    Active opportunities only (exclude archived)
                  </span>
                </label>
              </div>

              {/* Search Buttons */}
              <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-primary)' }}>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="btn-primary"
                  style={{ opacity: isSearching ? 0.6 : 1 }}
                >
                  {isSearching ? '🔍 Searching...' : '🔍 Search Opportunities'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchParams({
                      keywords: '',
                      naicsCodes: [],
                      customNaics: '',
                      pscCodes: [],
                      state: '',
                      city: '',
                      zipCode: '',
                      radius: 50,
                      postedFrom: '',
                      postedTo: '',
                      responseDeadlineFrom: '',
                      responseDeadlineTo: '',
                      setAsideTypes: [],
                      noticeTypes: [],
                      active: true,
                      minContractValue: '',
                      maxContractValue: '',
                    });
                    setResults([]);
                  }}
                  className="btn-secondary"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </form>

          {/* Results Section */}
          {results.length > 0 && (
            <div className="premium-card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Found {totalRecords} Opportunities
                </h2>
                <div className="flex gap-2">
                  <button onClick={selectAll} className="btn-secondary text-sm">
                    Select All
                  </button>
                  <button onClick={selectNone} className="btn-secondary text-sm">
                    Select None
                  </button>
                  <button onClick={exportToCSV} className="btn-secondary text-sm">
                    📊 Export CSV
                  </button>
                  {selectedOpportunities.size > 0 && (
                    <button
                      onClick={handleImportSelected}
                      disabled={isImporting}
                      className="btn-primary text-sm"
                    >
                      {isImporting ? `Importing ${selectedOpportunities.size}...` : `Import ${selectedOpportunities.size} Selected`}
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {results.map((opp) => {
                  const daysUntilDeadline = opp.responseDeadLine
                    ? Math.ceil((new Date(opp.responseDeadLine).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    : null;
                  const deadlineColor = daysUntilDeadline !== null
                    ? daysUntilDeadline < 7 ? '#ef4444' : daysUntilDeadline < 14 ? '#f59e0b' : '#10b981'
                    : 'var(--text-tertiary)';

                  return (
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
                          className="mt-1 touch-target"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                              {opp.title}
                            </h3>
                            <button
                              onClick={() => setExpandedOpp(expandedOpp === opp.noticeId ? null : opp.noticeId)}
                              className="text-sm px-3 py-1 rounded"
                              style={{ background: 'var(--surface-3)', color: 'var(--text-primary)' }}
                            >
                              {expandedOpp === opp.noticeId ? '▲ Less' : '▼ More'}
                            </button>
                          </div>

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
                              <span style={{ color: deadlineColor, fontWeight: daysUntilDeadline && daysUntilDeadline < 14 ? 'bold' : 'normal' }}>
                                {opp.responseDeadLine ? `${new Date(opp.responseDeadLine).toLocaleDateString()} (${daysUntilDeadline}d)` : 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-secondary)' }}>NAICS:</span>{' '}
                              <span style={{ color: 'var(--text-primary)' }}>{opp.naicsCode || 'N/A'}</span>
                            </div>
                          </div>

                          {!expandedOpp || expandedOpp !== opp.noticeId ? (
                            <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                              {opp.description || 'No description available'}
                            </p>
                          ) : (
                            <div className="mt-4 space-y-3 p-4 rounded" style={{ background: 'var(--surface-1)' }}>
                              <div>
                                <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Description</h4>
                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                  {opp.description || 'No description available'}
                                </p>
                              </div>

                              {opp.solicitationNumber && (
                                <div>
                                  <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Solicitation Number</h4>
                                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{opp.solicitationNumber}</p>
                                </div>
                              )}

                              {opp.pointOfContact && opp.pointOfContact.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Points of Contact</h4>
                                  {opp.pointOfContact.map((contact: any, idx: number) => (
                                    <div key={idx} className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                                      <div><strong>{contact.fullName || 'N/A'}</strong> - {contact.title || 'N/A'}</div>
                                      {contact.email && <div>📧 <a href={`mailto:${contact.email}`} className="text-blue-500">{contact.email}</a></div>}
                                      {contact.phone && <div>📞 <a href={`tel:${contact.phone}`} className="text-blue-500">{contact.phone}</a></div>}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {opp.placeOfPerformance && (
                                <div>
                                  <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Place of Performance</h4>
                                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    {opp.placeOfPerformance.city?.name}, {opp.placeOfPerformance.state?.code} {opp.placeOfPerformance.zip}
                                  </p>
                                </div>
                              )}

                              {opp.typeOfSetAsideDescription && (
                                <div>
                                  <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Set-Aside</h4>
                                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{opp.typeOfSetAsideDescription}</p>
                                </div>
                              )}

                              {opp.uiLink && (
                                <div>
                                  <a
                                    href={opp.uiLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-primary text-sm inline-block"
                                  >
                                    View on SAM.gov →
                                  </a>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* SAVED SEARCHES TAB */}
      {activeTab === 'saved' && (
        <div className="premium-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Saved Searches
            </h2>
          </div>

          {savedSearches.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
                No saved searches yet
              </p>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                Save your search criteria from the Search tab to quickly run them again later
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedSearches.map((search) => (
                <div
                  key={search.id}
                  className="p-4 rounded border"
                  style={{ borderColor: 'var(--border-primary)', background: 'var(--surface-2)' }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                        {search.name}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Created: {new Date(search.createdAt).toLocaleDateString()}
                        {search.lastRun && ` • Last run: ${new Date(search.lastRun).toLocaleDateString()}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLoadSavedSearch(search)}
                        className="btn-primary text-sm"
                      >
                        ▶ Run Search
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Delete "${search.name}"?`)) {
                            try {
                              await fetch(`/api/v2/sam-gov/saved-searches?id=${search.id}`, { method: 'DELETE' });
                              loadSavedSearches();
                            } catch (err) {
                              setError('Failed to delete search');
                            }
                          }
                        }}
                        className="btn-secondary text-sm"
                        style={{ color: '#ef4444' }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {search.searchParams.keywords && (
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>Keywords:</span>{' '}
                        <span style={{ color: 'var(--text-primary)' }}>{search.searchParams.keywords}</span>
                      </div>
                    )}
                    {search.searchParams.naicsCodes?.length > 0 && (
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>NAICS:</span>{' '}
                        <span style={{ color: 'var(--text-primary)' }}>{search.searchParams.naicsCodes.join(', ')}</span>
                      </div>
                    )}
                    {search.searchParams.state && (
                      <div>
                        <span style={{ color: 'var(--text-secondary)' }}>State:</span>{' '}
                        <span style={{ color: 'var(--text-primary)' }}>{search.searchParams.state}</span>
                      </div>
                    )}
                    {search.alertEnabled && (
                      <div>
                        <span style={{ color: '#10b981' }}>🔔 Alerts: {search.alertFrequency || 'enabled'}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="kpi-card">
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Imported</div>
              <div className="text-3xl font-bold mt-2" style={{ color: 'var(--text-primary)' }}>
                {analytics?.totalImported || 0}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                SAM.gov opportunities imported as leads
              </div>
            </div>

            <div className="kpi-card">
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Converted</div>
              <div className="text-3xl font-bold mt-2" style={{ color: '#10b981' }}>
                {analytics?.converted || 0}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Opportunities won/converted
              </div>
            </div>

            <div className="kpi-card">
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Conversion Rate</div>
              <div className="text-3xl font-bold mt-2" style={{ color: 'var(--brand-primary)' }}>
                {analytics?.conversionRate?.toFixed(1) || 0}%
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Success rate on imported opportunities
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By NAICS */}
            <div className="premium-card">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Opportunities by NAICS Code
              </h3>
              {analytics?.byNaics && Object.keys(analytics.byNaics).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(analytics.byNaics)
                    .sort(([, a]: any, [, b]: any) => b - a)
                    .slice(0, 10)
                    .map(([naics, count]: any) => {
                      const maxCount = Math.max(...Object.values(analytics.byNaics));
                      const percentage = (count / maxCount) * 100;
                      return (
                        <div key={naics}>
                          <div className="flex justify-between text-sm mb-1">
                            <span style={{ color: 'var(--text-primary)' }}>
                              {naics} - {NAICS_DESCRIPTIONS[naics] || 'Unknown'}
                            </span>
                            <span style={{ color: 'var(--text-secondary)' }}>{count}</span>
                          </div>
                          <div className="h-2 rounded" style={{ background: 'var(--surface-3)' }}>
                            <div
                              className="h-full rounded"
                              style={{ width: `${percentage}%`, background: 'var(--brand-primary)' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                  No data available
                </p>
              )}
            </div>

            {/* By State */}
            <div className="premium-card">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Opportunities by State
              </h3>
              {analytics?.byState && Object.keys(analytics.byState).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(analytics.byState)
                    .sort(([, a]: any, [, b]: any) => b - a)
                    .slice(0, 10)
                    .map(([state, count]: any) => {
                      const maxCount = Math.max(...Object.values(analytics.byState));
                      const percentage = (count / maxCount) * 100;
                      return (
                        <div key={state}>
                          <div className="flex justify-between text-sm mb-1">
                            <span style={{ color: 'var(--text-primary)' }}>{state}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{count}</span>
                          </div>
                          <div className="h-2 rounded" style={{ background: 'var(--surface-3)' }}>
                            <div
                              className="h-full rounded"
                              style={{ width: `${percentage}%`, background: '#10b981' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                  No data available
                </p>
              )}
            </div>

            {/* By Status */}
            <div className="premium-card">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Opportunities by Status
              </h3>
              {analytics?.byStatus && Object.keys(analytics.byStatus).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(analytics.byStatus).map(([status, count]: any) => {
                    const total = Object.values(analytics.byStatus).reduce((a: any, b: any) => a + b, 0);
                    const percentage = ((count / total) * 100).toFixed(1);
                    const statusColors: Record<string, string> = {
                      NEW: '#3b82f6',
                      CONTACTED: '#f59e0b',
                      QUALIFIED: '#8b5cf6',
                      CONVERTED: '#10b981',
                      LOST: '#ef4444',
                    };
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ background: statusColors[status] || 'var(--text-tertiary)' }}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between text-sm">
                            <span style={{ color: 'var(--text-primary)' }}>{status}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>
                              {count} ({percentage}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                  No data available
                </p>
              )}
            </div>

            {/* Export Button */}
            <div className="premium-card flex items-center justify-center">
              <button
                onClick={() => {
                  const csv = [
                    ['Metric', 'Value'],
                    ['Total Imported', analytics?.totalImported || 0],
                    ['Converted', analytics?.converted || 0],
                    ['Conversion Rate', `${analytics?.conversionRate?.toFixed(1) || 0}%`],
                    [''],
                    ['NAICS Code', 'Count'],
                    ...Object.entries(analytics?.byNaics || {}).map(([k, v]) => [k, v]),
                    [''],
                    ['State', 'Count'],
                    ...Object.entries(analytics?.byState || {}).map(([k, v]) => [k, v]),
                    [''],
                    ['Status', 'Count'],
                    ...Object.entries(analytics?.byStatus || {}).map(([k, v]) => [k, v]),
                  ].map(row => row.join(',')).join('\n');

                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `sam-gov-analytics-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="btn-primary"
              >
                📊 Export Analytics to CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Search Dialog */}
      {showSaveDialog && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowSaveDialog(false)}
        >
          <div
            className="premium-card max-w-md w-full m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Save Search
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Search Name
                </label>
                <input
                  type="text"
                  value={saveSearchName}
                  onChange={(e) => setSaveSearchName(e.target.value)}
                  placeholder="e.g., Roofing Opportunities in CA"
                  className="input-field w-full"
                  autoFocus
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={saveSearchAlert}
                    onChange={(e) => setSaveSearchAlert(e.target.checked)}
                  />
                  <span style={{ color: 'var(--text-primary)' }}>
                    Enable email alerts for new opportunities
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveSearch}
                  disabled={!saveSearchName}
                  className="btn-primary flex-1"
                  style={{ opacity: !saveSearchName ? 0.5 : 1 }}
                >
                  Save Search
                </button>
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setSaveSearchName('');
                    setSaveSearchAlert(false);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

