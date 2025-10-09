import { getAllClientSamStatus, getNaicsAnalytics, bulkValidateClients } from '@/services/provider/sam-gov.service';
import SamGovClient from './SamGovClient';

export const metadata = {
  title: 'SAM.gov Integration | Provider Portal',
  description: 'Monitor client SAM.gov registrations and compliance',
};

export default async function SamGovPage() {
  let statuses = [];
  let naicsAnalytics = [];
  let bulkValidation = null;
  let error = null;

  try {
    // Fetch all data in parallel
    [statuses, naicsAnalytics, bulkValidation] = await Promise.all([
      getAllClientSamStatus(),
      getNaicsAnalytics(),
      bulkValidateClients(),
    ]);
  } catch (err: any) {
    error = err.message || 'Failed to load SAM.gov data';
    console.error('SAM.gov page error:', err);
  }

  return (
    <div className="container-responsive">
      <div className="mb-6">
        <h1 className="text-responsive-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          SAM.gov Integration Dashboard
        </h1>
        <p className="text-responsive-base mt-2" style={{ color: 'var(--text-secondary)' }}>
          Monitor client SAM.gov registrations, NAICS codes, and exclusion list status
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444' }}>
          <p className="font-medium">Error loading SAM.gov data</p>
          <p className="text-sm mt-1">{error}</p>
          <p className="text-xs mt-2">Make sure SAM_API_KEY is configured in environment variables</p>
        </div>
      )}

      <SamGovClient
        initialStatuses={statuses}
        initialNaicsAnalytics={naicsAnalytics}
        initialBulkValidation={bulkValidation}
      />
    </div>
  );
}

