import { NextRequest } from 'next/server';
import { jsonOk, jsonError } from '@/lib/api/response';
import { compose, withProviderAuth } from '@/lib/api/middleware';
import crypto from 'crypto';

// Mock storage - in production would use database
const keys: Array<{ id: string; name: string; key: string; createdAt: string; lastUsed: string | null }> = [];

const getHandler = async (req: NextRequest) => {
  try {
    return jsonOk({ keys });
  } catch (error) {
    console.error('Error listing federation keys:', error);
    return jsonError(500, 'internal_error', 'Failed to list keys');
  }
};

const postHandler = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return jsonError(400, 'invalid_request', 'Name is required');
    }

    const key = {
      id: crypto.randomUUID(),
      name,
      key: `fed_${crypto.randomBytes(32).toString('hex')}`,
      createdAt: new Date().toISOString(),
      lastUsed: null
    };

    keys.push(key);

    return jsonOk({ key });
  } catch (error) {
    console.error('Error creating federation key:', error);
    return jsonError(500, 'internal_error', 'Failed to create key');
  }
};

export const GET = compose(withProviderAuth())(getHandler);
export const POST = compose(withProviderAuth())(postHandler);

