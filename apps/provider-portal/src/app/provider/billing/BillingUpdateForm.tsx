'use client';

import { useState } from 'react';

export default function BillingUpdateForm() {
  const [formData, setFormData] = useState({
    companyName: '',
    billingEmail: '',
    taxId: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    paymentMethod: 'stripe',
  });
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/provider/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('Billing information updated successfully');
        setShowForm(false);
      } else {
        const data = await res.json();
        alert(`Error: ${data.message || 'Failed to update billing information'}`);
      }
    } catch (error) {
      console.error('Error updating billing info:', error);
      alert('Failed to update billing information');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!showForm) {
    return (
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary touch-target-comfortable"
        >
          Update Billing Information
        </button>
      </div>
    );
  }

  return (
    <div className="premium-card spacing-responsive-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-responsive-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Update Billing Information
        </h2>
        <button
          onClick={() => setShowForm(false)}
          className="text-responsive-sm"
          style={{ color: 'var(--text-secondary)' }}
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="companyName" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Company Name *
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              className="input-field touch-target w-full"
            />
          </div>

          <div>
            <label htmlFor="billingEmail" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Billing Email *
            </label>
            <input
              type="email"
              id="billingEmail"
              name="billingEmail"
              value={formData.billingEmail}
              onChange={handleChange}
              required
              className="input-field touch-target w-full"
            />
          </div>

          <div>
            <label htmlFor="taxId" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Tax ID / VAT Number
            </label>
            <input
              type="text"
              id="taxId"
              name="taxId"
              value={formData.taxId}
              onChange={handleChange}
              className="input-field touch-target w-full"
            />
          </div>

          <div>
            <label htmlFor="paymentMethod" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Payment Method
            </label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="input-field touch-target w-full"
            >
              <option value="stripe">Stripe</option>
              <option value="invoice">Invoice</option>
              <option value="ach">ACH Transfer</option>
              <option value="wire">Wire Transfer</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="address" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="input-field touch-target w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="input-field touch-target w-full"
            />
          </div>

          <div>
            <label htmlFor="state" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              State / Province
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="input-field touch-target w-full"
            />
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Postal Code
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              className="input-field touch-target w-full"
            />
          </div>
        </div>

        <div>
          <label htmlFor="country" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            Country
          </label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="input-field touch-target w-full"
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="GB">United Kingdom</option>
            <option value="AU">Australia</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
            <option value="JP">Japan</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary touch-target-comfortable"
          >
            {saving ? 'Saving...' : 'Save Billing Information'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-4 py-2 rounded font-medium touch-target-comfortable"
            style={{ background: 'var(--surface-3)', color: 'var(--text-primary)' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

