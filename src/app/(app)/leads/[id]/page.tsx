'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type Lead = {
  id: string;
  publicId: string;
  company: string;
  contactName: string;
  email?: string;
  phoneE164?: string;
  status: string;
  sourceType?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchLead();
  }, [params.id]);

  async function fetchLead() {
    try {
      const response = await fetch(`/api/v2/leads/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Lead not found');
        }
        throw new Error('Failed to fetch lead');
      }
      const data = await response.json();
      setLead(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-gray-500">Loading lead...</div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <Link href="/leads" className="text-blue-600 hover:text-blue-800">
            ← Back to Leads
          </Link>
        </div>
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-red-800">
          <strong>Error:</strong> {error || 'Lead not found'}
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-800',
    CONTACTED: 'bg-yellow-100 text-yellow-800',
    QUALIFIED: 'bg-green-100 text-green-800',
    CONVERTED: 'bg-purple-100 text-purple-800',
    LOST: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/leads" className="text-blue-600 hover:text-blue-800">
          ← Back to Leads
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">{lead.company}</h1>
            <p className="text-gray-500 mt-1">ID: {lead.publicId}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[lead.status] || 'bg-gray-100 text-gray-800'}`}>
            {lead.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Contact Name</h3>
            <p className="text-lg">{lead.contactName}</p>
          </div>

          {lead.email && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
              <p className="text-lg">
                <a href={`mailto:${lead.email}`} className="text-blue-600 hover:text-blue-800">
                  {lead.email}
                </a>
              </p>
            </div>
          )}

          {lead.phoneE164 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Phone</h3>
              <p className="text-lg">
                <a href={`tel:${lead.phoneE164}`} className="text-blue-600 hover:text-blue-800">
                  {lead.phoneE164}
                </a>
              </p>
            </div>
          )}

          {lead.sourceType && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Source</h3>
              <p className="text-lg">{lead.sourceType}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
            <p className="text-lg">{new Date(lead.createdAt).toLocaleDateString()}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
            <p className="text-lg">{new Date(lead.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>

        {lead.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 flex gap-4">
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Edit Lead
          </button>
          <button
            onClick={() => router.push('/leads')}
            className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
          >
            Back to List
          </button>
        </div>
      </div>

      {editing && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800">
            <strong>Note:</strong> Edit functionality requires PUT /api/v2/leads/[id] endpoint (not yet implemented).
          </p>
          <button
            onClick={() => setEditing(false)}
            className="mt-2 text-sm text-yellow-700 underline"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

