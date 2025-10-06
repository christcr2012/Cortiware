// src/lib/theme.ts
// Theme utilities with separate scopes for admin (Provider/Developer) and client (Tenant/Accountant/vendor)

export type ThemeName =
  // Futuristic themes
  | 'futuristic-green'
  | 'sapphire-blue'
  | 'crimson-tech'
  | 'cyber-purple'
  | 'graphite-orange'
  | 'neon-aqua'
  // Shadcn-inspired themes
  | 'shadcn-slate'
  | 'shadcn-zinc'
  | 'shadcn-rose'
  | 'shadcn-emerald'
  // SaaS-inspired themes
  | 'stripe-clean'
  | 'linear-minimal'
  | 'notion-warm'
  | 'vercel-contrast'
  | 'figma-creative';

export type ThemeScope = 'admin' | 'client';

const DEFAULTS: Record<ThemeScope, ThemeName> = {
  admin: 'futuristic-green',
  client: 'futuristic-green',
};

const STORAGE_KEYS: Record<ThemeScope, string> = {
  admin: 'rs_admin_theme',
  client: 'rs_client_theme',
};

export function getTheme(scope: ThemeScope): ThemeName {
  if (typeof window === 'undefined') return DEFAULTS[scope];
  const raw = window.localStorage.getItem(STORAGE_KEYS[scope]);
  return (raw as ThemeName) || DEFAULTS[scope];
}

export function setTheme(scope: ThemeScope, theme: ThemeName) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEYS[scope], theme);
  // Apply theme to document root via data-theme
  document.documentElement.setAttribute('data-theme', theme);
}

export function initTheme(scope: ThemeScope) {
  const theme = getTheme(scope);
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
  return theme;
}

