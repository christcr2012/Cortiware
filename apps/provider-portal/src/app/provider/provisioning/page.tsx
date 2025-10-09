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
  const [templates, workflows, stats] = await Promise.all([
    getProvisioningTemplates(),
    getActiveWorkflows(),
    getWorkflowStats(),
  ]);

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

