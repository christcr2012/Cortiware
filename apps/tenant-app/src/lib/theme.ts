/**
 * Theme Management - Centralized API for Tenant App
 * 
 * Single entry point for all theme-related functionality.
 * All theme switchers and components should import from this file.
 */

// Re-export types
export type { ThemeName, ThemeScope, ThemeMetadata } from '@cortiware/themes';

// Re-export registry functions
export {
  THEME_REGISTRY,
  getAllThemes,
  getThemesByCategory,
  getThemeMetadata,
  getThemeCategories,
  getThemesGrouped,
  DEFAULT_THEME,
  THEME_STORAGE_KEYS,
  THEME_COOKIE_NAMES,
} from '@cortiware/themes';

// Re-export utility functions
export {
  getTheme,
  setTheme,
  initTheme,
  getThemeFromCookie,
  applyThemeToElement,
  removeThemeFromElement,
  watchThemeChanges,
  getThemeVariable,
  isThemeDark,
  getContrastColor,
} from '@cortiware/themes';

