'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import OrganizationEditForm from './edit-form';

type Organization = {
  id: string;
  publicId: string;
  company?: string;
  primaryName?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchOrganization();
  }, [params.id]);

  async function fetchOrganization() {
    try {
      const response = await fetch(`/api/v2/organizations/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error('Organization not found');
        throw new Error('Failed to fetch organization');
      }
      const data = await response.json();
      setOrganization(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(data: any) {
    const response = await fetch(`/api/v2/organizations/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': `org-update-${params.id}-${Date.now()}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update organization');
    }

    const updated = await response.json();
    setOrganization(updated);
    setEditing(false);
  }

  if (loading) {
    return <div className="p-6"><div className="text-gray-500">Loading organization...</div></div>;
  }

  if (error || !organization) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <Link href="/organizations" className="text-blue-600 hover:text-blue-800">← Back to Organizations</Link>
        </div>
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-red-800">
          <strong>Error:</strong> {error || 'Organization not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/organizations" className="text-blue-600 hover:text-blue-800">← Back to Organizations</Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{organization.company || organization.primaryName || 'Organization'}</h1>
          <p className="text-gray-500 mt-1">ID: {organization.publicId}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {organization.company && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Company</h3>
              <p className="text-lg">{organization.company}</p>
            </div>
          )}

          {organization.primaryName && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Primary Contact</h3>
              <p className="text-lg">{organization.primaryName}</p>
            </div>
          )}

          {organization.primaryEmail && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
              <p className="text-lg">
                <a href={`mailto:${organization.primaryEmail}`} className="text-blue-600 hover:text-blue-800">
                  {organization.primaryEmail}
                </a>
              </p>
            </div>
          )}

          {organization.primaryPhone && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Phone</h3>
              <p className="text-lg">
                <a href={`tel:${organization.primaryPhone}`} className="text-blue-600 hover:text-blue-800">
                  {organization.primaryPhone}
                </a>
              </p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
            <p className="text-lg">{new Date(organization.createdAt).toLocaleDateString()}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
            <p className="text-lg">{new Date(organization.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>

        {organization.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{organization.notes}</p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 flex gap-4">
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Edit Organization
          </button>
          <button
            onClick={() => router.push('/organizations')}
            className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
          >
            Back to List
          </button>
        </div>
      </div>

      {editing && (
        <OrganizationEditForm
          organization={organization}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      )}
    </div>
  );
}

