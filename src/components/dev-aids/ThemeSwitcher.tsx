"use client";

import React from 'react';
import { ThemeName, ThemeScope, getTheme, setTheme, initTheme } from "@/lib/theme";

const THEMES: ThemeName[] = [
  'futuristic-green',
  'sapphire-blue',
  'crimson-tech',
  'cyber-purple',
  'graphite-orange',
  'neon-aqua',
];

export function ThemeSwitcher({ scope }: { scope: ThemeScope }) {
  const [value, setValue] = React.useState<ThemeName>(initTheme(scope));

  React.useEffect(() => {
    // Ensure attribute reflects stored theme on mount and when scope changes
    initTheme(scope);
  }, [scope]);

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as ThemeName;
    setValue(next);
    setTheme(scope, next);
    try {
      await fetch('/api/theme', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ scope, theme: next }) });
    } catch {}

  }

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <label style={{ fontWeight: 600 }}>Theme ({scope} scope):</label>
      <select value={value} onChange={onChange} style={{ padding: 6, borderRadius: 6 }}>
        {THEMES.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <small>Separate storage: admin affects Provider/Developer; client affects Tenant/Accountant/vendor.</small>
    </div>
  );
}

