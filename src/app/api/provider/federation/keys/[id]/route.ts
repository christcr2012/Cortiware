import { NextRequest } from 'next/server';
import { jsonOk, jsonError } from '@/lib/api/response';
import { compose, withProviderAuth } from '@/lib/api/middleware';

const deleteHandler = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    // Mock implementation - would delete from database in production
    return jsonOk({ success: true });
  } catch (error) {
    console.error('Error deleting federation key:', error);
    return jsonError(500, 'internal_error', 'Failed to delete key');
  }
};

export const DELETE = compose(withProviderAuth())(deleteHandler);

