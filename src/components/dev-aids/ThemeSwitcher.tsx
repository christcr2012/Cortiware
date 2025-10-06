"use client";

import React from 'react';
import {
  ThemeName,
  ThemeScope,
  getTheme,
  setTheme,
  initTheme,
  getThemesGrouped,
  getAllThemes,
} from "@/lib/theme";

export function ThemeSwitcher({ scope }: { scope: ThemeScope }) {
  const [value, setValue] = React.useState<ThemeName>(initTheme(scope));
  const themesGrouped = getThemesGrouped();
  const allThemes = getAllThemes();

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <label style={{ fontWeight: 600 }}>Theme ({scope} scope):</label>
        <select value={value} onChange={onChange} style={{ padding: 6, borderRadius: 6, minWidth: 200 }}>
          {Object.entries(themesGrouped).map(([category, themes]) => (
            <optgroup key={category} label={category}>
              {themes.map(theme => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <small style={{ color: 'var(--text-secondary)' }}>
        Separate storage: admin affects Provider/Developer; client affects Tenant/Accountant/vendor.
      </small>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 12,
        marginTop: 8
      }}>
        {allThemes.map(theme => (
          <button
            key={theme.id}
            onClick={() => {
              setValue(theme.id);
              setTheme(scope, theme.id);
              fetch('/api/theme', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ scope, theme: theme.id })
              }).catch(() => {});
            }}
            style={{
              padding: 12,
              borderRadius: 8,
              border: value === theme.id ? `2px solid ${theme.primaryColor}` : '1px solid var(--border-primary)',
              background: value === theme.id ? 'var(--glass-bg)' : 'var(--bg-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left',
            }}
          >
            <div style={{
              width: '100%',
              height: 4,
              borderRadius: 2,
              background: theme.primaryColor,
              marginBottom: 8
            }} />
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
              {theme.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
              {theme.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

