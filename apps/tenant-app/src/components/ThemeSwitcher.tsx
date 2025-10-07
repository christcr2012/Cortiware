'use client';

import { useState, useEffect } from 'react';
import {
  ThemeName,
  getAllThemes,
  getThemesGrouped,
  getTheme,
  setTheme,
} from '../lib/theme';

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('futuristic-green');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const theme = getTheme('client');
    setCurrentTheme(theme);
  }, []);

  const handleThemeChange = async (theme: ThemeName) => {
    setCurrentTheme(theme);
    setTheme('client', theme);
    setIsOpen(false);

    // Persist to server
    try {
      await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: 'client', theme }),
      });
    } catch (error) {
      console.error('Failed to persist theme:', error);
    }
  };

  const groupedThemes = getThemesGrouped();
  const allThemes = getAllThemes();
  const currentThemeData = allThemes.find(t => t.id === currentTheme);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border-primary)',
          color: 'var(--text-primary)',
        }}
      >
        <div
          className="w-4 h-4 rounded-full"
          style={{ background: currentThemeData?.primaryColor || 'var(--brand-primary)' }}
        />
        <span className="text-sm font-medium">{currentThemeData?.name || 'Theme'}</span>
        <svg
          className="w-4 h-4 transition-transform"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg overflow-hidden z-50"
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-primary)',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          <div className="p-4">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Choose Theme
            </h3>

            {Object.entries(groupedThemes).map(([category, themes]) => (
              <div key={category} className="mb-4">
                <h4
                  className="text-xs font-medium uppercase tracking-wide mb-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {category}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleThemeChange(theme.id)}
                      className="flex items-center gap-2 p-2 rounded-md transition-all text-left"
                      style={{
                        background: currentTheme === theme.id ? 'var(--surface-3)' : 'var(--surface-2)',
                        border: `1px solid ${currentTheme === theme.id ? 'var(--border-accent)' : 'var(--border-secondary)'}`,
                      }}
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: theme.primaryColor }}
                      />
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-xs font-medium truncate"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {theme.name}
                        </div>
                        <div
                          className="text-xs truncate"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          {theme.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

