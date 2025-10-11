import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getLeadSummary, listLeads, type LeadSummary, type LeadStatus } from '@/services/provider/leads.service';
import LeadsManagementClient from './LeadsManagementClient';

type LeadListItem = {
  id: string;
  createdAt: Date;
  status: LeadStatus;
  company: string;
  contactName: string;
  email: string;
  orgId: string;
  orgName: string;
  sourceType: string;
  convertedAt?: Date;
};

export default async function ProviderLeadsPage(props: any) {
  const cookieStore = await cookies();
  if (!cookieStore.get('rs_provider') && !cookieStore.get('provider-session') && !cookieStore.get('ws_provider')) {
    redirect('/provider/login');
  }

  // Handle build-time gracefully (no DATABASE_URL available)
  let summary: LeadSummary = {
    total: 0,
    converted: 0,
    newToday: 0,
    byStatus: { NEW: 0, CONTACTED: 0, QUALIFIED: 0, CONVERTED: 0, DISQUALIFIED: 0 }
  };
  let page: { items: LeadListItem[]; nextCursor: string | null } = { items: [], nextCursor: null };

  try {
    summary = await getLeadSummary();
    const sp = typeof props?.searchParams?.then === 'function' ? await props.searchParams : props?.searchParams;
    page = await listLeads({ limit: 20, cursor: sp?.cursor });
  } catch (error) {
    console.log('Leads page: Database not available during build, using empty data');
  }

  return (
    <LeadsManagementClient
      initialLeads={page.items}
      initialSummary={summary}
      nextCursor={page.nextCursor}
    />
  );
}

