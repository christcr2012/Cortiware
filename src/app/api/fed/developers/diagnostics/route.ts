import { NextRequest } from 'next/server';
import { jsonOk } from '@/lib/api/response';
import { compose, withRateLimit, withDeveloperAuth } from '@/lib/api/middleware';

const guard = compose(withRateLimit('auth'), withDeveloperAuth());

export const GET = guard(async (_req: NextRequest) => {
  return jsonOk({
    service: 'federation',
    version: process.env.VERCEL_GIT_COMMIT_SHA || 'dev',
    time: new Date().toISOString(),
  });
});

