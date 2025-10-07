import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import ProviderShellClient from '../ProviderShellClient';

/**
 * Layout for PROVIDER ROUTES ONLY
 * 
 * Checks authentication and wraps with ProviderShellClient
 */
export default async function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  
  // Require provider authentication
  const hasProviderSession = cookieStore.get('rs_provider') || cookieStore.get('provider-session') || cookieStore.get('ws_provider');

  if (!hasProviderSession) {
    // Redirect to login page
    redirect('/login');
  }
  
  return <ProviderShellClient>{children}</ProviderShellClient>;
}

