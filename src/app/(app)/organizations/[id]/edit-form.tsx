'use client';

import { useState } from 'react';

type OrganizationEditFormProps = {
  organization: any;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
};

export default function OrganizationEditForm({ organization, onSave, onCancel }: OrganizationEditFormProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    company: organization.company || '',
    primaryName: organization.primaryName || '',
    primaryEmail: organization.primaryEmail || '',
    primaryPhone: organization.primaryPhone || '',
    notes: organization.notes || '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      await onSave(formData);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  return (
    <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Organization</h2>
      
      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-4 text-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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

