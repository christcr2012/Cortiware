#!/usr/bin/env tsx
// Migration template for landfills from external system to Cortiware

import fs from 'fs';
import path from 'path';

type ExternalLandfill = {
  external_id: string;
  name: string;
  latitude: number;
  longitude: number;
  accepted_materials?: string;
  [key: string]: any;
};

type CortiwareLandfill = {
  id: string;
  orgId: string;
  name: string;
  lat: number;
  lon: number;
  accepts: string[];
};

function transformLandfill(external: ExternalLandfill, orgId: string): CortiwareLandfill {
  const accepts = external.accepted_materials
    ? external.accepted_materials.split(/[;,]/).map(s => s.trim()).filter(Boolean)
    : [];

  return {
    id: external.external_id,
    orgId,
    name: external.name,
    lat: external.latitude,
    lon: external.longitude,
    accepts,
  };
}

async function main() {
  const inputFile = process.argv[2];
  const orgId = process.argv[3];
  const outputFile = process.argv[4] || 'out/migrated_landfills.json';

  if (!inputFile || !orgId) {
    console.error('Usage: tsx scripts/migrations/migrate_landfills.ts <input.json> <orgId> [output.json]');
    console.error('Example: tsx scripts/migrations/migrate_landfills.ts external_landfills.json org-123 out/landfills.json');
    process.exit(1);
  }

  console.log('Landfill Migration');
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

  const externalLandfills: ExternalLandfill[] = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  console.log(`Loaded ${externalLandfills.length} external landfill(s)\n`);

  // Transform
  const cortiwareLandfills = externalLandfills.map(lf => transformLandfill(lf, orgId));

  // Validate
  const errors: string[] = [];
  for (const lf of cortiwareLandfills) {
    if (!lf.id) errors.push(`Missing ID for landfill: ${JSON.stringify(lf)}`);
    if (!lf.name) errors.push(`Missing name for landfill: ${lf.id}`);
    if (typeof lf.lat !== 'number' || typeof lf.lon !== 'number') {
      errors.push(`Invalid coordinates for landfill: ${lf.id}`);
    }
  }

  if (errors.length > 0) {
    console.error('Validation errors:');
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }

  // Write output
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(cortiwareLandfills, null, 2));

  console.log(`✅ Migrated ${cortiwareLandfills.length} landfill(s) to ${outputFile}`);
  console.log('\nNext steps:');
  console.log('1. Review the output file');
  console.log('2. Import to database: tsx scripts/seeds/load_landfills.ts');
  console.log('3. Verify in application');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

