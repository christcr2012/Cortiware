#!/usr/bin/env tsx
// Verify that route count does not exceed 36-route cap

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const MAX_ROUTES = 36;

async function countRoutes(): Promise<number> {
  // Find all route files in apps/*/app/**/route.ts
  const routeFiles = await glob('apps/*/app/**/route.{ts,tsx,js,jsx}', { cwd: process.cwd() });
  return routeFiles.length;
}

async function main() {
  console.log('Verifying route count...\n');
  
  const count = await countRoutes();
  console.log(`Found ${count} route(s)`);
  console.log(`Maximum allowed: ${MAX_ROUTES}\n`);

  if (count > MAX_ROUTES) {
    console.error(`❌ FAILED: Route count (${count}) exceeds cap (${MAX_ROUTES})`);
    console.error('No new HTTP routes are allowed. Use packages/* and scripts/* instead.');
    process.exit(1);
  } else {
    console.log(`✅ PASSED: Route count within cap (${count}/${MAX_ROUTES})`);
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

