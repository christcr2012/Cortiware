import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export async function run() {
  const name = 'importers';
  let passed = 0, failed = 0, total = 0;

  // Test: assets importer with golden fixture
  total++;
  try {
    const fixturePath = path.join(process.cwd(), 'tests/fixtures/importers/assets_golden.csv');
    const expectedPath = path.join(process.cwd(), 'tests/fixtures/importers/assets_golden.expected.json');
    const outPath = path.join(process.cwd(), 'out/assets.import.json');
    
    // Run importer
    execSync(`node importers/excel/import_assets.mjs "${fixturePath}" test-org`, { stdio: 'pipe' });
    
    // Compare output
    const actual = JSON.parse(fs.readFileSync(outPath, 'utf8'));
    const expected = JSON.parse(fs.readFileSync(expectedPath, 'utf8'));
    
    if (JSON.stringify(actual) === JSON.stringify(expected)) {
      passed++;
    } else {
      throw new Error('Assets output does not match expected golden');
    }
  } catch (e) {
    failed++;
    console.error('importers assets golden failed', e);
  }

  // Test: landfills importer with golden fixture
  total++;
  try {
    const fixturePath = path.join(process.cwd(), 'tests/fixtures/importers/landfills_golden.csv');
    const expectedPath = path.join(process.cwd(), 'tests/fixtures/importers/landfills_golden.expected.json');
    const outPath = path.join(process.cwd(), 'out/landfills.import.json');
    
    // Run importer
    execSync(`node importers/excel/import_landfills.mjs "${fixturePath}"`, { stdio: 'pipe' });
    
    // Compare output
    const actual = JSON.parse(fs.readFileSync(outPath, 'utf8'));
    const expected = JSON.parse(fs.readFileSync(expectedPath, 'utf8'));
    
    if (JSON.stringify(actual) === JSON.stringify(expected)) {
      passed++;
    } else {
      throw new Error('Landfills output does not match expected golden');
    }
  } catch (e) {
    failed++;
    console.error('importers landfills golden failed', e);
  }

  // Test: schema validation (missing column)
  total++;
  try {
    const badPath = path.join(process.cwd(), 'tests/fixtures/importers/bad_schema.csv');
    fs.writeFileSync(badPath, 'wrong,columns\nval1,val2\n');
    
    try {
      execSync(`node importers/excel/import_assets.mjs "${badPath}" test-org`, { stdio: 'pipe' });
      throw new Error('Should have thrown schema validation error');
    } catch (e: any) {
      if (e.message && e.message.includes('Missing required column')) {
        passed++;
      } else {
        throw e;
      }
    } finally {
      fs.unlinkSync(badPath);
    }
  } catch (e) {
    failed++;
    console.error('importers schema validation failed', e);
  }

  return { name, passed, failed, total };
}

