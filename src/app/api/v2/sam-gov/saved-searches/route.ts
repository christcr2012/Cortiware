import { NextRequest, NextResponse } from 'next/server';
import { getOrgIdFromReq } from '@/lib/rbac';
import { getSavedSearches, saveSamGovSearch, deleteSavedSearch } from '@/services/sam-gov.service';

export async function GET(req: NextRequest) {
  try {
    const orgId = await getOrgIdFromReq(req as any);
    if (!orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searches = await getSavedSearches(orgId);
    
    return NextResponse.json({ searches });
  } catch (error: any) {
    console.error('Get saved searches error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get saved searches' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgIdFromReq(req as any);
    if (!orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, searchParams, alertEnabled, alertFrequency } = body;

    if (!name || !searchParams) {
      return NextResponse.json(
        { error: 'Name and search parameters are required' },
        { status: 400 }
      );
    }

    const savedSearch = await saveSamGovSearch(
      orgId,
      name,
      searchParams,
      alertEnabled,
      alertFrequency
    );

    return NextResponse.json({ savedSearch });
  } catch (error: any) {
    console.error('Save search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save search' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const orgId = await getOrgIdFromReq(req as any);
    if (!orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const searchId = searchParams.get('id');

    if (!searchId) {
      return NextResponse.json(
        { error: 'Search ID is required' },
        { status: 400 }
      );
    }

    await deleteSavedSearch(orgId, searchId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete search' },
      { status: 500 }
    );
  }
}

