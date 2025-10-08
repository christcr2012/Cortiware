// importers/excel/import_assets.mjs
import fs from "fs";
import xlsx from "xlsx";
import { parse } from "csv-parse/sync";
function readAny(path) {
  if (path.endsWith(".xlsx") || path.endsWith(".xls")) {
    const wb = xlsx.readFile(path); const ws = wb.Sheets[wb.SheetNames[0]];
    return xlsx.utils.sheet_to_json(ws, { defval: "" });
  } else {
    const text = fs.readFileSync(path, "utf8");
    return parse(text, { columns: true, skip_empty_lines: true });
  }
}
const file = process.argv[2]; const org = process.argv[3] || "demo-org";
if (!file) { console.error("Usage: node importers/excel/import_assets.mjs <file> [org]"); process.exit(1); }
const rows = readAny(file);
const out = rows.map((r, i) => ({ id: r.id || `A-${i+1}`, type: (r.type||'').toLowerCase(), size: r.size || '', idTag: r.idTag || null, orgId: org }));
fs.mkdirSync("out", { recursive: true }); fs.writeFileSync("out/assets.import.json", JSON.stringify(out, null, 2));
console.log(`Wrote out/assets.import.json with ${out.length} assets`);
