"use client";

import React from 'react';
import { ThemeSwitcher } from "@/components/dev-aids/ThemeSwitcher";

function DemoButton() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <button style={{ padding: '8px 14px', borderRadius: 8, background: 'var(--accent, #00ff88)', color: '#000' }}>Solid</button>
      <button style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid var(--accent, #00ff88)', background: 'transparent', color: 'var(--accent, #00ff88)' }}>Outline</button>
      <button style={{ padding: '8px 14px', borderRadius: 8, background: 'transparent', color: '#aaa' }}>Ghost</button>
    </div>
  );
}

function DemoInput() {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <label>Name</label>
      <input placeholder="Type here" style={{ padding: '8px 10px', borderRadius: 8, background: '#111', border: '1px solid #222', color: '#ddd' }} />
    </div>
  );
}

function DemoTable() {
  const rows = [
    { id: 'row_1', name: 'Alpha', status: 'active' },
    { id: 'row_2', name: 'Beta', status: 'paused' },
  ];
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', borderBottom: '1px solid #333', padding: 8 }}>ID</th>
          <th style={{ textAlign: 'left', borderBottom: '1px solid #333', padding: 8 }}>Name</th>
          <th style={{ textAlign: 'left', borderBottom: '1px solid #333', padding: 8 }}>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.id}>
            <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{r.id}</td>
            <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{r.name}</td>
            <td style={{ padding: 8, borderBottom: '1px solid #222' }}>{r.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DemoModal() {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      <button onClick={() => setOpen(true)} style={{ padding: '8px 14px', borderRadius: 8, background: '#222', border: '1px solid #444' }}>Open Modal</button>
      {open && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'grid', placeItems: 'center' }}>
          <div style={{ background: '#101010', border: '1px solid #333', padding: 16, borderRadius: 10, minWidth: 320 }}>
            <h3>Demo Modal</h3>
            <p>This is a simple modal demo.</p>
            <button onClick={() => setOpen(false)} style={{ padding: '6px 12px', borderRadius: 6, background: 'var(--accent, #00ff88)', color: '#000' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComponentsSandbox() {
  return (
    <div style={{ padding: 24, display: 'grid', gap: 24 }}>
      <h1>Components Sandbox</h1>
      <ThemeSwitcher scope="admin" />

      <section>
        <h2>Buttons</h2>
        <DemoButton />
      </section>

      <section>
        <h2>Inputs</h2>
        <DemoInput />
      </section>

      <section>
        <h2>Table</h2>
        <DemoTable />
      </section>

      <section>
        <h2>Modal</h2>
        <DemoModal />
      </section>
    </div>
  );
}

