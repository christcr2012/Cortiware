/**
 * TOTP and backup code verification helpers
 */
/**
 * Verify a TOTP code against a secret
 */
export declare function verifyTOTPCode(code: string, secret: string): boolean;
/**
 * Verify a backup/recovery code
 * Returns updated backup codes JSON if valid
 */
export declare function verifyBackupCode(code: string, backupCodesHash: string): Promise<{
    valid: boolean;
    updatedJson?: string;
}>;
/**
 * Generate a TOTP secret
 */
export declare function generateTOTPSecret(): string;
/**
 * Generate backup codes (returns array of plain codes and array of hashed codes)
 */
export declare function generateBackupCodes(count?: number): Promise<{
    plainCodes: string[];
    hashedCodes: string[];
}>;
//# sourceMappingURL=totp.d.ts.map