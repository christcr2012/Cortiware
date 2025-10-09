import { NextRequest, NextResponse } from 'next/server';
import { compose, withProviderAuth } from '@/lib/api/middleware';
import { bulkValidateClients } from '@/services/provider/sam-gov.service';

const postHandler = async (req: NextRequest) => {
  try {
    const result = await bulkValidateClients();
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Bulk validation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to validate clients' },
      { status: 500 }
    );
  }
};

export const POST = compose(withProviderAuth())(postHandler);

