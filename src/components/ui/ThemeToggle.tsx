'use client';

import { useTheme } from '@/app/providers/ThemeProvider';
import { Moon, Sun, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes: Array<{ value: 'premium-dark' | 'premium-light' | 'system'; label: string; icon: React.ReactNode }> = [
    { value: 'premium-light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
    { value: 'premium-dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
    { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
  ];

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--surface-1)', border: '1px solid var(--border-primary)' }}>
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md transition-all text-sm font-medium"
          style={{
            background: theme === t.value ? 'var(--surface-3)' : 'transparent',
            color: theme === t.value ? 'var(--text-primary)' : 'var(--text-tertiary)',
            border: theme === t.value ? '1px solid var(--border-accent)' : '1px solid transparent',
          }}
          aria-label={`Switch to ${t.label} theme`}
        >
          {t.icon}
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

