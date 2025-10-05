import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

export const SPACE_GUARDS = {
  OWNER_ONLY: 'OWNER_ONLY',
  ANY: 'ANY',
} as const;

type Guard = typeof SPACE_GUARDS[keyof typeof SPACE_GUARDS];

export function withSpaceGuard(_guard: Guard) {
  return (handler: NextApiHandler): NextApiHandler => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      // Placeholder: allow all during migration. Add real checks later.
      return handler(req, res);
    };
  };
}

