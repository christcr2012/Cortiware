import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import AppShellClient from '../(app)/AppShellClient';

/**
 * Layout for DEVELOPER USERS
 * Uses client-side shell with brand configuration (NOT provider green theme)
 * Environment-based authentication
 */
export default async function DeveloperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  // Require developer authentication
  if (!cookieStore.get('rs_developer') && !cookieStore.get('developer-session') && !cookieStore.get('ws_developer')) {
    redirect('/developer/login');
  }

  return <AppShellClient>{children}</AppShellClient>;
}

