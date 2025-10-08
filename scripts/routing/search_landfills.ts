#!/usr/bin/env tsx
// Search landfills by material acceptance

import fs from 'fs';
import path from 'path';

type Landfill = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  accepts: string[];
};

async function main() {
  const material = process.argv[2];
  const landfillsFile = process.argv[3] || 'out/landfills.import.json';

  if (!material) {
    console.error('Usage: tsx scripts/routing/search_landfills.ts <material> [landfills.json]');
    console.error('Example: tsx scripts/routing/search_landfills.ts msw out/landfills.import.json');
    process.exit(1);
  }

  const landfillsPath = path.resolve(landfillsFile);
  if (!fs.existsSync(landfillsPath)) {
    console.error(`Landfills file not found: ${landfillsPath}`);
    console.error('Run an importer first to generate landfills data.');
    process.exit(1);
  }

  const landfills: Landfill[] = JSON.parse(fs.readFileSync(landfillsPath, 'utf8'));
  
  const matches = landfills.filter(lf => 
    lf.accepts.some(m => m.toLowerCase().includes(material.toLowerCase()))
  );

  console.log(`\nFound ${matches.length} landfill(s) accepting "${material}":\n`);
  
  for (const lf of matches) {
    console.log(`  ${lf.id} - ${lf.name}`);
    console.log(`    Location: ${lf.lat}, ${lf.lon}`);
    console.log(`    Accepts: ${lf.accepts.join(', ')}`);
    console.log('');
  }

  if (matches.length === 0) {
    console.log('  (none found)');
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

