import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

/**
 * Root page - routes based on authentication type
 * 
 * CRITICAL: Maintains separation between:
 * - Provider users (environment-based auth, NOT database)
 * - Developer users (environment-based auth)
 * - Accountant users (environment-based auth)
 * - Client users (database-based auth with RBAC)
 */
export default async function HomePage() {
  const cookieStore = await cookies();
  
  // Provider system (separate from client database)
  const hasProvider = cookieStore.get('rs_provider') || cookieStore.get('provider-session') || cookieStore.get('ws_provider');
  if (hasProvider) {
    redirect('/provider');
  }

  // Developer system (separate from client database)
  const hasDeveloper = cookieStore.get('rs_developer') || cookieStore.get('developer-session') || cookieStore.get('ws_developer');
  if (hasDeveloper) {
    redirect('/developer');
  }

  // Accountant system (separate from client database)
  const hasAccountant = cookieStore.get('rs_accountant') || cookieStore.get('accountant-session') || cookieStore.get('ws_accountant');
  if (hasAccountant) {
    redirect('/accountant');
  }

  // Client tenant user (database User table with RBAC)
  const hasTenant = cookieStore.get('rs_user') || cookieStore.get('mv_user');
  if (hasTenant) {
    redirect('/dashboard');
  }
  
  // No authentication - go to login
  redirect('/login');
}

