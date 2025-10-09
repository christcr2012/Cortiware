import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // GitHub OAuth configuration
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/oauth/github/callback`;
  
  if (!clientId) {
    return NextResponse.json(
      { error: 'GitHub OAuth not configured' },
      { status: 500 }
    );
  }

  // Build GitHub OAuth URL
  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', clientId);
  githubAuthUrl.searchParams.set('redirect_uri', redirectUri);
  githubAuthUrl.searchParams.set('scope', 'read:user user:email');

  return NextResponse.redirect(githubAuthUrl.toString());
}

