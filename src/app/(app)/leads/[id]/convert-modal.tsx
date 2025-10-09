'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type ConvertModalProps = {
  leadId: string;
  onClose: () => void;
};

export default function ConvertModal({ leadId, onClose }: ConvertModalProps) {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customerId: '',
    estValue: '0',
    valueType: 'ONE_TIME',
    stage: 'QUALIFIED',
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
      setLoading(false);
    }
  }

  async function handleConvert(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      setConverting(true);
      setError(null);

      // Create opportunity
      const oppResponse = await fetch('/api/v2/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': `convert-lead-${leadId}-${Date.now()}`,
        },
        body: JSON.stringify({
          customerId: formData.customerId,
          estValue: parseFloat(formData.estValue) * 100, // Convert to cents
          valueType: formData.valueType,
          stage: formData.stage,
          notes: formData.notes,
          sourceLeadId: leadId,
        }),
      });

      if (!oppResponse.ok) {
        const errorData = await oppResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create opportunity');
      }

      const opportunity = await oppResponse.json();

      // Update lead status to CONVERTED
      const leadResponse = await fetch(`/api/v2/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': `convert-lead-status-${leadId}-${Date.now()}`,
        },
        body: JSON.stringify({
          status: 'CONVERTED',
        }),
      });

      if (!leadResponse.ok) {
        console.error('Failed to update lead status, but opportunity was created');
      }

      // Redirect to the new opportunity
      router.push(`/opportunities/${opportunity.id}`);
    } catch (err: any) {
      setError(err.message);
      setConverting(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Convert Lead to Opportunity</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={converting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-4 text-red-800">
              <strong>Error:</strong> {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading customers...</p>
            </div>
          ) : (
            <form onSubmit={handleConvert} className="space-y-4">
              <div>
                <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
                  Customer <span className="text-red-500">*</span>
                </label>
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
                      {customer.company || customer.primaryName || 'Unnamed Customer'}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Select the customer this opportunity is for
                </p>
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

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Add any notes about this opportunity..."
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={converting || !formData.customerId}
                  className="flex-1 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {converting ? 'Converting...' : 'Convert to Opportunity'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={converting}
                  className="flex-1 rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

