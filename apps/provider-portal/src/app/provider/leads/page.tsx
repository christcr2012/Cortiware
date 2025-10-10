import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getLeadSummary, listLeads } from '@/services/provider/leads.service';
import LeadsManagementClient from './LeadsManagementClient';

export default async function ProviderLeadsPage(props: any) {
  const cookieStore = await cookies();
  if (!cookieStore.get('rs_provider') && !cookieStore.get('provider-session') && !cookieStore.get('ws_provider')) {
    redirect('/provider/login');
  }

  // Handle build-time gracefully (no DATABASE_URL available)
  let summary = { total: 0, qualified: 0, converted: 0, conversionRate: 0 };
  let page = { items: [], nextCursor: null };

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

