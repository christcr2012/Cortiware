import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import AppShellClient from '../(app)/AppShellClient';

/**
 * Layout for ACCOUNTANT USERS
 * Uses client-side shell with brand configuration (NOT provider green theme)
 * Environment-based authentication
 */
export default async function AccountantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  if (!cookieStore.get('rs_accountant') && !cookieStore.get('accountant-session') && !cookieStore.get('ws_accountant')) {
    redirect('/accountant/login');
  }

  return <AppShellClient>{children}</AppShellClient>;
}

