// importers/excel/import_landfills.mjs
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

function validateSchema(rows) {
  if (!rows || rows.length === 0) throw new Error("No rows found in input file");
  const required = ['id', 'name', 'lat', 'lon', 'accepts'];
  const first = rows[0];
  for (const col of required) {
    if (!(col in first)) throw new Error(`Missing required column: ${col}`);
  }
}

const file = process.argv[2];
if (!file) { console.error("Usage: node importers/excel/import_landfills.mjs <file>"); process.exit(1); }
const rows = readAny(file);
validateSchema(rows);
const out = rows.map(r => ({ id: r.id, name: r.name, lat: Number(r.lat), lon: Number(r.lon), accepts: typeof r.accepts === "string" ? r.accepts.split(/[;,]/).map(s=>s.trim()) : [] }));
fs.mkdirSync("out", { recursive: true }); fs.writeFileSync("out/landfills.import.json", JSON.stringify(out, null, 2));
console.log(`Wrote out/landfills.import.json with ${out.length} landfills`);

