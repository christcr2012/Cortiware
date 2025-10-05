import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

export function withIdempotency(_opts: Record<string, any>, handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Placeholder: no-op idempotency wrapper for migration
    return handler(req, res);
  };
}

