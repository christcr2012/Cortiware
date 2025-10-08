#!/usr/bin/env node
/* Contract snapshot generator
 * Scans Reference/repo-docs/docs/api/** for .md files and writes contracts/current.json
 */
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const API_ROOT = path.join(process.cwd(), 'Reference', 'repo-docs', 'docs', 'api');
const OUT_DIR = path.join(process.cwd(), 'contracts');

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

async function walk(dir, acc = []) {
  const ents = await fsp.readdir(dir, { withFileTypes: true });
  for (const ent of ents) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) await walk(p, acc);
    else if (ent.isFile() && p.endsWith('.md')) acc.push(p);
  }
  return acc;
}

async function main() {
  if (!fs.existsSync(API_ROOT)) {
    console.warn('⚠️  API docs directory not found:', API_ROOT);
    console.warn('⚠️  Skipping contract snapshot generation (Reference/ is gitignored)');
    // Create empty snapshot so diff script doesn't fail
    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
    const outFile = path.join(OUT_DIR, 'current.json');
    const snapshot = { generatedAt: new Date().toISOString(), entries: [], note: 'Reference/ directory not available' };
    await fsp.writeFile(outFile, JSON.stringify(snapshot, null, 2));
    console.log(`✅ Wrote empty snapshot to ${outFile}`);
    return;
  }
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const files = (await walk(API_ROOT)).sort();
  const entries = [];
  for (const f of files) {
    const buf = await fsp.readFile(f);
    const rel = path.relative(process.cwd(), f).replace(/\\\\/g, '/');
    entries.push({ file: rel, sha256: sha256(buf) });
  }
  const outFile = path.join(OUT_DIR, 'current.json');
  const snapshot = { generatedAt: new Date().toISOString(), entries };
  await fsp.writeFile(outFile, JSON.stringify(snapshot, null, 2));
  console.log(`Wrote ${outFile} with ${entries.length} entries`);
}

main().catch((e)=>{ console.error(e); process.exit(1); });

