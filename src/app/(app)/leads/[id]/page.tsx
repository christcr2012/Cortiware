'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ConvertModal from './convert-modal';

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
  const [saving, setSaving] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    contactName: '',
    email: '',
    phoneE164: '',
    status: '',
    sourceType: '',
    notes: '',
  });

  useEffect(() => {
    fetchLead();
  }, [params.id]);

  useEffect(() => {
    if (lead) {
      setFormData({
        company: lead.company || '',
        contactName: lead.contactName || '',
        email: lead.email || '',
        phoneE164: lead.phoneE164 || '',
        status: lead.status || '',
        sourceType: lead.sourceType || '',
        notes: lead.notes || '',
      });
    }
  }, [lead]);

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

  async function handleSave() {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`/api/v2/leads/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': `lead-update-${params.id}-${Date.now()}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update lead');
      }

      const updated = await response.json();
      setLead(updated);
      setEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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
          {lead.status !== 'CONVERTED' && (
            <button
              onClick={() => setShowConvertModal(true)}
              className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
            >
              Convert to Opportunity
            </button>
          )}
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
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold mb-4">Edit Lead</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">Contact Name</label>
              <input
                type="text"
                id="contactName"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="phoneE164" className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                id="phoneE164"
                name="phoneE164"
                value={formData.phoneE164}
                onChange={handleChange}
                placeholder="+1234567890"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="CONVERTED">Converted</option>
                <option value="LOST">Lost</option>
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setEditing(false)}
                disabled={saving}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showConvertModal && (
        <ConvertModal
          leadId={params.id}
          onClose={() => setShowConvertModal(false)}
        />
      )}
    </div>
  );
}

