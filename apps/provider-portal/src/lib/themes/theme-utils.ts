/**
 * Theme Utilities
 * 
 * Shared utilities for theme management across all components.
 * Handles localStorage, cookies, and theme application.
 */

import { ThemeName, ThemeScope, DEFAULT_THEME, THEME_STORAGE_KEYS } from './theme-registry';

/**
 * Get current theme from localStorage
 */
export function getTheme(scope: ThemeScope): ThemeName {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  
  const key = THEME_STORAGE_KEYS[scope];
  const stored = localStorage.getItem(key);
  
  return (stored as ThemeName) || DEFAULT_THEME;
}

/**
 * Set theme in localStorage and apply to document
 *
 * NOTE: This does NOT persist to cookie. The caller should handle
 * persisting to the server via /api/theme if needed.
 */
export function setTheme(scope: ThemeScope, theme: ThemeName): void {
  if (typeof window === 'undefined') return;

  const key = THEME_STORAGE_KEYS[scope];
  localStorage.setItem(key, theme);

  // Apply theme to document immediately
  document.documentElement.setAttribute('data-theme', theme);

  console.log('[setTheme] Applied theme:', { scope, theme, key });
}

/**
 * Initialize theme on page load
 */
export function initTheme(scope: ThemeScope): ThemeName {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  
  const theme = getTheme(scope);
  document.documentElement.setAttribute('data-theme', theme);
  
  return theme;
}

/**
 * Get theme from cookie (for SSR)
 */
export function getThemeFromCookie(scope: ThemeScope, cookies: string): ThemeName {
  const key = THEME_STORAGE_KEYS[scope];
  const match = cookies.match(new RegExp(`${key}=([^;]+)`));
  
  if (match && match[1]) {
    return match[1] as ThemeName;
  }
  
  return DEFAULT_THEME;
}

/**
 * Apply theme class to element
 */
export function applyThemeToElement(element: HTMLElement, theme: ThemeName): void {
  element.setAttribute('data-theme', theme);
}

/**
 * Remove theme class from element
 */
export function removeThemeFromElement(element: HTMLElement): void {
  element.removeAttribute('data-theme');
}

/**
 * Watch for theme changes
 */
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

/**
 * Get CSS variable value for current theme
 */
export function getThemeVariable(variable: string): string {
  if (typeof window === 'undefined') return '';
  
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

/**
 * Check if theme is dark
 */
export function isThemeDark(theme: ThemeName): boolean {
  // All our themes are dark themes
  return true;
}

/**
 * Get contrast color for theme
 */
export function getContrastColor(theme: ThemeName): string {
  // All dark themes use white text
  return '#ffffff';
}

