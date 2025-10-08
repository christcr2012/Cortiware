/**
 * Import Wizard Page
 * 
 * Client-only page that allows providers to import data from CSV files.
 * Generates *.import.json files that can be used with batch job endpoints.
 * 
 * NO new HTTP routes - uses existing batch job infrastructure.
 */

import { ImportWizard } from './ImportWizard';

export const metadata = {
  title: 'Import Wizard | Cortiware',
  description: 'Import data from CSV files',
};

export default function ImportWizardPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <ImportWizard />
    </div>
  );
}

