import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getLeadSummary, listLeads } from '@/services/provider/leads.service';
import LeadsManagementClient from './LeadsManagementClient';

export default async function ProviderLeadsPage(props: any) {
  const cookieStore = await cookies();
  if (!cookieStore.get('rs_provider') && !cookieStore.get('provider-session') && !cookieStore.get('ws_provider')) {
    redirect('/provider/login');
  }

  const summary = await getLeadSummary();
  const sp = typeof props?.searchParams?.then === 'function' ? await props.searchParams : props?.searchParams;
  const page = await listLeads({ limit: 20, cursor: sp?.cursor });

  return (
    <LeadsManagementClient
      initialLeads={page.items}
      initialSummary={summary}
      nextCursor={page.nextCursor}
    />
  );
}

