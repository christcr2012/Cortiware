'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Opportunity = {
  id: string;
  publicId: string;
  customerId: string;
  customer?: { id: string; name: string };
  valueType: string;
  estValue: number;
  stage: string;
  createdAt: string;
};

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOpportunities();
  }, []);

  async function fetchOpportunities(query?: string) {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      params.set('limit', '50');
      
      const response = await fetch(`/api/v2/opportunities?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch opportunities: ${response.statusText}`);
      }
      
      const data = await response.json();
      setOpportunities(data.items || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchOpportunities(searchQuery);
  }

  function formatCurrency(cents: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  }

  return (
    <div className="container-responsive spacing-responsive-md">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-responsive-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Opportunities</h1>
        <Link
          href="/opportunities/new"
          className="btn-primary touch-target-comfortable w-full sm:w-auto justify-center"
        >
          + New Opportunity
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-4 sm:mb-6 premium-card spacing-responsive-sm">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name..."
            className="input-field touch-target flex-1"
          />
          <button
            type="submit"
            className="btn-secondary touch-target-comfortable w-full sm:w-auto"
          >
            Search
          </button>
        </div>
      </form>

      {loading && (
        <div className="text-center py-8 sm:py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" style={{ borderColor: 'var(--brand-primary)', borderRightColor: 'transparent' }}></div>
          <p className="mt-2 text-responsive-sm" style={{ color: 'var(--text-secondary)' }}>Loading opportunities...</p>
        </div>
      )}

      {error && (
        <div className="premium-card spacing-responsive-sm" style={{ background: 'var(--surface-1)', border: '1px solid var(--accent-error)', color: 'var(--accent-error)' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && opportunities.length === 0 && (
        <div className="text-center py-8 sm:py-12" style={{ color: 'var(--text-secondary)' }}>
          <p className="text-responsive-lg">No opportunities found</p>
          <p className="mt-2 text-responsive-sm">Create your first opportunity to get started</p>
        </div>
      )}

      {!loading && !error && opportunities.length > 0 && (
        <div className="table-responsive">
          <table className="min-w-full divide-y" style={{ borderColor: 'var(--border-primary)' }}>
            <thead style={{ background: 'var(--surface-1)' }}>
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Customer
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Value
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider hide-mobile" style={{ color: 'var(--text-secondary)' }}>
                  Type
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Stage
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider hide-mobile" style={{ color: 'var(--text-secondary)' }}>
                  Created
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{ background: 'var(--bg-main)' }} className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
              {opportunities.map((opp) => (
                <tr key={opp.id} className="transition-colors" style={{ background: 'var(--bg-main)' }}>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-primary)' }}>
                    {opp.customer?.name || opp.customerId}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(opp.estValue)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm hide-mobile" style={{ color: 'var(--text-secondary)' }}>
                    {opp.valueType}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      opp.stage === 'WON' ? 'bg-green-100 text-green-800' :
                      opp.stage === 'LOST' ? 'bg-red-100 text-red-800' :
                      opp.stage === 'PROPOSAL' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {opp.stage}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm hide-mobile" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(opp.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/opportunities/${opp.id}`}
                      className="touch-target inline-flex items-center justify-center px-3 py-1.5 rounded-md transition-colors"
                      style={{ color: 'var(--brand-primary)', background: 'var(--surface-hover)' }}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

