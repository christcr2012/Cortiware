import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

/**
 * Root page - redirects based on authentication status
 */
export default async function RootPage() {
  const cookieStore = await cookies();
  
  // Check for provider or developer session
  const hasSession = cookieStore.get('rs_provider') || 
                     cookieStore.get('rs_developer') || 
                     cookieStore.get('provider-session') || 
                     cookieStore.get('ws_provider');

  if (hasSession) {
    // Redirect to provider dashboard
    redirect('/provider');
  } else {
    // Redirect to login
    redirect('/login');
  }
}

