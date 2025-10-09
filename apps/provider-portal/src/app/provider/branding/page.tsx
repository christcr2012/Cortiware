import { getAllBrandingConfigs, getBrandingStats, getBrandingTemplates } from '@/services/provider/branding.service';
import BrandingClient from './BrandingClient';

export default async function BrandingPage() {
  const [configs, stats, templates] = await Promise.all([
    getAllBrandingConfigs(),
    getBrandingStats(),
    getBrandingTemplates(),
  ]);

  return (
    <BrandingClient
      initialConfigs={configs}
      initialStats={stats}
      templates={templates}
    />
  );
}

