import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import DeveloperShellClient from './DeveloperShellClient';

/**
 * Layout for PROVIDER DEVELOPER USERS
 * Part of provider-side system with green theme
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

  return <DeveloperShellClient>{children}</DeveloperShellClient>;
}

