import { NextRequest, NextResponse } from 'next/server';

/**
 * Developer session extracted from request
 */
export interface DeveloperSession {
  email: string;
  developerId?: string;
}

/**
 * Extract developer session from request cookies
 */
export function getDeveloperSession(request: NextRequest): DeveloperSession | null {
  const cookies = request.cookies;
  
  // Check for developer session cookies
  const devCookie = cookies.get('rs_developer') || cookies.get('ws_developer') || cookies.get('developer-session');
  
  if (devCookie) {
    try {
      const email = decodeURIComponent(devCookie.value);
      // TODO: In production, decode JWT to get developerId
      return { 
        email,
        developerId: undefined 
      };
    } catch {
      return null;
    }
  }
  
  return null;
}

/**
 * Higher-order function to wrap API route handlers with developer authentication
 *
 * Usage:
 * ```typescript
 * export const GET = withDeveloperAuth(async (request, { session }) => {
 *   // session is guaranteed to exist here
 *   return NextResponse.json({ email: session.email });
 * });
 * ```
 */
export function withDeveloperAuth(
  handler: (
    request: NextRequest,
    context: { params?: any; session: DeveloperSession }
  ) => Promise<NextResponse> | NextResponse
) {
  return async (
    request: NextRequest,
    context?: { params?: any }
  ): Promise<NextResponse> => {
    // Extract session
    const session = getDeveloperSession(request);

    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Developer authentication required' },
        { status: 401 }
      );
    }

    // Call handler with session
    return handler(request, { params: context?.params, session });
  };
}

