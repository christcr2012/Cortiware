#!/usr/bin/env tsx
/**
 * Database loader for customers
 * Reads Cortiware-compatible customers JSON and loads into database
 * 
 * Usage:
 *   tsx scripts/seeds/load_customers.ts <input.json> [--dry-run]
 * 
 * Input format (from migration scripts):
 * [
 *   {
 *     "id": "CUST-001",
 *     "name": "Acme Corp",
 *     "email": "contact@acme.com",
 *     "phone": "555-1234",
 *     "address": "123 Main St",
 *     "orgId": "demo-org"
 *   }
 * ]
 */

import * as fs from 'fs';
import * as path from 'path';

type Customer = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  orgId: string;
};

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: tsx scripts/seeds/load_customers.ts <input.json> [--dry-run]');
    process.exit(1);
  }

  const inputFile = args[0];
  const dryRun = args.includes('--dry-run');

  // Validate input file exists
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Input file not found: ${inputFile}`);
    process.exit(1);
  }

  // Read and parse input
  const rawData = fs.readFileSync(inputFile, 'utf-8');
  let customers: Customer[];
  
  try {
    customers = JSON.parse(rawData);
  } catch (err) {
    console.error('❌ Invalid JSON in input file:', err);
    process.exit(1);
  }

  // Validate data structure
  if (!Array.isArray(customers)) {
    console.error('❌ Input must be an array of customers');
    process.exit(1);
  }

  // Validate each customer
  const errors: string[] = [];
  customers.forEach((customer, idx) => {
    if (!customer.id) errors.push(`Customer ${idx}: missing id`);
    if (!customer.name) errors.push(`Customer ${idx}: missing name`);
    if (!customer.orgId) errors.push(`Customer ${idx}: missing orgId`);
  });

  if (errors.length > 0) {
    console.error('❌ Validation errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }

  console.log(`📦 Found ${customers.length} customer(s) to load`);
  
  if (dryRun) {
    console.log('\n🔍 DRY RUN - No database changes will be made\n');
    customers.forEach((customer, idx) => {
      console.log(`${idx + 1}. ${customer.name} (${customer.id})`);
      if (customer.email) console.log(`   Email: ${customer.email}`);
      if (customer.phone) console.log(`   Phone: ${customer.phone}`);
      if (customer.address) console.log(`   Address: ${customer.address}`);
      console.log(`   Org: ${customer.orgId}`);
    });
    console.log('\n✅ Dry run complete. Remove --dry-run to load into database.');
    return;
  }

  // Database loading logic
  // NOTE: This is a template. Actual implementation would use Prisma or direct DB connection
  console.log('\n⚠️  Database loading not yet implemented');
  console.log('This script validates and displays the data structure.');
  console.log('To implement database loading:');
  console.log('1. Import PrismaClient or your DB client');
  console.log('2. Create/update Customer records in a transaction');
  console.log('3. Handle conflicts (upsert vs create)');
  console.log('4. Add rollback capability');
  
  console.log('\n📋 Customers ready for loading:');
  customers.forEach((customer, idx) => {
    console.log(`${idx + 1}. ${customer.name} (${customer.id})`);
    if (customer.email) console.log(`   Email: ${customer.email}`);
    if (customer.phone) console.log(`   Phone: ${customer.phone}`);
    if (customer.address) console.log(`   Address: ${customer.address}`);
    console.log(`   Org: ${customer.orgId}`);
  });

  console.log('\n✅ Validation complete. Database loader implementation pending.');
  console.log('See: docs/planning/ALL_PHASES_COMPLETE.md - Known Limitations');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

