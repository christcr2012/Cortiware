/**
 * Theme Management - Centralized API
 * 
 * Single entry point for all theme-related functionality.
 * All theme switchers and components should import from this file.
 * 
 * Architecture:
 * - themes/theme-registry.ts: Theme definitions and metadata
 * - themes/theme-utils.ts: Theme manipulation utilities
 * - theme.ts (this file): Public API that re-exports everything
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

