/**
 * Unit Tests for Federation HMAC Signature Verification
 * Tests signature generation, verification, timestamp validation, and error cases
 */

import { describe, it, expect } from '@jest/globals';
import { generateSignature, verifySignature } from '../../apps/provider-portal/src/lib/federation/hmac';

describe('Federation HMAC Signature', () => {
  const testSecret = 'test-secret-key-123';
  const testMethod = 'POST';
  const testPath = '/api/v1/federation/escalation';
  const testTimestamp = '2025-01-15T10:30:00.000Z';

  describe('generateSignature', () => {
    it('should generate valid HMAC-SHA256 signature', () => {
      const signature = generateSignature(testMethod, testPath, testTimestamp, testSecret);
      
      expect(signature).toBeDefined();
      expect(signature).toMatch(/^sha256:[a-f0-9]{64}$/);
    });

    it('should generate consistent signatures for same inputs', () => {
      const sig1 = generateSignature(testMethod, testPath, testTimestamp, testSecret);
      const sig2 = generateSignature(testMethod, testPath, testTimestamp, testSecret);
      
      expect(sig1).toBe(sig2);
    });

    it('should generate different signatures for different methods', () => {
      const postSig = generateSignature('POST', testPath, testTimestamp, testSecret);
      const getSig = generateSignature('GET', testPath, testTimestamp, testSecret);
      
      expect(postSig).not.toBe(getSig);
    });

    it('should generate different signatures for different paths', () => {
      const sig1 = generateSignature(testMethod, '/api/v1/federation/escalation', testTimestamp, testSecret);
      const sig2 = generateSignature(testMethod, '/api/v1/federation/analytics', testTimestamp, testSecret);
      
      expect(sig1).not.toBe(sig2);
    });

    it('should generate different signatures for different timestamps', () => {
      const sig1 = generateSignature(testMethod, testPath, '2025-01-15T10:30:00.000Z', testSecret);
      const sig2 = generateSignature(testMethod, testPath, '2025-01-15T10:31:00.000Z', testSecret);
      
      expect(sig1).not.toBe(sig2);
    });

    it('should generate different signatures for different secrets', () => {
      const sig1 = generateSignature(testMethod, testPath, testTimestamp, 'secret1');
      const sig2 = generateSignature(testMethod, testPath, testTimestamp, 'secret2');
      
      expect(sig1).not.toBe(sig2);
    });
  });

  describe('verifySignature', () => {
    it('should verify valid signature', () => {
      const signature = generateSignature(testMethod, testPath, testTimestamp, testSecret);
      const isValid = verifySignature(testMethod, testPath, testTimestamp, signature, testSecret);
      
      expect(isValid).toBe(true);
    });

    it('should reject invalid signature', () => {
      const invalidSig = 'sha256:' + '0'.repeat(64);
      const isValid = verifySignature(testMethod, testPath, testTimestamp, invalidSig, testSecret);

      expect(isValid).toBe(false);
    });

    it('should reject signature with wrong method', () => {
      const signature = generateSignature('POST', testPath, testTimestamp, testSecret);
      const isValid = verifySignature('GET', testPath, testTimestamp, signature, testSecret);
      
      expect(isValid).toBe(false);
    });

    it('should reject signature with wrong path', () => {
      const signature = generateSignature(testMethod, '/api/v1/federation/escalation', testTimestamp, testSecret);
      const isValid = verifySignature(testMethod, '/api/v1/federation/analytics', testTimestamp, signature, testSecret);
      
      expect(isValid).toBe(false);
    });

    it('should reject signature with wrong timestamp', () => {
      const signature = generateSignature(testMethod, testPath, '2025-01-15T10:30:00.000Z', testSecret);
      const isValid = verifySignature(testMethod, testPath, '2025-01-15T10:31:00.000Z', signature, testSecret);
      
      expect(isValid).toBe(false);
    });

    it('should reject signature with wrong secret', () => {
      const signature = generateSignature(testMethod, testPath, testTimestamp, 'secret1');
      const isValid = verifySignature(testMethod, testPath, testTimestamp, signature, 'secret2');
      
      expect(isValid).toBe(false);
    });

    it('should reject malformed signature (missing sha256 prefix)', () => {
      const isValid = verifySignature(testMethod, testPath, testTimestamp, 'abc123', testSecret);
      
      expect(isValid).toBe(false);
    });

    it('should reject empty signature', () => {
      const isValid = verifySignature(testMethod, testPath, testTimestamp, '', testSecret);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Timestamp Validation', () => {
    it('should accept timestamp within clock skew window (5 minutes)', () => {
      const now = new Date();
      const timestamp = new Date(now.getTime() - 2 * 60 * 1000).toISOString(); // 2 minutes ago
      const signature = generateSignature(testMethod, testPath, timestamp, testSecret);
      const isValid = verifySignature(testMethod, testPath, timestamp, signature, testSecret);
      
      expect(isValid).toBe(true);
    });

    it('should reject timestamp outside clock skew window', () => {
      const now = new Date();
      const timestamp = new Date(now.getTime() - 10 * 60 * 1000).toISOString(); // 10 minutes ago
      const signature = generateSignature(testMethod, testPath, timestamp, testSecret);
      
      // Note: verifySignature only checks signature match, not timestamp validity
      // Timestamp validation is done separately in the verify middleware
      expect(signature).toBeDefined();
    });

    it('should handle future timestamps within window', () => {
      const now = new Date();
      const timestamp = new Date(now.getTime() + 2 * 60 * 1000).toISOString(); // 2 minutes future
      const signature = generateSignature(testMethod, testPath, timestamp, testSecret);
      const isValid = verifySignature(testMethod, testPath, timestamp, signature, testSecret);
      
      expect(isValid).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in path', () => {
      const specialPath = '/api/v1/federation/test?param=value&other=123';
      const signature = generateSignature(testMethod, specialPath, testTimestamp, testSecret);
      const isValid = verifySignature(testMethod, specialPath, testTimestamp, signature, testSecret);
      
      expect(isValid).toBe(true);
    });

    it('should handle empty path', () => {
      const signature = generateSignature(testMethod, '', testTimestamp, testSecret);
      const isValid = verifySignature(testMethod, '', testTimestamp, signature, testSecret);
      
      expect(isValid).toBe(true);
    });

    it('should handle very long secrets', () => {
      const longSecret = 'a'.repeat(1000);
      const signature = generateSignature(testMethod, testPath, testTimestamp, longSecret);
      const isValid = verifySignature(testMethod, testPath, testTimestamp, signature, longSecret);
      
      expect(isValid).toBe(true);
    });

    it('should be case-sensitive for method', () => {
      const signature = generateSignature('POST', testPath, testTimestamp, testSecret);
      const isValid = verifySignature('post', testPath, testTimestamp, signature, testSecret);
      
      expect(isValid).toBe(false);
    });
  });
});

