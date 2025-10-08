/**
 * Import Wizard Page - CLIENT/OWNER PORTAL
 *
 * Allows business owners (roofing companies, HVAC contractors, etc.) to import
 * their customer data, equipment, facilities, and other business data from CSV files.
 *
 * Access: Owner-only (not available to staff/field users)
 * Availability: All clients regardless of vertical
 *
 * Generates *.import.json files that can be used with batch job endpoints.
 * NO new HTTP routes - uses existing batch job infrastructure.
 */

import { ImportWizard } from './ImportWizard';

export const metadata = {
  title: 'Import Wizard | Cortiware',
  description: 'Import your business data from CSV files',
};

export default function ImportWizardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <ImportWizard />
    </div>
  );
}

