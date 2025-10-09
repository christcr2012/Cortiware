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

      {/* Content will be added in next section */}
      <div>Tab content placeholder - will be completed in next iteration</div>
    </div>
  );
}

