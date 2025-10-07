/**
 * Core authentication functions
 */
import type { AuthResult, AuthInput, ProviderAuthConfig, DeveloperAuthConfig, DatabaseUser } from './types';
/**
 * Authenticate a Provider account (environment-based)
 */
export declare function authenticateProvider(input: AuthInput, config: ProviderAuthConfig): Promise<AuthResult>;
/**
 * Authenticate a Developer account (environment-based)
 */
export declare function authenticateDeveloper(input: AuthInput, config: DeveloperAuthConfig): Promise<AuthResult>;
/**
 * Authenticate a database user (tenant, accountant, vendor)
 * Requires a user object from the database
 */
export declare function authenticateDatabaseUser(input: AuthInput, user: DatabaseUser | null, devModeConfig?: {
    allowAnyTenant?: boolean;
    allowAnyAccountant?: boolean;
    allowAnyVendor?: boolean;
}): Promise<AuthResult>;
/**
 * Emergency authentication for Provider/Developer using bcrypt hashes
 * Used in tenant-app when federation is down
 */
export declare function authenticateEmergency(input: AuthInput, role: 'provider' | 'developer', passwordHash: string): Promise<AuthResult>;
//# sourceMappingURL=authenticate.d.ts.map