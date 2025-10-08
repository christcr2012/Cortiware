// importers/routeware/routeware_to_corti.mjs
import fs from "fs"; import xlsx from "xlsx"; import { parse } from "csv-parse/sync";
function readAny(path) { if (path.endsWith(".xlsx")||path.endsWith(".xls")) { const wb=xlsx.readFile(path); const ws=wb.Sheets[wb.SheetNames[0]]; return xlsx.utils.sheet_to_json(ws, {defval:""});} else { const text=fs.readFileSync(path,"utf8"); return parse(text,{columns:true,skip_empty_lines:true}); } }
const dir = "importers/routeware/inbox"; const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
const assets=[],stops=[],facilities=[];
for (const name of files) { const p = `${dir}/${name}`; const rows = readAny(p);
  if (/inventory|asset/i.test(name)) { for (const r of rows) assets.push({ id: r.id||r.asset_id||r.serial||r.tag, type: /porta|restroom|toilet/i.test(r.type||r.category) ? "port-a-john" : /roll|dumpster/i.test(r.type||r.category) ? "rolloff" : "unknown", size: r.size||r.model||"", idTag: r.tag||r.rfid||null }); }
  else if (/route|stop|service/i.test(name)) { for (const r of rows) stops.push({ id: r.id||r.stop_id, kind: /deliver/i.test(r.kind||r.type) ? "drop" : /pickup|remove/i.test(r.kind||r.type) ? "pickup" : /exchange|swap/i.test(r.kind||r.type) ? "exchange" : /service/i.test(r.kind||r.type) ? "service" : "drop", when: r.when||r.date||null, customer: r.customer||r.site||null, assetId: r.asset_id||null, notes: r.notes||"" }); }
  else if (/facility|landfill|yard/i.test(name)) { for (const r of rows) facilities.push({ id: r.id||r.facility_id, name: r.name, lat: Number(r.lat||0), lon: Number(r.lon||0), type: /landfill|transfer/i.test(r.type||"") ? "landfill" : "yard" }); }
}
fs.mkdirSync("out", { recursive: true }); fs.writeFileSync("out/routeware.assets.json", JSON.stringify(assets,null,2)); fs.writeFileSync("out/routeware.stops.json", JSON.stringify(stops,null,2)); fs.writeFileSync("out/routeware.facilities.json", JSON.stringify(facilities,null,2)); console.log("Wrote out/routeware.*.json");
