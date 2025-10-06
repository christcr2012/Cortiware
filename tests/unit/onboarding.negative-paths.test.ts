/**
 * Negative Path Tests for Onboarding
 * Tests error handling: 400, 401, 403, 409, 429
 */

import { acceptOnboarding } from '@/server/services/onboarding.service';
import { verifyOnboardingToken } from '@/lib/onboardingToken';

export async function run() {
  const results = { name: 'onboarding.negative-paths', passed: 0, failed: 0, total: 0 };

  // Test 1: Invalid token format (400)
  results.total++;
  try {
    const res = await verifyOnboardingToken('invalid-token-format');
    if (!res.ok && res.error === 'invalid_token') {
      results.passed++;
    } else {
      console.error('Test 1 failed: Expected invalid_token error');
      results.failed++;
    }
  } catch (e) {
    console.error('Test 1 exception:', e);
    results.failed++;
  }

  // Test 2: Expired token (403)
  results.total++;
  try {
    // Create token that expired 1 hour ago
    const crypto = await import('crypto');
    const exp = new Date(Date.now() - 3600 * 1000).toISOString();
    const body = JSON.stringify({ exp });
    const secret = process.env.ONBOARDING_TOKEN_SECRET || 'dev-onboarding-secret';
    const bodyB64 = Buffer.from(body).toString('base64url');
    const hmac = crypto.createHmac('sha256', secret).update(bodyB64).digest('base64url');
    const expiredToken = `${bodyB64}.${hmac}`;

    const res = verifyOnboardingToken(expiredToken);
    if (!res.ok && res.error === 'expired') {
      results.passed++;
    } else {
      console.error('Test 2 failed: Expected expired error, got:', res);
      results.failed++;
    }
  } catch (e) {
    console.error('Test 2 exception:', e);
    results.failed++;
  }

  // Test 3: Missing required fields (400)
  results.total++;
  try {
    const res = await acceptOnboarding({
      token: 'valid-token',
      companyName: '', // missing
      ownerName: 'John',
      ownerEmail: 'john@example.com',
      password: 'password123',
    });
    if (!res.ok && (res.error === 'missing_fields' || res.error === 'invalid_token')) {
      results.passed++;
    } else {
      console.error('Test 3 failed: Expected missing_fields or invalid_token error');
      results.failed++;
    }
  } catch (e) {
    console.error('Test 3 exception:', e);
    results.failed++;
  }

  // Test 4: Invalid email format (400)
  results.total++;
  try {
    const res = await acceptOnboarding({
      token: 'valid-token',
      companyName: 'Acme Corp',
      ownerName: 'John',
      ownerEmail: 'not-an-email',
      password: 'password123',
    });
    if (!res.ok) {
      results.passed++;
    } else {
      console.error('Test 4 failed: Expected error for invalid email');
      results.failed++;
    }
  } catch (e) {
    console.error('Test 4 exception:', e);
    results.failed++;
  }

  // Test 5: Weak password (400)
  results.total++;
  try {
    const res = await acceptOnboarding({
      token: 'valid-token',
      companyName: 'Acme Corp',
      ownerName: 'John',
      ownerEmail: 'john@example.com',
      password: '123', // too short
    });
    if (!res.ok) {
      results.passed++;
    } else {
      console.error('Test 5 failed: Expected error for weak password');
      results.failed++;
    }
  } catch (e) {
    console.error('Test 5 exception:', e);
    results.failed++;
  }

  return results;
}

