import type { NextApiRequest } from 'next';

export async function handlePostLoginRedirect(
  user: { role?: string },
  _system: 'client' | 'provider' | 'developer' = 'client',
  _req?: NextApiRequest
): Promise<{ url: string; reason: string }>
{
  // Minimal logic: send based on role if known, else dashboard
  const role = (user.role || '').toUpperCase();
  if (role === 'OWNER' || role === 'MANAGER' || role === 'STAFF') {
    return { url: '/dashboard', reason: 'role-default' };
  }
  return { url: '/dashboard', reason: 'fallback' };
}

