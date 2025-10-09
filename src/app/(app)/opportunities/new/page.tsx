'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Customer = {
  id: string;
  company?: string;
  primaryName?: string;
};

export default function NewOpportunityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [formData, setFormData] = useState({
    customerId: '',
    estValue: '',
    valueType: 'ONE_TIME',
    stage: 'PROSPECT',
    notes: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      const response = await fetch('/api/v2/organizations?limit=100');
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      setCustomers(data.items || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingCustomers(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/v2/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': `opp-${Date.now()}-${Math.random()}`,
        },
        body: JSON.stringify({
          ...formData,
          estValue: formData.estValue ? parseFloat(formData.estValue) * 100 : 0, // Convert to cents
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create opportunity: ${response.statusText}`);
      }
      
      const opportunity = await response.json();
      router.push(`/opportunities/${opportunity.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/opportunities" className="text-blue-600 hover:text-blue-800">
          ← Back to Opportunities
        </Link>
        <h1 className="text-3xl font-bold mt-2">New Opportunity</h1>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-4 text-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
            Customer <span className="text-red-500">*</span>
          </label>
          {loadingCustomers ? (
            <div className="mt-1 text-gray-500">Loading customers...</div>
          ) : (
            <select
              id="customerId"
              name="customerId"
              value={formData.customerId}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">Select a customer...</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.company || customer.primaryName || customer.id}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label htmlFor="estValue" className="block text-sm font-medium text-gray-700">
            Estimated Value ($)
          </label>
          <input
            type="number"
            id="estValue"
            name="estValue"
            value={formData.estValue}
            onChange={handleChange}
            step="0.01"
            min="0"
            placeholder="0.00"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="valueType" className="block text-sm font-medium text-gray-700">
            Value Type
          </label>
          <select
            id="valueType"
            name="valueType"
            value={formData.valueType}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="ONE_TIME">One-Time</option>
            <option value="RECURRING">Recurring</option>
            <option value="RELATIONSHIP">Relationship</option>
          </select>
        </div>

        <div>
          <label htmlFor="stage" className="block text-sm font-medium text-gray-700">
            Stage
          </label>
          <select
            id="stage"
            name="stage"
            value={formData.stage}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="PROSPECT">Prospect</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="PROPOSAL">Proposal</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || loadingCustomers}
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Opportunity'}
          </button>
          <Link
            href="/opportunities"
            className="flex-1 text-center rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

