#!/usr/bin/env node
/* Simple contract snapshot generator (placeholder). Reads v2 contract docs and creates a hash.
 * Output: contracts/current.json
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CONTRACT_DIR = path.join(__dirname, '..', 'docs', 'api', 'v2', 'contracts');
const OUT_DIR = path.join(__dirname, '..', 'contracts');

function hashContent(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

function main() {
  const files = fs.readdirSync(CONTRACT_DIR).filter(f => f.endsWith('.md'));
  const entries = files.map(f => {
    const full = path.join(CONTRACT_DIR, f);
    const content = fs.readFileSync(full, 'utf8');
    return { file: f, sha256: hashContent(content) };
  });
  const snapshot = { generatedAt: new Date().toISOString(), entries };
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, 'current.json'), JSON.stringify(snapshot, null, 2));
  console.log('Wrote contracts/current.json');
}

main();

