'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    company: '',
    contactName: '',
    email: '',
    phoneE164: '',
    website: '',
    sourceType: 'WEBSITE',
    sourceDetail: '',
    notes: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/v2/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': `lead-${Date.now()}-${Math.random()}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create lead: ${response.statusText}`);
      }
      
      const lead = await response.json();
      router.push(`/leads/${lead.id}`);
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
    <div className="container-responsive spacing-responsive-md max-w-3xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <Link
          href="/leads"
          className="inline-flex items-center gap-2 touch-target text-responsive-sm transition-colors mb-3"
          style={{ color: 'var(--brand-primary)' }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Leads
        </Link>
        <h1 className="text-responsive-2xl font-bold" style={{ color: 'var(--text-primary)' }}>New Lead</h1>
      </div>

      {error && (
        <div className="mb-4 sm:mb-6 premium-card spacing-responsive-sm" style={{ background: 'var(--surface-1)', border: '1px solid var(--accent-error)', color: 'var(--accent-error)' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="premium-card spacing-responsive-md">
        <div className="grid-responsive cols-sm-2 gap-4 sm:gap-6">
          <div>
            <label htmlFor="company" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Company
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="input-field touch-target"
            />
          </div>

          <div>
            <label htmlFor="contactName" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Contact Name
            </label>
            <input
              type="text"
              id="contactName"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              className="input-field touch-target"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field touch-target"
            />
          </div>

          <div>
            <label htmlFor="phoneE164" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Phone
            </label>
            <input
              type="tel"
              id="phoneE164"
              name="phoneE164"
              value={formData.phoneE164}
              onChange={handleChange}
              placeholder="+1234567890"
              className="input-field touch-target"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
              className="input-field touch-target"
            />
          </div>

          <div>
            <label htmlFor="sourceType" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Source Type
            </label>
            <select
              id="sourceType"
              name="sourceType"
              value={formData.sourceType}
              onChange={handleChange}
              className="input-field touch-target"
            >
              <option value="WEBSITE">Website</option>
              <option value="REFERRAL">Referral</option>
              <option value="COLD_CALL">Cold Call</option>
              <option value="TRADE_SHOW">Trade Show</option>
              <option value="SOCIAL_MEDIA">Social Media</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="sourceDetail" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Source Detail
            </label>
            <input
              type="text"
              id="sourceDetail"
              name="sourceDetail"
              value={formData.sourceDetail}
              onChange={handleChange}
              placeholder="e.g., Google Ads, LinkedIn, etc."
              className="input-field touch-target"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="notes" className="block text-responsive-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="input-field touch-target"
              style={{ minHeight: '100px' }}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 sm:pt-8" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary touch-target-comfortable flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Lead'}
          </button>
          <Link
            href="/leads"
            className="btn-secondary touch-target-comfortable flex-1 justify-center text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

