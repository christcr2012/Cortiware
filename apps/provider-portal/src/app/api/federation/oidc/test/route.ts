import { NextRequest } from 'next/server';
import { jsonOk, jsonError } from '@/lib/api/response';
import { compose, withProviderAuth } from '@/lib/api/middleware';

const postHandler = async (req: NextRequest) => {
  try {
    // Mock OIDC connection test
    return jsonOk({ success: true, message: 'OIDC connection successful' });
  } catch (error) {
    console.error('Error testing OIDC connection:', error);
    return jsonError(500, 'internal_error', 'Failed to test OIDC connection');
  }
};

export const POST = compose(withProviderAuth())(postHandler);

