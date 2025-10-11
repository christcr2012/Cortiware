import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Provider Portal Middleware
 * 
 * Enforces authentication and role-based access control for:
 * - Provider routes (/provider/*)
 * - Developer routes (/developer/*)
 * - API routes (/api/*)
 */

// Provider roles
export type ProviderRole = 'provider_admin' | 'provider_analyst';

// Developer role
export type DeveloperRole = 'developer';

/**
 * Extract provider session from cookies
 */
function getProviderSession(request: NextRequest): { email: string; role?: ProviderRole } | null {
  const cookies = request.cookies;
  
  // Check for provider session cookies
  const providerCookie = cookies.get('rs_provider') || cookies.get('ws_provider') || cookies.get('provider-session');
  
  if (providerCookie) {
    try {
      const email = decodeURIComponent(providerCookie.value);
      // TODO: In production, decode JWT to get role
      // For now, assume provider_admin for any authenticated provider
      return { email, role: 'provider_admin' };
    } catch {
      return null;
    }
  }
  
  return null;
}

/**
 * Extract developer session from cookies
 */
function getDeveloperSession(request: NextRequest): { email: string } | null {
  const cookies = request.cookies;
  
  // Check for developer session cookies
  const devCookie = cookies.get('rs_developer') || cookies.get('ws_developer') || cookies.get('developer-session');
  
  if (devCookie) {
    try {
      const email = decodeURIComponent(devCookie.value);
      return { email };
    } catch {
      return null;
    }
  }
  
  return null;
}

/**
 * Check if provider has required role
 */
function hasProviderRole(session: { role?: ProviderRole } | null, requiredRole: ProviderRole): boolean {
  if (!session || !session.role) return false;
  
  // provider_admin has access to everything
  if (session.role === 'provider_admin') return true;
  
  // provider_analyst only has read access
  if (session.role === 'provider_analyst' && requiredRole === 'provider_analyst') return true;
  
  return false;
}

/**
 * Determine if route requires write access (admin only)
 */
function isWriteOperation(request: NextRequest): boolean {
  const method = request.method;
  return method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ============================================
  // PROVIDER ROUTES: /provider/*
  // ============================================
  if (pathname.startsWith('/provider')) {
    const session = getProviderSession(request);
    
    // Require authentication
    if (!session) {
      return NextResponse.redirect(new URL('/provider/login', request.url));
    }
    
    // Check write permissions for sensitive routes
    if (pathname.startsWith('/provider/federation') || 
        pathname.startsWith('/provider/monetization') ||
        pathname.startsWith('/provider/billing')) {
      
      // Write operations require provider_admin
      if (isWriteOperation(request) && !hasProviderRole(session, 'provider_admin')) {
        return NextResponse.json(
          { error: 'Forbidden: Admin role required for write operations' },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.next();
  }
  
  // ============================================
  // DEVELOPER ROUTES: /developer/*
  // ============================================
  if (pathname.startsWith('/developer')) {
    const session = getDeveloperSession(request);
    
    // Require authentication
    if (!session) {
      return NextResponse.redirect(new URL('/developer/login', request.url));
    }
    
    return NextResponse.next();
  }
  
  // ============================================
  // API ROUTES: /api/*
  // ============================================
  if (pathname.startsWith('/api')) {
    // Federation API routes
    if (pathname.startsWith('/api/federation')) {
      const session = getProviderSession(request);
      
      if (!session) {
        return NextResponse.json(
          { error: 'Unauthorized: Provider authentication required' },
          { status: 401 }
        );
      }
      
      // Write operations require provider_admin
      if (isWriteOperation(request) && !hasProviderRole(session, 'provider_admin')) {
        return NextResponse.json(
          { error: 'Forbidden: Admin role required' },
          { status: 403 }
        );
      }
      
      return NextResponse.next();
    }
    
    // Monetization API routes
    if (pathname.startsWith('/api/monetization')) {
      const session = getProviderSession(request);
      
      if (!session) {
        return NextResponse.json(
          { error: 'Unauthorized: Provider authentication required' },
          { status: 401 }
        );
      }
      
      // All write operations require provider_admin
      if (isWriteOperation(request) && !hasProviderRole(session, 'provider_admin')) {
        return NextResponse.json(
          { error: 'Forbidden: Admin role required for monetization changes' },
          { status: 403 }
        );
      }
      
      return NextResponse.next();
    }
    
    // Provider API routes
    if (pathname.startsWith('/api/provider')) {
      const session = getProviderSession(request);
      
      if (!session) {
        return NextResponse.json(
          { error: 'Unauthorized: Provider authentication required' },
          { status: 401 }
        );
      }
      
      return NextResponse.next();
    }
    
    // Developer API routes
    if (pathname.startsWith('/api/developer')) {
      const session = getDeveloperSession(request);
      
      if (!session) {
        return NextResponse.json(
          { error: 'Unauthorized: Developer authentication required' },
          { status: 401 }
        );
      }
      
      return NextResponse.next();
    }
  }
  
  // Allow all other routes
  return NextResponse.next();
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

