import { NextRequest } from 'next/server';
import { jsonOk, jsonError } from '@/lib/api/response';
import { compose, withProviderAuth, withRateLimit } from '@/lib/api/middleware';
import { prisma } from '@/lib/prisma';
import { trackFunnel } from '@/services/metrics.service';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.FED_HMAC_MASTER_KEY || 'default-key-change-in-production';

function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)), iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

const postHandler = async (req: NextRequest) => {
  const started = Date.now();
  try {
    // Load most recent OIDC config
    const config = await prisma.oIDCConfig.findFirst({ orderBy: { createdAt: 'desc' } });
    if (!config) {
      await trackFunnel('oidc_test_missing_config').catch(() => {});
      return jsonError(404, 'not_found', 'OIDC config not found');
    }

    const issuer = config.issuerUrl.replace(/\/+$/, '');
    // Discovery
    const wellKnownUrl = `${issuer}/.well-known/openid-configuration`;
    const discoveryRes = await fetch(wellKnownUrl, { method: 'GET', headers: { 'Accept': 'application/json' } });
    if (!discoveryRes.ok) {
      await trackFunnel('oidc_test_discovery_fail', { meta: { status: discoveryRes.status } } as any).catch(() => {});
      return jsonError(502, 'discovery_failed', `OIDC discovery failed (${discoveryRes.status})`);
    }
    const discovery = await discoveryRes.json();
    const tokenEndpoint: string | undefined = discovery.token_endpoint;
    if (!tokenEndpoint) {
      await trackFunnel('oidc_test_no_token_endpoint').catch(() => {});
      return jsonError(502, 'invalid_provider', 'OIDC provider did not expose token_endpoint');
    }

    // Token exchange using client_credentials and configured scopes
    const secret = decrypt(config.clientSecret);
    const body = new URLSearchParams();
    body.set('grant_type', 'client_credentials');
    if (config.scopes) body.set('scope', config.scopes);
    body.set('client_id', config.clientId);
    body.set('client_secret', secret);

    const tokenRes = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: body.toString(),
    });

    const durationMs = Date.now() - started;

    if (!tokenRes.ok) {
      let errJson: any = null;
      try { errJson = await tokenRes.json(); } catch {}
      await trackFunnel('oidc_test_token_fail', { meta: { status: tokenRes.status, durationMs } } as any).catch(() => {});
      // Do NOT include secrets in the response or logs
      return jsonError(502, 'token_exchange_failed', 'Failed to obtain access token');
    }

    const token = await tokenRes.json();
    if (!token || !token.access_token) {
      await trackFunnel('oidc_test_token_invalid', { meta: { durationMs } } as any).catch(() => {});
      return jsonError(502, 'token_invalid', 'Provider returned an invalid token response');
    }

    // Record success (update lastTestedAt)
    await prisma.oIDCConfig.update({ where: { id: config.id }, data: { lastTestedAt: new Date() } });
    await trackFunnel('oidc_test_ok', { meta: { durationMs } } as any).catch(() => {});

    return jsonOk({ success: true, message: 'OIDC connection successful' });
  } catch (error) {
    await trackFunnel('oidc_test_exception').catch(() => {});
    console.error('Error testing OIDC connection:', error);
    return jsonError(500, 'internal_error', 'Failed to test OIDC connection');
  }
};

export const POST = compose(withProviderAuth(), withRateLimit('api'))(postHandler);

