// Federation Developer Services (system metadata)
// Provides diagnostics and health information for developer portal

import { FED_ENABLED, FED_OIDC_ENABLED } from '@/lib/config/federation';

export type Diagnostics = {
  service: string;
  version: string;
  time: string;
  environment: string;
  features: {
    federation: boolean;
    oidc: boolean;
  };
  runtime: string;
};

export interface DeveloperFederationService {
  getDiagnostics(): Promise<Diagnostics>;
}

export const developerFederationService: DeveloperFederationService = {
  async getDiagnostics() {
    return {
      service: 'cortiware-api',
      version: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'dev',
      time: new Date().toISOString(),
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
      features: {
        federation: FED_ENABLED,
        oidc: FED_OIDC_ENABLED,
      },
      runtime: process.env.NEXT_RUNTIME || 'nodejs',
    };
  },
};

