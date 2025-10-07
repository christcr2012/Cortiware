/**
 * Tests for auth ticket issue/verify flow
 */

import { issueAuthTicket, verifyAuthTicket } from '../ticket';

describe('Auth Ticket', () => {
  const testSecret = 'test-hmac-secret-key-for-testing-only';
  const testAudience = 'tenant-app';

  describe('issueAuthTicket', () => {
    it('should issue a valid ticket', async () => {
      const payload = {
        email: 'test@example.com',
        role: 'provider' as const,
        audience: testAudience,
      };

      const ticket = await issueAuthTicket(payload, testSecret);

      expect(ticket).toBeTruthy();
      expect(typeof ticket).toBe('string');
      expect(ticket.split('.').length).toBe(3); // JWT format: header.payload.signature
    });

    it('should include expiry in the ticket', async () => {
      const payload = {
        email: 'test@example.com',
        role: 'developer' as const,
        audience: testAudience,
      };

      const ticket = await issueAuthTicket(payload, testSecret);
      
      // Decode payload (base64url)
      const parts = ticket.split('.');
      const payloadJson = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      
      expect(payloadJson.exp).toBeTruthy();
      expect(payloadJson.exp).toBeGreaterThan(Date.now() / 1000);
    });
  });

  describe('verifyAuthTicket', () => {
    it('should verify a valid ticket', async () => {
      const payload = {
        email: 'test@example.com',
        role: 'provider' as const,
        audience: testAudience,
      };

      const ticket = await issueAuthTicket(payload, testSecret);
      const nonceStore = new Map<string, number>();
      
      const result = await verifyAuthTicket(ticket, testSecret, testAudience, nonceStore);

      expect(result.valid).toBe(true);
      expect(result.payload).toBeTruthy();
      expect(result.payload?.sub).toBe('test@example.com');
      expect(result.payload?.role).toBe('provider');
    });

    it('should reject ticket with wrong secret', async () => {
      const payload = {
        email: 'test@example.com',
        role: 'provider' as const,
        audience: testAudience,
      };

      const ticket = await issueAuthTicket(payload, testSecret);
      const nonceStore = new Map<string, number>();
      
      const result = await verifyAuthTicket(ticket, 'wrong-secret', testAudience, nonceStore);

      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should reject ticket with wrong audience', async () => {
      const payload = {
        email: 'test@example.com',
        role: 'provider' as const,
        audience: testAudience,
      };

      const ticket = await issueAuthTicket(payload, testSecret);
      const nonceStore = new Map<string, number>();
      
      const result = await verifyAuthTicket(ticket, testSecret, 'wrong-audience', nonceStore);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('audience');
    });

    it('should prevent replay attacks with nonce store', async () => {
      const payload = {
        email: 'test@example.com',
        role: 'provider' as const,
        audience: testAudience,
      };

      const ticket = await issueAuthTicket(payload, testSecret);
      const nonceStore = new Map<string, number>();
      
      // First verification should succeed
      const result1 = await verifyAuthTicket(ticket, testSecret, testAudience, nonceStore);
      expect(result1.valid).toBe(true);

      // Second verification with same ticket should fail (replay)
      const result2 = await verifyAuthTicket(ticket, testSecret, testAudience, nonceStore);
      expect(result2.valid).toBe(false);
      expect(result2.error).toContain('replay');
    });
  });
});

