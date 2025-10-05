import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

export const AUDIENCE = {
  CLIENT_ONLY: 'CLIENT_ONLY',
  PROVIDER_ONLY: 'PROVIDER_ONLY',
} as const;

export const COST_GUARD = {
  AI_LEAD_SCORING: 'AI_LEAD_SCORING',
} as const;

export function withAudienceAndCostGuard(_audience: string, _guard: string, handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Placeholder: in migration, simply call the handler.
    return handler(req, res);
  };
}

