import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import AppShellClient from './AppShellClient';

/**
 * Layout for authenticated CLIENT TENANT USERS
 * Enforces mv_user cookie (database-based auth with RBAC)
 * Separate from Provider/Developer/Accountant systems
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  
  // Require client user authentication (accept legacy mv_user during transition)
  const hasTenant = cookieStore.get('rs_user') || cookieStore.get('mv_user');
  if (!hasTenant) {
    redirect('/login');
  }
  
  return <AppShellClient>{children}</AppShellClient>;
}

