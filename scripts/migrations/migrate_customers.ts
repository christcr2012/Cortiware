#!/usr/bin/env tsx
// Migration template for customers from external system to Cortiware

import fs from 'fs';
import path from 'path';

type ExternalCustomer = {
  external_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  [key: string]: any;
};

type CortiwareCustomer = {
  id: string;
  orgId: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
};

function transformCustomer(external: ExternalCustomer, orgId: string): CortiwareCustomer {
  return {
    id: external.external_id,
    orgId,
    name: external.name,
    email: external.email,
    phone: external.phone,
    address: external.address,
  };
}

async function main() {
  const inputFile = process.argv[2];
  const orgId = process.argv[3];
  const outputFile = process.argv[4] || 'out/migrated_customers.json';

  if (!inputFile || !orgId) {
    console.error('Usage: tsx scripts/migrations/migrate_customers.ts <input.json> <orgId> [output.json]');
    console.error('Example: tsx scripts/migrations/migrate_customers.ts external_customers.json org-123 out/customers.json');
    process.exit(1);
  }

  console.log('Customer Migration');
  console.log('==================\n');
  console.log(`Input: ${inputFile}`);
  console.log(`Org ID: ${orgId}`);
  console.log(`Output: ${outputFile}\n`);

  // Load external data
  const inputPath = path.resolve(inputFile);
  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const externalCustomers: ExternalCustomer[] = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  console.log(`Loaded ${externalCustomers.length} external customer(s)\n`);

  // Transform
  const cortiwareCustomers = externalCustomers.map(c => transformCustomer(c, orgId));

  // Validate
  const errors: string[] = [];
  for (const customer of cortiwareCustomers) {
    if (!customer.id) errors.push(`Missing ID for customer: ${JSON.stringify(customer)}`);
    if (!customer.name) errors.push(`Missing name for customer: ${customer.id}`);
  }

  if (errors.length > 0) {
    console.error('Validation errors:');
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }

  // Write output
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(cortiwareCustomers, null, 2));

  console.log(`✅ Migrated ${cortiwareCustomers.length} customer(s) to ${outputFile}`);
  console.log('\nNext steps:');
  console.log('1. Review the output file');
  console.log('2. Import to database: tsx scripts/seeds/load_customers.ts');
  console.log('3. Verify in application');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

