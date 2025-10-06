import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

export interface DeveloperUser {
  email: string;
}

function getDevFromReq(req: NextApiRequest): DeveloperUser | null {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(/rs_developer=([^;]+)/) || cookie.match(/ws_developer=([^;]+)/) || cookie.match(/developer-session=([^;]+)/);
  const email = match ? decodeURIComponent(match[1]) : '';
  if (email) return { email };
  const header = (req.headers['x-rs-developer'] || req.headers['x-developer']) as string | undefined;
  if (header) return { email: header };
  return null;
}

export function requireDeveloperAuth(handler: (req: NextApiRequest, res: NextApiResponse, user: DeveloperUser) => any): NextApiHandler {
  return async (req, res) => {
    const user = getDevFromReq(req);
    if (!user) return res.status(401).json({ ok: false, error: 'Unauthorized' });
    return handler(req, res, user);
  };
}

export async function authenticateDeveloper(req: NextApiRequest): Promise<DeveloperUser | null> {
  return getDevFromReq(req);
}

