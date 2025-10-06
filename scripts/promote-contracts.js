#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(process.cwd(), 'contracts');
const current = path.join(OUT_DIR, 'current.json');
const previous = path.join(OUT_DIR, 'previous.json');

if (!fs.existsSync(current)) {
  console.error('contracts/current.json not found. Run scripts/generate-contract-snapshot.js first.');
  process.exit(1);
}

fs.copyFileSync(current, previous);
console.log('Promoted contracts/current.json to contracts/previous.json');

