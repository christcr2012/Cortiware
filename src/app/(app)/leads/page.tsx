'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Lead = {
  id: string;
  publicId: string;
  company?: string;
  contactName?: string;
  email?: string;
  phoneE164?: string;
  status: string;
  sourceType?: string;
  createdAt: string;
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'company'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, sourceFilter, sortBy, sortOrder]);

  async function fetchLeads(query?: string) {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (query || searchQuery) params.set('q', query || searchQuery);
      if (statusFilter) params.set('status', statusFilter);
      if (sourceFilter) params.set('sourceType', sourceFilter);
      params.set('limit', '50');

      const response = await fetch(`/api/v2/leads?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch leads: ${response.statusText}`);
      }

      const data = await response.json();
      let items = data.items || [];

      // Client-side sorting (since API doesn't support it yet)
      items.sort((a: Lead, b: Lead) => {
        let aVal, bVal;
        if (sortBy === 'createdAt') {
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
        } else {
          aVal = (a.company || a.contactName || '').toLowerCase();
          bVal = (b.company || b.contactName || '').toLowerCase();
        }

        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });

      setLeads(items);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchLeads(searchQuery);
  }

  return (
    <div className="container-responsive spacing-responsive-md">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <h1 className="text-responsive-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Leads</h1>
        <Link
          href="/leads/new"
          className="btn-primary touch-target-comfortable w-full sm:w-auto justify-center"
        >
          + New Lead
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-4 sm:mb-6 premium-card spacing-responsive-sm">
        <div className="flex flex-col sm:flex-row gap-2 mb-3 sm:mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company, name, or email..."
            className="input-field touch-target flex-1"
          />
          <button
            type="submit"
            className="btn-secondary touch-target-comfortable w-full sm:w-auto"
          >
            Search
          </button>
        </div>

        <div className="grid-responsive cols-sm-2 cols-lg-4">
          <div>
            <label htmlFor="statusFilter" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field touch-target"
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="CONVERTED">Converted</option>
              <option value="LOST">Lost</option>
            </select>
          </div>

          <div>
            <label htmlFor="sourceFilter" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Source
            </label>
            <select
              id="sourceFilter"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="input-field touch-target"
            >
              <option value="">All Sources</option>
              <option value="WEBSITE">Website</option>
              <option value="REFERRAL">Referral</option>
              <option value="COLD_CALL">Cold Call</option>
              <option value="SOCIAL_MEDIA">Social Media</option>
              <option value="EVENT">Event</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="sortBy" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Sort By
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'company')}
              className="input-field touch-target"
            >
              <option value="createdAt">Date Created</option>
              <option value="company">Company/Name</option>
            </select>
          </div>

          <div>
            <label htmlFor="sortOrder" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Order
            </label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="input-field touch-target"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </form>

      {loading && (
        <div className="text-center py-8 sm:py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" style={{ borderColor: 'var(--brand-primary)', borderRightColor: 'transparent' }}></div>
          <p className="mt-2 text-responsive-sm" style={{ color: 'var(--text-secondary)' }}>Loading leads...</p>
        </div>
      )}

      {error && (
        <div className="premium-card spacing-responsive-sm" style={{ background: 'var(--surface-1)', border: '1px solid var(--accent-error)', color: 'var(--accent-error)' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && leads.length === 0 && (
        <div className="text-center py-8 sm:py-12" style={{ color: 'var(--text-secondary)' }}>
          <p className="text-responsive-lg">No leads found</p>
          <p className="mt-2 text-responsive-sm">Create your first lead to get started</p>
        </div>
      )}

      {!loading && !error && leads.length > 0 && (
        <div className="table-responsive">
          <table className="min-w-full divide-y" style={{ borderColor: 'var(--border-primary)' }}>
            <thead style={{ background: 'var(--surface-1)' }}>
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Company
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Contact
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider hide-mobile" style={{ color: 'var(--text-secondary)' }}>
                  Email
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider hide-mobile" style={{ color: 'var(--text-secondary)' }}>
                  Phone
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider hide-mobile" style={{ color: 'var(--text-secondary)' }}>
                  Source
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody style={{ background: 'var(--bg-main)' }} className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
              {leads.map((lead) => (
                <tr key={lead.id} className="transition-colors" style={{ background: 'var(--bg-main)' }}>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-primary)' }}>
                    {lead.company || '-'}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-primary)' }}>
                    {lead.contactName || '-'}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm hide-mobile" style={{ color: 'var(--text-secondary)' }}>
                    {lead.email || '-'}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm hide-mobile" style={{ color: 'var(--text-secondary)' }}>
                    {lead.phoneE164 || '-'}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      lead.status === 'QUALIFIED' ? 'bg-green-100 text-green-800' :
                      lead.status === 'CONTACTED' ? 'bg-blue-100 text-blue-800' :
                      lead.status === 'UNQUALIFIED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm hide-mobile" style={{ color: 'var(--text-secondary)' }}>
                    {lead.sourceType || '-'}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/leads/${lead.id}`}
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

