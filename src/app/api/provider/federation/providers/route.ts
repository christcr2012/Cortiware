import { NextRequest } from 'next/server';
import { jsonOk, jsonError } from '@/lib/api/response';
import { compose, withProviderAuth } from '@/lib/api/middleware';

// Mock provider integrations
const providers: Array<{ id: string; name: string; url: string; status: string; createdAt: string }> = [];

const getHandler = async (req: NextRequest) => {
  try {
    return jsonOk({ providers });
  } catch (error) {
    console.error('Error listing providers:', error);
    return jsonError(500, 'internal_error', 'Failed to list providers');
  }
};

const postHandler = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { name, url } = body;

    if (!name || !url) {
      return jsonError(400, 'invalid_request', 'Name and URL are required');
    }

    const provider = {
      id: crypto.randomUUID(),
      name,
      url,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    providers.push(provider);

    return jsonOk({ provider });
  } catch (error) {
    console.error('Error creating provider:', error);
    return jsonError(500, 'internal_error', 'Failed to create provider');
  }
};

export const GET = compose(withProviderAuth())(getHandler);
export const POST = compose(withProviderAuth())(postHandler);

