'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import OpportunityEditForm from './edit-form';

type Opportunity = {
  id: string;
  publicId: string;
  customerId: string;
  customer?: { company?: string; primaryName?: string };
  estValue: number;
  valueType: string;
  stage: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchOpportunity();
  }, [params.id]);

  async function fetchOpportunity() {
    try {
      const response = await fetch(`/api/v2/opportunities/${params.id}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error('Opportunity not found');
        throw new Error('Failed to fetch opportunity');
      }
      const data = await response.json();
      setOpportunity(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(data: any) {
    const response = await fetch(`/api/v2/opportunities/${params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': `opp-update-${params.id}-${Date.now()}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update opportunity');
    }

    const updated = await response.json();
    setOpportunity(updated);
    setEditing(false);
  }

  if (loading) {
    return <div className="p-6"><div className="text-gray-500">Loading opportunity...</div></div>;
  }

  if (error || !opportunity) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <Link href="/opportunities" className="text-blue-600 hover:text-blue-800">← Back to Opportunities</Link>
        </div>
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-red-800">
          <strong>Error:</strong> {error || 'Opportunity not found'}
        </div>
      </div>
    );
  }

  const stageColors: Record<string, string> = {
    PROSPECT: 'bg-gray-100 text-gray-800',
    QUALIFIED: 'bg-blue-100 text-blue-800',
    PROPOSAL: 'bg-yellow-100 text-yellow-800',
    NEGOTIATION: 'bg-orange-100 text-orange-800',
    WON: 'bg-green-100 text-green-800',
    LOST: 'bg-red-100 text-red-800',
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Link href="/opportunities" className="text-blue-600 hover:text-blue-800">← Back to Opportunities</Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              {opportunity.customer?.company || opportunity.customer?.primaryName || 'Opportunity'}
            </h1>
            <p className="text-gray-500 mt-1">ID: {opportunity.publicId}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${stageColors[opportunity.stage] || 'bg-gray-100 text-gray-800'}`}>
            {opportunity.stage}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Estimated Value</h3>
            <p className="text-lg font-semibold">${(opportunity.estValue / 100).toFixed(2)}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Value Type</h3>
            <p className="text-lg">{opportunity.valueType.replace('_', ' ')}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Created</h3>
            <p className="text-lg">{new Date(opportunity.createdAt).toLocaleDateString()}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
            <p className="text-lg">{new Date(opportunity.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>

        {opportunity.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{opportunity.notes}</p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200 flex gap-4">
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Edit Opportunity
          </button>
          <button
            onClick={() => router.push('/opportunities')}
            className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
          >
            Back to List
          </button>
        </div>
      </div>

      {editing && (
        <OpportunityEditForm
          opportunity={opportunity}
          onSave={handleSave}
          onCancel={() => setEditing(false)}
        />
      )}
    </div>
  );
}

