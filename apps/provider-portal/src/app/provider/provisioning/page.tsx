/**
 * Tenant Provisioning Page
 * 
 * Automated tenant provisioning workflows and templates
 */

import { Suspense } from 'react';
import ProvisioningClient from './ProvisioningClient';
import {
  getProvisioningTemplates,
  getActiveWorkflows,
  getWorkflowStats,
} from '@/services/provider/provisioning.service';

export const metadata = {
  title: 'Tenant Provisioning | Provider Portal',
  description: 'Automated tenant provisioning workflows and templates',
};

export default async function ProvisioningPage() {
  // Handle build-time gracefully (no DATABASE_URL available)
  let templates = [];
  let workflows = [];
  let stats = { total: 0, active: 0, completed: 0, failed: 0 };

  try {
    [templates, workflows, stats] = await Promise.all([
      getProvisioningTemplates(),
      getActiveWorkflows(),
      getWorkflowStats(),
    ]);
  } catch (error) {
    console.log('Provisioning page: Database not available during build, using empty data');
  }

  return (
    <div className="p-6">
      <Suspense fallback={<div>Loading...</div>}>
        <ProvisioningClient
          initialTemplates={templates}
          initialWorkflows={workflows}
          initialStats={stats}
        />
      </Suspense>
    </div>
  );
}

