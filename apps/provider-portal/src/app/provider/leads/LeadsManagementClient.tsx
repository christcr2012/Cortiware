'use client';

/**
 * Enhanced Leads Management Client Component
 * 
 * CRITICAL BUSINESS FUNCTIONALITY:
 * - Lead dispute management (clients contest billed leads)
 * - Lead reclassification (employee referral, duplicate, etc.)
 * - Lead attribution editing (adjust billing when contested)
 * - Bulk operations (approve/reject disputes, reclassify multiple)
 * - Lead quality scoring (track quality issues)
 * 
 * This addresses the critical gap where clients dispute leads and
 * the provider has no way to manage those disputes.
 */

import { useState } from 'react';
import Link from 'next/link';

type Lead = {
  id: string;
  createdAt: Date;
  status: string;
  company: string;
  contactName: string;
  email: string;
  orgId: string;
  orgName: string;
  sourceType: string;
  convertedAt?: Date;
  // Management fields
  disputeStatus?: string | null;
  disputeReason?: string | null;
  disputeResolvedAt?: Date | null;
  classificationType?: string | null;
  classificationReason?: string | null;
  classifiedAt?: Date | null;
  qualityScore?: number | null;
  qualityNotes?: string | null;
  qualityScoredAt?: Date | null;
};

type LeadSummary = {
  total: number;
  converted: number;
  newToday: number;
  byStatus: Record<string, number>;
};

type DisputeStatus = 'pending' | 'approved' | 'rejected';
type ReclassificationType = 'employee_referral' | 'duplicate' | 'invalid_contact' | 'out_of_service_area' | 'spam';

interface LeadsManagementClientProps {
  initialLeads: Lead[];
  initialSummary: LeadSummary;
  nextCursor: string | null;
}

