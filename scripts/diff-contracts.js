#!/usr/bin/env node
/* Simple contract diff (placeholder).
 * Compares contracts/current.json to contracts/previous.json if present.
 * Prints added/removed files by filename and hash changes. Exits 0 unless --fail-on-breaking is set and previous exists and any file removed.
 */
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'contracts');

function load(name) {
  const full = path.join(OUT_DIR, name);
  if (!fs.existsSync(full)) return null;
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

function main() {
  const curr = load('current.json');
  if (!curr) {
    console.error('No current.json found. Run scripts/generate-contract-snapshot.js first.');
    process.exit(1);
  }
  const prev = load('previous.json') || { entries: [] };

  const prevMap = new Map(prev.entries.map(e => [e.file, e.sha256]));
  const currMap = new Map(curr.entries.map(e => [e.file, e.sha256]));

  const added = curr.entries.filter(e => !prevMap.has(e.file)).map(e => e.file);
  const removed = prev.entries.filter(e => !currMap.has(e.file)).map(e => e.file);
  const changed = curr.entries.filter(e => prevMap.get(e.file) && prevMap.get(e.file) !== e.sha256).map(e => e.file);

  console.log('Added:', added);
  console.log('Removed:', removed);
  console.log('Changed:', changed);

  const failOnBreaking = process.argv.includes('--fail-on-breaking');
  if (failOnBreaking && removed.length > 0) {
    console.error('Breaking change detected: contract files removed:', removed);
    process.exit(2);
  }
}

main();

