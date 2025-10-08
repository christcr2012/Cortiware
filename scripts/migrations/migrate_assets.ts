#!/usr/bin/env tsx
// Migration template for assets from external system to Cortiware

import fs from 'fs';
import path from 'path';

type ExternalAsset = {
  external_id: string;
  type: string;
  size?: string;
  tag?: string;
  [key: string]: any;
};

type CortiwareAsset = {
  id: string;
  orgId: string;
  type: string;
  size?: string;
  idTag?: string;
};

function transformAsset(external: ExternalAsset, orgId: string): CortiwareAsset {
  return {
    id: external.external_id,
    orgId,
    type: external.type.toLowerCase(),
    size: external.size,
    idTag: external.tag,
  };
}

async function main() {
  const inputFile = process.argv[2];
  const orgId = process.argv[3];
  const outputFile = process.argv[4] || 'out/migrated_assets.json';

  if (!inputFile || !orgId) {
    console.error('Usage: tsx scripts/migrations/migrate_assets.ts <input.json> <orgId> [output.json]');
    console.error('Example: tsx scripts/migrations/migrate_assets.ts external_assets.json org-123 out/assets.json');
    process.exit(1);
  }

  console.log('Asset Migration');
  console.log('===============\n');
  console.log(`Input: ${inputFile}`);
  console.log(`Org ID: ${orgId}`);
  console.log(`Output: ${outputFile}\n`);

  // Load external data
  const inputPath = path.resolve(inputFile);
  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  const externalAssets: ExternalAsset[] = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  console.log(`Loaded ${externalAssets.length} external asset(s)\n`);

  // Transform
  const cortiwareAssets = externalAssets.map(a => transformAsset(a, orgId));

  // Validate
  const errors: string[] = [];
  for (const asset of cortiwareAssets) {
    if (!asset.id) errors.push(`Missing ID for asset: ${JSON.stringify(asset)}`);
    if (!asset.type) errors.push(`Missing type for asset: ${asset.id}`);
  }

  if (errors.length > 0) {
    console.error('Validation errors:');
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }

  // Write output
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(cortiwareAssets, null, 2));

  console.log(`✅ Migrated ${cortiwareAssets.length} asset(s) to ${outputFile}`);
  console.log('\nNext steps:');
  console.log('1. Review the output file');
  console.log('2. Import to database: tsx scripts/seeds/load_assets.ts');
  console.log('3. Verify in application');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

