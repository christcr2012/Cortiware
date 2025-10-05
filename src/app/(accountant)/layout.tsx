import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import AccountantShellClient from './AccountantShellClient';

/**
 * Layout for ACCOUNTANT USERS ONLY
 * Environment-based authentication, separate from all other systems
 */
export default async function AccountantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  
  if (!cookieStore.get('accountant-session')) {
    redirect('/accountant/login');
  }
  
  return <AccountantShellClient>{children}</AccountantShellClient>;
}

