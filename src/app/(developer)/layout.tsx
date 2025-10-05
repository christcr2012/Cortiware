import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import DeveloperShellClient from './DeveloperShellClient';

/**
 * Layout for DEVELOPER USERS ONLY
 * 
 * CRITICAL SEPARATION:
 * - Checks developer-session cookie (NOT mv_user)
 * - Environment-based authentication (NOT database)
 * - Completely separate from client and provider systems
 */
export default async function DeveloperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  
  // Require developer authentication
  if (!cookieStore.get('developer-session')) {
    redirect('/developer/login');
  }
  
  return <DeveloperShellClient>{children}</DeveloperShellClient>;
}

