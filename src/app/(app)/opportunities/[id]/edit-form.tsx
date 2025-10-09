'use client';

import { useState } from 'react';

type OpportunityEditFormProps = {
  opportunity: any;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
};

export default function OpportunityEditForm({ opportunity, onSave, onCancel }: OpportunityEditFormProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    estValue: opportunity.estValue ? (opportunity.estValue / 100).toString() : '0',
    valueType: opportunity.valueType || 'ONE_TIME',
    stage: opportunity.stage || 'PROSPECT',
    notes: opportunity.notes || '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      await onSave({
        ...formData,
        estValue: parseFloat(formData.estValue) * 100, // Convert to cents
      });
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  return (
    <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Opportunity</h2>
      
      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-4 text-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
            rows={4}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

