import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

export function withAudience(_audience: 'client' | 'provider' | 'developer' | 'accountant', handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => handler(req, res);
}

