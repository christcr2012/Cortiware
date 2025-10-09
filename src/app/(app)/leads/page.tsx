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
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Leads</h1>
        <Link
          href="/leads/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + New Lead
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company, name, or email..."
            className="flex-1 rounded-md border border-gray-300 px-4 py-2"
          />
          <button
            type="submit"
            className="rounded-md bg-gray-600 px-6 py-2 text-white hover:bg-gray-700"
          >
            Search
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
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
            <label htmlFor="sourceFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Source
            </label>
            <select
              id="sourceFilter"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
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
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'company')}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="createdAt">Date Created</option>
              <option value="company">Company/Name</option>
            </select>
          </div>

          <div>
            <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </form>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading leads...</p>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && leads.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No leads found</p>
          <p className="mt-2">Create your first lead to get started</p>
        </div>
      )}

      {!loading && !error && leads.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lead.company || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lead.contactName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lead.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lead.phoneE164 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      lead.status === 'QUALIFIED' ? 'bg-green-100 text-green-800' :
                      lead.status === 'CONTACTED' ? 'bg-blue-100 text-blue-800' :
                      lead.status === 'UNQUALIFIED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lead.sourceType || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="text-blue-600 hover:text-blue-800"
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

