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
  const [isApplying, setIsApplying] = React.useState(false);
  const allThemes = getAllThemes();

  React.useEffect(() => {
    // Ensure attribute reflects stored theme on mount and when scope changes
    initTheme(scope);
  }, [scope]);

  async function handleThemeClick(themeId: ThemeName) {
    console.log('[ThemeSwitcher] Applying theme:', { themeId, scope });
    setIsApplying(true);
    setValue(themeId);

    // Apply theme immediately to document for instant visual feedback
    setTheme(scope, themeId);
    console.log('[ThemeSwitcher] Theme applied to document:', document.documentElement.getAttribute('data-theme'));

    // Persist to server (sets cookie)
    try {
      const response = await fetch('/api/theme', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ scope, theme: themeId })
      });

      const result = await response.json();
      console.log('[ThemeSwitcher] Server response:', result);

      // Reload page to apply theme from server-side (cookie)
      // This ensures the theme persists across navigation
      setTimeout(() => {
        console.log('[ThemeSwitcher] Reloading page...');
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('[ThemeSwitcher] Failed to persist theme:', error);
      setIsApplying(false);
    }
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
          Choose Your Theme {isApplying && <span style={{ color: 'var(--accent-success)', fontSize: 14 }}>✓ Applying...</span>}
        </div>
        <small style={{ color: 'var(--text-secondary)' }}>
          {scope === 'admin'
            ? 'This theme applies to Provider and Developer portals. Click any theme card to apply it. The page will reload to apply the theme across all pages.'
            : 'This theme applies to Owner, Accountant, and future vendor portals. Click any theme card to apply it. The page will reload to apply the theme across all pages.'}
        </small>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 12,
      }}>
        {allThemes.map(theme => {
          const isSelected = value === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => handleThemeClick(theme.id)}
              style={{
                padding: 12,
                borderRadius: 8,
                border: isSelected ? `2px solid ${theme.primaryColor}` : '1px solid var(--border-primary)',
                background: isSelected ? 'var(--glass-bg)' : 'var(--bg-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
                color: 'var(--text-primary)',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isSelected ? `0 0 20px ${theme.primaryColor}40` : 'none',
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
                {theme.name} {isSelected && <span style={{ color: theme.primaryColor }}>✓</span>}
              </div>
              <div style={{
                fontSize: 12,
                color: 'var(--text-tertiary)',
              }}>
                {theme.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

