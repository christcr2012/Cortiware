import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

export const rateLimitPresets = {
  api: { windowMs: 60_000, max: 60 },
  auth: { windowMs: 60_000, max: 20 },
} as const;

export function withRateLimit(_preset: typeof rateLimitPresets[keyof typeof rateLimitPresets], handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Placeholder: no actual rate limiting during migration
    return handler(req, res);
  };
}

