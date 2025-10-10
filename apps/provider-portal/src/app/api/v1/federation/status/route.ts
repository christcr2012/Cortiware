import { NextRequest } from 'next/server';
import { jsonOk } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return jsonOk({
    version: 'v1',
    now: new Date().toISOString(),
    limits: {
      perMin: 100,
      maxBodyBytes: 1000000,
    },
  });
}

