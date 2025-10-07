/**
 * Shared Theme Utilities
 */
import { ThemeName, ThemeScope, DEFAULT_THEME, THEME_STORAGE_KEYS } from './theme-registry';

export function getTheme(scope: ThemeScope): ThemeName {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  const key = THEME_STORAGE_KEYS[scope];
  const stored = localStorage.getItem(key);
  return (stored as ThemeName) || DEFAULT_THEME;
}

export function setTheme(scope: ThemeScope, theme: ThemeName): void {
  if (typeof window === 'undefined') return;
  const key = THEME_STORAGE_KEYS[scope];
  localStorage.setItem(key, theme);
  document.documentElement.setAttribute('data-theme', theme);
}

export function initTheme(scope: ThemeScope): ThemeName {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  const theme = getTheme(scope);
  document.documentElement.setAttribute('data-theme', theme);
  return theme;
}

export function getThemeFromCookie(scope: ThemeScope, cookies: string): ThemeName {
  const key = THEME_STORAGE_KEYS[scope];
  const match = cookies.match(new RegExp(`${key}=([^;]+)`));
  if (match && match[1]) {
    return match[1] as ThemeName;
  }
  return DEFAULT_THEME;
}

export function applyThemeToElement(element: HTMLElement, theme: ThemeName): void {
  element.setAttribute('data-theme', theme);
}

export function removeThemeFromElement(element: HTMLElement): void {
  element.removeAttribute('data-theme');
}

export function watchThemeChanges(scope: ThemeScope, callback: (theme: ThemeName) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const key = THEME_STORAGE_KEYS[scope];
  const handler = (e: StorageEvent) => {
    if (e.key === key && e.newValue) {
      callback(e.newValue as ThemeName);
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

export function getThemeVariable(variable: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

export function isThemeDark(theme: ThemeName): boolean {
  return true;
}

export function getContrastColor(theme: ThemeName): string {
  return '#ffffff';
}

