import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

export type AccountantUser = {
  email: string;
  complianceLevel: 'basic' | 'enhanced';
  lastLogin: Date;
};

export function requireAccountantAuth(
  handler: (req: NextApiRequest, res: NextApiResponse, user: AccountantUser) => any
): NextApiHandler {
  return async (req, res) => {
    const cookie = req.headers.cookie || '';
    const hasSession = cookie.includes('rs_accountant=') || cookie.includes('accountant-session=') || cookie.includes('ws_accountant=');
    if (!hasSession) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const emailMatch = cookie.match(/(?:rs_accountant|accountant-session|ws_accountant)=([^;]+)/);
    const email = decodeURIComponent(emailMatch?.[1] || 'accountant@example.com');
    const user: AccountantUser = {
      email,
      complianceLevel: 'basic',
      lastLogin: new Date(),
    };

    return handler(req, res, user);
  };
}

export async function logAccountantAudit(user: AccountantUser, action: string, details?: Record<string, any>) {
  // Placeholder audit logger; replace with real audit sink (db/prisma) during migration.
  try {
    // eslint-disable-next-line no-console
    console.log('[accountant:audit]', { email: user.email, action, details });
  } catch {}
}

