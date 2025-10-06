import fs from 'node:fs/promises';
import path from 'node:path';

export default async function ApiExplorerPage() {
  const contractsPath = path.join(process.cwd(), 'contracts', 'current.json');
  let current: any = null; let prev: any = null;
  try { current = JSON.parse(await fs.readFile(contractsPath, 'utf8')); } catch (e) { current = { error: 'contracts/current.json not found. Run scripts/generate-contract-snapshot.js' }; }
  try { prev = JSON.parse(await fs.readFile(path.join(process.cwd(), 'contracts', 'previous.json'), 'utf8')); } catch {}

  const diffRows: Array<{file:string; current?:string; previous?:string; status:'new'|'removed'|'changed'|'same'}> = [];
  if (current?.entries) {
    const byFilePrev = new Map<string, any>((prev?.entries||[]).map((e:any)=>[e.file, e]));
    for (const e of current.entries) {
      const p = byFilePrev.get(e.file);
      if (!p) diffRows.push({ file: e.file, current: e.sha256, status: 'new' });
      else if (p.sha256 !== e.sha256) diffRows.push({ file: e.file, current: e.sha256, previous: p.sha256, status: 'changed' });
      else diffRows.push({ file: e.file, current: e.sha256, previous: p.sha256, status: 'same' });
    }
    // files removed
    for (const p of (prev?.entries||[])) {
      if (!(current.entries as any[]).some((e:any)=>e.file===p.file)) diffRows.push({ file: p.file, previous: p.sha256, status: 'removed' });
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>API Explorer — Contract Snapshot</h1>
      {current?.entries ? (
        <>
          <h2>Current Snapshot</h2>
          <table style={{ width: '100%', marginTop: 8, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #333', padding: 8 }}>File</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #333', padding: 8 }}>SHA-256</th>
              </tr>
            </thead>
            <tbody>
              {current.entries.map((e: any) => (
                <tr key={e.file}>
                  <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{e.file}</td>
                  <td style={{ padding: 8, fontFamily: 'monospace', borderBottom: '1px solid #222' }}>{e.sha256}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 style={{ marginTop: 24 }}>Diff vs previous.json</h2>
          {prev?.entries ? (
            <table style={{ width: '100%', marginTop: 8, borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #333', padding: 8 }}>File</th>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #333', padding: 8 }}>Current</th>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #333', padding: 8 }}>Previous</th>
                  <th style={{ textAlign: 'left', borderBottom: '1px solid #333', padding: 8 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {diffRows.map((r) => (
                  <tr key={`${r.file}-${r.status}`}>
                    <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{r.file}</td>
                    <td style={{ padding: 8, fontFamily: 'monospace', borderBottom: '1px solid #222' }}>{r.current || '-'}</td>
                    <td style={{ padding: 8, fontFamily: 'monospace', borderBottom: '1px solid #222' }}>{r.previous || '-'}</td>
                    <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No previous.json found</p>
          )}
        </>
      ) : (
        <pre style={{ marginTop: 16 }}>{JSON.stringify(current, null, 2)}</pre>
      )}
    </div>
  );
}

