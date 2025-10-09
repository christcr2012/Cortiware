'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewOrganizationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    company: '',
    primaryName: '',
    primaryEmail: '',
    primaryPhone: '',
    notes: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/v2/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': `org-${Date.now()}-${Math.random()}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create organization: ${response.statusText}`);
      }
      
      const organization = await response.json();
      router.push(`/organizations/${organization.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/organizations" className="text-blue-600 hover:text-blue-800">
          ← Back to Organizations
        </Link>
        <h1 className="text-3xl font-bold mt-2">New Organization</h1>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-4 text-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700">
            Company Name
          </label>
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
          <label htmlFor="primaryName" className="block text-sm font-medium text-gray-700">
            Primary Contact Name
          </label>
          <input
            type="text"
            id="primaryName"
            name="primaryName"
            value={formData.primaryName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="primaryEmail" className="block text-sm font-medium text-gray-700">
            Primary Email
          </label>
          <input
            type="email"
            id="primaryEmail"
            name="primaryEmail"
            value={formData.primaryEmail}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="primaryPhone" className="block text-sm font-medium text-gray-700">
            Primary Phone
          </label>
          <input
            type="tel"
            id="primaryPhone"
            name="primaryPhone"
            value={formData.primaryPhone}
            onChange={handleChange}
            placeholder="+1234567890"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
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
            type="submit"
            disabled={loading}
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Organization'}
          </button>
          <Link
            href="/organizations"
            className="flex-1 text-center rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

