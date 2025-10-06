import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import ProviderShellClient from './ProviderShellClient';

/**
 * Layout for PROVIDER USERS ONLY
 * 
 * CRITICAL SEPARATION:
 * - Checks provider-session or ws_provider cookies (NOT mv_user)
 * - Environment-based authentication (NOT database)
 * - Completely separate from client tenant system
 * - No RBAC - providers have full cross-client access
 */
export default async function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  
  // Require provider authentication (environment-based, NOT database)
  const hasProviderSession = cookieStore.get('rs_provider') || cookieStore.get('provider-session') || cookieStore.get('ws_provider');

  if (!hasProviderSession) {
    // Redirect to provider login (separate from client login)
    redirect('/provider/login');
  }
  
  return <ProviderShellClient>{children}</ProviderShellClient>;
}

