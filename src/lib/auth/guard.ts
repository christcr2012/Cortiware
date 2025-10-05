import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

export function ensureAuth(_req: NextApiRequest): { email: string } | null {
  return { email: 'placeholder@rs.local' };
}

export function withAuthGuard(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const user = ensureAuth(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    (req as any).user = user;
    return handler(req, res);
  };
}