export default function LeadsManagementClient({ initialLeads, initialSummary, nextCursor }: LeadsManagementClientProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [summary, setSummary] = useState(initialSummary);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showReclassifyModal, setShowReclassifyModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Toggle lead selection
  const toggleLeadSelection = (leadId: string) => {
    const newSelection = new Set(selectedLeads);
    if (newSelection.has(leadId)) {
      newSelection.delete(leadId);
    } else {
      newSelection.add(leadId);
    }
    setSelectedLeads(newSelection);
  };

  // Select all/none
  const toggleSelectAll = () => {
    if (selectedLeads.size === leads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(leads.map(l => l.id)));
    }
  };

  // Open dispute modal for single lead
  const openDisputeModal = (lead: Lead) => {
    setSelectedLead(lead);
    setShowDisputeModal(true);
  };

  // Open reclassify modal for single lead
  const openReclassifyModal = (lead: Lead) => {
    setSelectedLead(lead);
    setShowReclassifyModal(true);
  };

  // Open quality scoring modal
  const openQualityModal = (lead: Lead) => {
    setSelectedLead(lead);
    setShowQualityModal(true);
  };

  // Bulk dispute approval
  const handleBulkDisputeApproval = async () => {
    if (selectedLeads.size === 0) {
      alert('No leads selected');
      return;
    }
    
    if (!confirm(`Approve disputes for ${selectedLeads.size} leads? This will remove them from billing.`)) {
      return;
    }

    try {
      const response = await fetch('/api/provider/leads/bulk-dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadIds: Array.from(selectedLeads),
          action: 'approve',
        }),
      });

      if (response.ok) {
        alert('Disputes approved successfully');
        setSelectedLeads(new Set());
        // Refresh data
        window.location.reload();
      } else {
        alert('Failed to approve disputes');
      }
    } catch (error) {
      console.error('Error approving disputes:', error);
      alert('Error approving disputes');
    }
  };

  // Bulk reclassification
  const handleBulkReclassify = async (type: ReclassificationType) => {
    if (selectedLeads.size === 0) {
      alert('No leads selected');
      return;
    }

    if (!confirm(`Reclassify ${selectedLeads.size} leads as "${type.replace('_', ' ')}"?`)) {
      return;
    }

    try {
      const response = await fetch('/api/provider/leads/bulk-reclassify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadIds: Array.from(selectedLeads),
          classificationType: type,
        }),
      });

      if (response.ok) {
        alert('Leads reclassified successfully');
        setSelectedLeads(new Set());
        window.location.reload();
      } else {
        alert('Failed to reclassify leads');
      }
    } catch (error) {
      console.error('Error reclassifying leads:', error);
      alert('Error reclassifying leads');
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (filterStatus !== 'ALL' && lead.status !== filterStatus) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        lead.company.toLowerCase().includes(query) ||
        lead.contactName.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.orgName.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'var(--brand-gradient)' }}>
          Leads Management
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Cross-tenant lead operations, dispute resolution, and quality management
        </p>
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: summary.total },
          { label: 'Converted', value: summary.converted },
          { label: 'New Today', value: summary.newToday },
          { label: 'Conversion Rate', value: summary.total ? Math.round((summary.converted / summary.total) * 100) + '%' : '0%' },
        ].map((c) => (
          <div key={c.label} className="rounded-xl p-5" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--brand-primary)' }}>{c.value}</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Filters & Bulk Actions */}
      <div className="rounded-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 rounded-lg"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-lg"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
            >
              <option value="ALL">All Status</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="CONVERTED">Converted</option>
              <option value="DISQUALIFIED">Disqualified</option>
            </select>
          </div>

          {selectedLeads.size > 0 && (
            <div className="flex gap-2">
              <span className="px-3 py-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {selectedLeads.size} selected
              </span>
              <button
                onClick={handleBulkDisputeApproval}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'rgb(34, 197, 94)', border: '1px solid rgb(34, 197, 94)' }}
              >
                Approve Disputes
              </button>
              <button
                onClick={() => handleBulkReclassify('employee_referral')}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'rgb(59, 130, 246)', border: '1px solid rgb(59, 130, 246)' }}
              >
                Mark as Employee Referral
              </button>
              <button
                onClick={() => handleBulkReclassify('duplicate')}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'rgba(251, 191, 36, 0.1)', color: 'rgb(251, 191, 36)', border: '1px solid rgb(251, 191, 36)' }}
              >
                Mark as Duplicate
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Leads table */}
      <div className="rounded-xl" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr style={{ color: 'var(--text-secondary)' }}>
                <th className="text-left p-3">
                  <input
                    type="checkbox"
                    checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4"
                  />
                </th>
                <th className="text-left p-3">Company</th>
                <th className="text-left p-3">Contact</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Org</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Dispute</th>
                <th className="text-left p-3">Classification</th>
                <th className="text-left p-3">Quality</th>
                <th className="text-left p-3">Source</th>
                <th className="text-left p-3">Created</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((l) => (
                <tr key={l.id} className="border-t" style={{ borderColor: 'var(--border-primary)' }}>
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedLeads.has(l.id)}
                      onChange={() => toggleLeadSelection(l.id)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="p-3" style={{ color: 'var(--text-primary)' }}>{l.company}</td>
                  <td className="p-3" style={{ color: 'var(--text-primary)' }}>{l.contactName}</td>
                  <td className="p-3" style={{ color: 'var(--text-primary)' }}>{l.email}</td>
                  <td className="p-3" style={{ color: 'var(--text-primary)' }}>{l.orgName}</td>
                  <td className="p-3 font-mono" style={{ color: 'var(--brand-primary)' }}>{l.status}</td>
                  <td className="p-3">
                    {l.disputeStatus && l.disputeStatus !== 'NONE' ? (
                      <span
                        className="px-2 py-1 rounded text-xs font-mono"
                        style={{
                          background: l.disputeStatus === 'PENDING' ? 'rgba(251, 191, 36, 0.1)' :
                                     l.disputeStatus === 'APPROVED' ? 'rgba(34, 197, 94, 0.1)' :
                                     'rgba(239, 68, 68, 0.1)',
                          color: l.disputeStatus === 'PENDING' ? 'rgb(251, 191, 36)' :
                                 l.disputeStatus === 'APPROVED' ? 'rgb(34, 197, 94)' :
                                 'rgb(239, 68, 68)'
                        }}
                      >
                        {l.disputeStatus}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-tertiary)' }}>—</span>
                    )}
                  </td>
                  <td className="p-3">
                    {l.classificationType ? (
                      <span
                        className="px-2 py-1 rounded text-xs font-mono"
                        style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'rgb(59, 130, 246)' }}
                        title={l.classificationReason || undefined}
                      >
                        {l.classificationType.replace(/_/g, ' ')}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-tertiary)' }}>—</span>
                    )}
                  </td>
                  <td className="p-3">
                    {l.qualityScore ? (
                      <span
                        className="px-2 py-1 rounded text-xs font-mono font-bold"
                        style={{
                          background: l.qualityScore >= 8 ? 'rgba(34, 197, 94, 0.1)' :
                                     l.qualityScore >= 5 ? 'rgba(251, 191, 36, 0.1)' :
                                     'rgba(239, 68, 68, 0.1)',
                          color: l.qualityScore >= 8 ? 'rgb(34, 197, 94)' :
                                 l.qualityScore >= 5 ? 'rgb(251, 191, 36)' :
                                 'rgb(239, 68, 68)'
                        }}
                        title={l.qualityNotes || undefined}
                      >
                        {l.qualityScore}/10
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-tertiary)' }}>—</span>
                    )}
                  </td>
                  <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{l.sourceType}</td>
                  <td className="p-3" style={{ color: 'var(--text-secondary)' }}>{new Date(l.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openDisputeModal(l)}
                        className="px-2 py-1 rounded text-xs"
                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'rgb(239, 68, 68)' }}
                        title="Handle Dispute"
                      >
                        Dispute
                      </button>
                      <button
                        onClick={() => openReclassifyModal(l)}
                        className="px-2 py-1 rounded text-xs"
                        style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'rgb(59, 130, 246)' }}
                        title="Reclassify Lead"
                      >
                        Reclassify
                      </button>
                      <button
                        onClick={() => openQualityModal(l)}
                        className="px-2 py-1 rounded text-xs"
                        style={{ background: 'rgba(251, 191, 36, 0.1)', color: 'rgb(251, 191, 36)' }}
                        title="Quality Score"
                      >
                        Quality
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 flex justify-end">
          {nextCursor ? (
            <Link href={{ pathname: '/provider/leads', query: { cursor: nextCursor } }} className="px-4 py-2 rounded-lg font-mono" style={{ color: 'var(--brand-primary)', border: '1px solid var(--border-accent)' }}>
              Next →
            </Link>
          ) : (
            <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>End of results</span>
          )}
        </div>
      </div>

      {/* Dispute Modal */}
      {showDisputeModal && selectedLead && (
        <DisputeModal
          lead={selectedLead}
          onClose={() => {
            setShowDisputeModal(false);
            setSelectedLead(null);
          }}
        />
      )}

      {/* Reclassify Modal */}
      {showReclassifyModal && selectedLead && (
        <ReclassifyModal
          lead={selectedLead}
          onClose={() => {
            setShowReclassifyModal(false);
            setSelectedLead(null);
          }}
        />
      )}

      {/* Quality Scoring Modal */}
      {showQualityModal && selectedLead && (
        <QualityModal
          lead={selectedLead}
          onClose={() => {
            setShowQualityModal(false);
            setSelectedLead(null);
          }}
        />
      )}
    </div>
  );
}

