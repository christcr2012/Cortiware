// apps/provider-portal/import-wizard/ImportWizard.tsx
import React, { useState } from "react";
type Row = Record<string, any>;
export default function ImportWizard(){
  const [rows, setRows] = useState<Row[]>([]);
  const [entity, setEntity] = useState<string>("assets");
  function onFile(e: React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0]; if(!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      // naive CSV parse (comma only for demo)
      const [head, ...lines] = text.split(/\r?\n/).filter(Boolean);
      const cols = head.split(",");
      const r = lines.map(line => {
        const vals = line.split(",");
        const obj: Row = {}; cols.forEach((c,i)=> obj[c.trim()] = (vals[i]||"").trim());
        return obj;
      });
      setRows(r);
    };
    reader.readAsText(f);
  }
  function download(){
    const blob = new Blob([JSON.stringify(rows, null, 2)], {type: "application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${entity}.import.json`; a.click();
  }
  return (<div className="p-6 space-y-4">
    <h1 className="text-xl font-bold">Import Wizard</h1>
    <select value={entity} onChange={e=>setEntity(e.target.value)}>
      <option>assets</option><option>customers</option><option>landfills</option><option>routes</option><option>stops</option>
    </select>
    <input type="file" accept=".csv,.txt" onChange={onFile} />
    <div className="text-sm">Rows parsed: {rows.length}</div>
    <button onClick={download} className="px-3 py-1 border rounded">Download {`{entity}`}.import.json</button>
    <p className="text-xs opacity-70">Drop the downloaded file into the importer CLI or seed job.</p>
  </div>);
}
