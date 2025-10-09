'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Organization = {
  id: string;
  publicId: string;
  company?: string;
  primaryName?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  createdAt: string;
};

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  async function fetchOrganizations(query?: string) {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      params.set('limit', '50');
      
      const response = await fetch(`/api/v2/organizations?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch organizations: ${response.statusText}`);
      }
      
      const data = await response.json();
      setOrganizations(data.items || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchOrganizations(searchQuery);
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Organizations</h1>
        <Link
          href="/organizations/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + New Organization
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
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
      </form>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading organizations...</p>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && organizations.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No organizations found</p>
          <p className="mt-2">Create your first organization to get started</p>
        </div>
      )}

      {!loading && !error && organizations.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Primary Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {organizations.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {org.company || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {org.primaryName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {org.primaryEmail || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {org.primaryPhone || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(org.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      href={`/organizations/${org.id}`}
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

