"use client";

import React from 'react';
import {
  ThemeName,
  ThemeScope,
  setTheme,
  initTheme,
  getAllThemes,
} from "@/lib/theme";

export function ThemeSwitcher({ scope }: { scope: ThemeScope }) {
  const [value, setValue] = React.useState<ThemeName>(initTheme(scope));
  const allThemes = getAllThemes();

  React.useEffect(() => {
    // Ensure attribute reflects stored theme on mount and when scope changes
    initTheme(scope);
  }, [scope]);

  function handleThemeClick(themeId: ThemeName) {
    setValue(themeId);
    setTheme(scope, themeId);
    fetch('/api/theme', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ scope, theme: themeId })
    }).catch(() => {});
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={{
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 8,
          fontSize: 16,
        }}>
          Choose Your Theme
        </div>
        <small style={{ color: 'var(--text-secondary)' }}>
          {scope === 'admin'
            ? 'This theme applies to Provider and Developer portals'
            : 'This theme applies to Owner, Accountant, and future vendor portals'}
        </small>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 12,
      }}>
        {allThemes.map(theme => (
          <button
            key={theme.id}
            onClick={() => handleThemeClick(theme.id)}
            style={{
              padding: 12,
              borderRadius: 8,
              border: value === theme.id ? `2px solid ${theme.primaryColor}` : '1px solid var(--border-primary)',
              background: value === theme.id ? 'var(--glass-bg)' : 'var(--bg-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left',
              color: 'var(--text-primary)',
            }}
          >
            <div style={{
              width: '100%',
              height: 4,
              borderRadius: 2,
              background: theme.primaryColor,
              marginBottom: 8
            }} />
            <div style={{
              fontWeight: 600,
              fontSize: 14,
              marginBottom: 4,
              color: 'var(--text-primary)',
            }}>
              {theme.name}
            </div>
            <div style={{
              fontSize: 12,
              color: 'var(--text-tertiary)',
            }}>
              {theme.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

