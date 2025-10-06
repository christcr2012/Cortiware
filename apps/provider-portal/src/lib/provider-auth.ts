import type { NextApiRequest } from 'next';

type ProviderAuthOptions = {
  email: string;
  password: string;
  totpCode?: string;
  ipAddress?: string;
  userAgent?: string;
};

export async function authenticateProvider(arg: NextApiRequest | ProviderAuthOptions): Promise<any> {
  // Request form: used by provider APIs
  if (typeof (arg as NextApiRequest).headers !== 'undefined') {
    const req = arg as NextApiRequest;
    const cookie = req.headers.cookie || '';
    const match = cookie.match(/rs_provider=([^;]+)/) || cookie.match(/ws_provider=([^;]+)/) || cookie.match(/provider-session=([^;]+)/);
    if (match) {
      return { email: decodeURIComponent(match[1]) };
    }
    return null;
  }

  // Credentials form: used by login flow
  const opts = arg as ProviderAuthOptions;
  const ok = !!(process.env.PROVIDER_EMAIL && process.env.PROVIDER_PASSWORD &&
    opts.email?.toLowerCase() === process.env.PROVIDER_EMAIL.toLowerCase() &&
    opts.password === process.env.PROVIDER_PASSWORD);
  if (ok) return { success: true, mode: 'env' };
  return { success: false, requiresTOTP: false, error: 'not_configured' };
}

