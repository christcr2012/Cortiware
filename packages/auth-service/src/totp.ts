/**
 * TOTP and backup code verification helpers
 */

import { authenticator } from 'otplib';
import bcrypt from 'bcryptjs';

/**
 * Verify a TOTP code against a secret
 */
export function verifyTOTPCode(code: string, secret: string): boolean {
  try {
    return authenticator.verify({ token: code, secret });
  } catch (error) {
    console.error('TOTP verification error:', error);
    return false;
  }
}

/**
 * Verify a backup/recovery code
 * Returns updated backup codes JSON if valid
 */
export async function verifyBackupCode(
  code: string,
  backupCodesHash: string
): Promise<{ valid: boolean; updatedJson?: string }> {
  try {
    const codes = JSON.parse(backupCodesHash);
    
    for (let i = 0; i < codes.length; i++) {
      const isMatch = await bcrypt.compare(code, codes[i]);
      if (isMatch) {
        // Remove the used code
        codes.splice(i, 1);
        return {
          valid: true,
          updatedJson: JSON.stringify(codes),
        };
      }
    }
    
    return { valid: false };
  } catch (error) {
    console.error('Backup code verification error:', error);
    return { valid: false };
  }
}

/**
 * Generate a TOTP secret
 */
export function generateTOTPSecret(): string {
  return authenticator.generateSecret();
}

/**
 * Generate backup codes (returns array of plain codes and array of hashed codes)
 */
export async function generateBackupCodes(count: number = 10): Promise<{
  plainCodes: string[];
  hashedCodes: string[];
}> {
  const plainCodes: string[] = [];
  const hashedCodes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    plainCodes.push(code);
    
    const hash = await bcrypt.hash(code, 10);
    hashedCodes.push(hash);
  }
  
  return { plainCodes, hashedCodes };
}

