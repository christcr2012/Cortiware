// importers/allypro/allypro_to_corti.mjs
import fs from "fs"; import xlsx from "xlsx"; import { parse } from "csv-parse/sync";
function readAny(path){ if(path.endsWith(".xlsx")||path.endsWith(".xls")){ const wb=xlsx.readFile(path); const ws=wb.Sheets[wb.SheetNames[0]]; return xlsx.utils.sheet_to_json(ws,{defval:""});} else { const text=fs.readFileSync(path,"utf8"); return parse(text,{columns:true,skip_empty_lines:true}); }}
const dir="importers/allypro/inbox"; const files=fs.existsSync(dir)?fs.readdirSync(dir):[];
const assets=[],stops=[],facilities=[],customers=[];
for(const name of files){ const p=`${dir}/${name}`; const rows=readAny(p);
  if(/asset/i.test(name)){ for(const r of rows) assets.push({ id:r.AssetID||r.id||r.asset_id, type:/porta|restroom|toilet/i.test(r.Category||r.Type||"")?"port-a-john":/roll|dumpster/i.test(r.Category||r.Type||"")?"rolloff":"unknown", size:r.Size||r.Model||"", idTag:r.Tag||r.RFID||null, status:r.Status||"unknown" }); }
  else if(/stop|order|route/i.test(name)){ for(const r of rows) stops.push({ id:r.OrderID||r.id, kind:/deliver/i.test(r.Type||"")?"drop":/pickup|remove/i.test(r.Type||"")?"pickup":/exchange|swap/i.test(r.Type||"")?"exchange":/service/i.test(r.Type||"")?"service":"drop", when:`${r.Date||""} ${r.Time||""}`.trim(), customer:r.CustomerName||r.Customer||"", customerId:r.CustomerID||null, address:r.Address||"", point:(r.Lat&&r.Lon)?{lat:Number(r.Lat),lon:Number(r.Lon)}:null, assetId:r.AssetID||null, notes:r.Notes||"" }); }
  else if(/facility|landfill|yard/i.test(name)){ for(const r of rows) facilities.push({ id:r.FacilityID||r.id, name:r.Name, type:/landfill|transfer/i.test(r.Type||"")?"landfill":"yard", lat:Number(r.Lat||0), lon:Number(r.Lon||0) }); }
  else if(/customer/i.test(name)){ for(const r of rows) customers.push({ id:r.CustomerID||r.id, name:r.Name, email:r.Email||"", phone:r.Phone||"", address:r.Address||"" }); }
}
fs.mkdirSync("out",{recursive:true}); fs.writeFileSync("out/allypro.assets.json",JSON.stringify(assets,null,2)); fs.writeFileSync("out/allypro.stops.json",JSON.stringify(stops,null,2)); fs.writeFileSync("out/allypro.facilities.json",JSON.stringify(facilities,null,2)); fs.writeFileSync("out/allypro.customers.json",JSON.stringify(customers,null,2)); console.log("Wrote out/allypro.*.json");

