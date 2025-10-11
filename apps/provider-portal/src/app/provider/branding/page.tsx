import { getAllBrandingConfigs, getBrandingStats, getBrandingTemplates, type BrandingTemplate, type BrandConfig } from '@/services/provider/branding.service';
import BrandingClient from './BrandingClient';

type BrandingOrg = {
  id: string;
  name: string;
  brandConfig: BrandConfig;
  createdAt: Date;
  updatedAt: Date;
};

type BrandingStats = {
  totalOrgs: number;
  orgsWithBranding: number;
  orgsWithLogo: number;
  orgsWithCustomColors: number;
  brandingAdoptionRate: number;
};

export default async function BrandingPage() {
  // Handle build-time gracefully (no DATABASE_URL available)
  let configs: BrandingOrg[] = [];
  let stats: BrandingStats = {
    totalOrgs: 0,
    orgsWithBranding: 0,
    orgsWithLogo: 0,
    orgsWithCustomColors: 0,
    brandingAdoptionRate: 0
  };
  let templates: BrandingTemplate[] = [];

  try {
    [configs, stats, templates] = await Promise.all([
      getAllBrandingConfigs(),
      getBrandingStats(),
      getBrandingTemplates(),
    ]);
  } catch (error) {
    console.log('Branding page: Database not available during build, using empty data');
  }

  return (
    <BrandingClient
      initialConfigs={configs}
      initialStats={stats}
      templates={templates}
    />
  );
}

