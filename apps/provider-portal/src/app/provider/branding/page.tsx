import { getAllBrandingConfigs, getBrandingStats, getBrandingTemplates } from '@/services/provider/branding.service';
import BrandingClient from './BrandingClient';

export default async function BrandingPage() {
  // Handle build-time gracefully (no DATABASE_URL available)
  let configs = [];
  let stats = { total: 0, withBranding: 0, templates: 0 };
  let templates = [];

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