// Dispute Modal Component
function DisputeModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const [disputeReason, setDisputeReason] = useState('');
  const [resolution, setResolution] = useState<'approve' | 'reject' | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!resolution) {
      alert('Please select a resolution');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/provider/leads/dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          resolution,
          disputeReason,
          notes,
        }),
      });

      if (response.ok) {
        alert(`Dispute ${resolution}d successfully`);
        onClose();
        window.location.reload();
      } else {
        alert('Failed to process dispute');
      }
    } catch (error) {
      console.error('Error processing dispute:', error);
      alert('Error processing dispute');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="rounded-xl p-6 max-w-2xl w-full" style={{ background: 'var(--bg-main)', border: '1px solid var(--border-accent)' }}>
        <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Handle Lead Dispute
        </h3>

        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Lead Details</div>
            <div className="p-3 rounded-lg" style={{ background: 'var(--surface-3)' }}>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span style={{ color: 'var(--text-secondary)' }}>Company:</span> <span style={{ color: 'var(--text-primary)' }}>{lead.company}</span></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Contact:</span> <span style={{ color: 'var(--text-primary)' }}>{lead.contactName}</span></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Organization:</span> <span style={{ color: 'var(--text-primary)' }}>{lead.orgName}</span></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Source:</span> <span style={{ color: 'var(--text-primary)' }}>{lead.sourceType}</span></div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Dispute Reason (from client)
            </label>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Enter the client's reason for disputing this lead..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Resolution
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setResolution('approve')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium ${resolution === 'approve' ? 'ring-2' : ''}`}
                style={{
                  background: resolution === 'approve' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.1)',
                  color: 'rgb(34, 197, 94)',
                  border: '1px solid rgb(34, 197, 94)',
                }}
              >
                Approve (Remove from Billing)
              </button>
              <button
                onClick={() => setResolution('reject')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium ${resolution === 'reject' ? 'ring-2' : ''}`}
                style={{
                  background: resolution === 'reject' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                  color: 'rgb(239, 68, 68)',
                  border: '1px solid rgb(239, 68, 68)',
                }}
              >
                Reject (Keep in Billing)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Internal Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about this dispute resolution..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg font-medium"
              style={{ background: 'var(--surface-3)', color: 'var(--text-primary)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !resolution}
              className="flex-1 px-4 py-2 rounded-lg font-medium"
              style={{
                background: resolution ? 'var(--brand-primary)' : 'var(--surface-3)',
                color: resolution ? 'white' : 'var(--text-secondary)',
                opacity: submitting ? 0.5 : 1,
              }}
            >
              {submitting ? 'Processing...' : 'Submit Resolution'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reclassify Modal Component
function ReclassifyModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const [classificationType, setClassificationType] = useState<ReclassificationType | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const classificationOptions: { type: ReclassificationType; label: string; description: string }[] = [
    { type: 'employee_referral', label: 'Employee Referral', description: 'Lead came from employee, not billable' },
    { type: 'duplicate', label: 'Duplicate', description: 'Duplicate of existing lead' },
    { type: 'invalid_contact', label: 'Invalid Contact', description: 'Contact info is invalid or fake' },
    { type: 'out_of_service_area', label: 'Out of Service Area', description: 'Outside client\'s service area' },
    { type: 'spam', label: 'Spam', description: 'Spam or bot-generated lead' },
  ];

  const handleSubmit = async () => {
    if (!classificationType) {
      alert('Please select a classification type');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/provider/leads/reclassify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          classificationType,
          reason,
        }),
      });

      if (response.ok) {
        alert('Lead reclassified successfully');
        onClose();
        window.location.reload();
      } else {
        alert('Failed to reclassify lead');
      }
    } catch (error) {
      console.error('Error reclassifying lead:', error);
      alert('Error reclassifying lead');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-main)', border: '1px solid var(--border-accent)' }}>
        <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Reclassify Lead
        </h3>

        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Lead Details</div>
            <div className="p-3 rounded-lg" style={{ background: 'var(--surface-3)' }}>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span style={{ color: 'var(--text-secondary)' }}>Company:</span> <span style={{ color: 'var(--text-primary)' }}>{lead.company}</span></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Contact:</span> <span style={{ color: 'var(--text-primary)' }}>{lead.contactName}</span></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Organization:</span> <span style={{ color: 'var(--text-primary)' }}>{lead.orgName}</span></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Source:</span> <span style={{ color: 'var(--text-primary)' }}>{lead.sourceType}</span></div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
              Classification Type
            </label>
            <div className="space-y-2">
              {classificationOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => setClassificationType(option.type)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${classificationType === option.type ? 'ring-2' : ''}`}
                  style={{
                    background: classificationType === option.type ? 'rgba(59, 130, 246, 0.1)' : 'var(--surface-3)',
                    border: `1px solid ${classificationType === option.type ? 'rgb(59, 130, 246)' : 'var(--border-primary)'}`,
                  }}
                >
                  <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{option.label}</div>
                  <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Reason / Notes
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Add notes about why this lead is being reclassified..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg font-medium"
              style={{ background: 'var(--surface-3)', color: 'var(--text-primary)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !classificationType}
              className="flex-1 px-4 py-2 rounded-lg font-medium"
              style={{
                background: classificationType ? 'var(--brand-primary)' : 'var(--surface-3)',
                color: classificationType ? 'white' : 'var(--text-secondary)',
                opacity: submitting ? 0.5 : 1,
              }}
            >
              {submitting ? 'Reclassifying...' : 'Reclassify Lead'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quality Scoring Modal Component
function QualityModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const [qualityScore, setQualityScore] = useState(5);
  const [qualityNotes, setQualityNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/provider/leads/quality-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          qualityScore,
          qualityNotes,
        }),
      });

      if (response.ok) {
        alert('Quality score saved successfully');
        onClose();
        window.location.reload();
      } else {
        alert('Failed to save quality score');
      }
    } catch (error) {
      console.error('Error saving quality score:', error);
      alert('Error saving quality score');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="rounded-xl p-6 max-w-2xl w-full" style={{ background: 'var(--bg-main)', border: '1px solid var(--border-accent)' }}>
        <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Lead Quality Scoring
        </h3>

        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Lead Details</div>
            <div className="p-3 rounded-lg" style={{ background: 'var(--surface-3)' }}>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span style={{ color: 'var(--text-secondary)' }}>Company:</span> <span style={{ color: 'var(--text-primary)' }}>{lead.company}</span></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Contact:</span> <span style={{ color: 'var(--text-primary)' }}>{lead.contactName}</span></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Organization:</span> <span style={{ color: 'var(--text-primary)' }}>{lead.orgName}</span></div>
                <div><span style={{ color: 'var(--text-secondary)' }}>Source:</span> <span style={{ color: 'var(--text-primary)' }}>{lead.sourceType}</span></div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
              Quality Score (1-10)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={qualityScore}
                onChange={(e) => setQualityScore(parseInt(e.target.value))}
                className="flex-1"
              />
              <div className="text-3xl font-bold w-16 text-center" style={{ color: 'var(--brand-primary)' }}>
                {qualityScore}
              </div>
            </div>
            <div className="flex justify-between text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
              <span>Poor Quality</span>
              <span>Excellent Quality</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Quality Notes
            </label>
            <textarea
              value={qualityNotes}
              onChange={(e) => setQualityNotes(e.target.value)}
              placeholder="Add notes about lead quality (contact info accuracy, fit for service area, etc.)..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg"
              style={{ background: 'var(--input-bg)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg font-medium"
              style={{ background: 'var(--surface-3)', color: 'var(--text-primary)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 px-4 py-2 rounded-lg font-medium"
              style={{
                background: 'var(--brand-primary)',
                color: 'white',
                opacity: submitting ? 0.5 : 1,
              }}
            >
              {submitting ? 'Saving...' : 'Save Quality Score'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

