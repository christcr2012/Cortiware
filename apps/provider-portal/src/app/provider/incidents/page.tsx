import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import IncidentsClient from './IncidentsClient';

export default async function ProviderIncidentsPage() {
  const jar = await cookies();
  if (!jar.get('rs_provider') && !jar.get('provider-session') && !jar.get('ws_provider')) {
    redirect('/provider/login');
  }

  return <IncidentsClient />;
}

