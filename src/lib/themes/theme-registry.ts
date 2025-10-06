/**
 * Centralized Theme Registry
 * 
 * Single source of truth for all themes across the application.
 * All theme switchers pull from this registry.
 * 
 * Theme Categories:
 * - Futuristic: High-tech, masculine, sharp accents
 * - Shadcn: Modern, component-focused, minimalist
 * - SaaS: Inspired by popular platforms (Stripe, Linear, Notion, etc.)
 */

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

export interface ThemeMetadata {
  id: ThemeName;
  name: string;
  description: string;
  category: 'Futuristic' | 'Shadcn' | 'SaaS';
  primaryColor: string;
  preview?: string;
}

/**
 * Complete theme registry with metadata
 */
export const THEME_REGISTRY: Record<ThemeName, ThemeMetadata> = {
  // Futuristic Themes
  'futuristic-green': {
    id: 'futuristic-green',
    name: 'Futuristic Green',
    description: 'High-tech, masculine, sharp green accents',
    category: 'Futuristic',
    primaryColor: '#00ff88',
  },
  'sapphire-blue': {
    id: 'sapphire-blue',
    name: 'Sapphire Blue',
    description: 'Professional, trustworthy blue tones',
    category: 'Futuristic',
    primaryColor: '#3aa8ff',
  },
  'crimson-tech': {
    id: 'crimson-tech',
    name: 'Crimson Tech',
    description: 'Bold, energetic red accents',
    category: 'Futuristic',
    primaryColor: '#ff4d4d',
  },
  'cyber-purple': {
    id: 'cyber-purple',
    name: 'Cyber Purple',
    description: 'Creative, innovative purple theme',
    category: 'Futuristic',
    primaryColor: '#a06bff',
  },
  'graphite-orange': {
    id: 'graphite-orange',
    name: 'Graphite Orange',
    description: 'Warm, approachable orange tones',
    category: 'Futuristic',
    primaryColor: '#ff9a3a',
  },
  'neon-aqua': {
    id: 'neon-aqua',
    name: 'Neon Aqua',
    description: 'Fresh, modern aqua accents',
    category: 'Futuristic',
    primaryColor: '#2cf2ff',
  },
  
  // Shadcn-Inspired Themes
  'shadcn-slate': {
    id: 'shadcn-slate',
    name: 'Shadcn Slate',
    description: 'Minimalist precision with slate tones',
    category: 'Shadcn',
    primaryColor: '#38bdf8',
  },
  'shadcn-zinc': {
    id: 'shadcn-zinc',
    name: 'Shadcn Zinc',
    description: 'Industrial elegance with zinc palette',
    category: 'Shadcn',
    primaryColor: '#a78bfa',
  },
  'shadcn-rose': {
    id: 'shadcn-rose',
    name: 'Shadcn Rose',
    description: 'Sophisticated warmth with rose accents',
    category: 'Shadcn',
    primaryColor: '#f472b6',
  },
  'shadcn-emerald': {
    id: 'shadcn-emerald',
    name: 'Shadcn Emerald',
    description: 'Tech forest with emerald greens',
    category: 'Shadcn',
    primaryColor: '#10b981',
  },
  
  // SaaS-Inspired Themes
  'stripe-clean': {
    id: 'stripe-clean',
    name: 'Stripe Clean',
    description: 'Clean, professional, trustworthy (Stripe-inspired)',
    category: 'SaaS',
    primaryColor: '#635bff',
  },
  'linear-minimal': {
    id: 'linear-minimal',
    name: 'Linear Minimal',
    description: 'Minimalist, modern, geometric (Linear-inspired)',
    category: 'SaaS',
    primaryColor: '#8b5cf6',
  },
  'notion-warm': {
    id: 'notion-warm',
    name: 'Notion Warm',
    description: 'Warm, inviting, productive (Notion-inspired)',
    category: 'SaaS',
    primaryColor: '#fbbf24',
  },
  'vercel-contrast': {
    id: 'vercel-contrast',
    name: 'Vercel Contrast',
    description: 'Ultra-minimal, high contrast (Vercel-inspired)',
    category: 'SaaS',
    primaryColor: '#ffffff',
  },
  'figma-creative': {
    id: 'figma-creative',
    name: 'Figma Creative',
    description: 'Colorful, creative, playful (Figma-inspired)',
    category: 'SaaS',
    primaryColor: '#a855f7',
  },
};

/**
 * Get all themes
 */
export function getAllThemes(): ThemeMetadata[] {
  return Object.values(THEME_REGISTRY);
}

/**
 * Get themes by category
 */
export function getThemesByCategory(category: 'Futuristic' | 'Shadcn' | 'SaaS'): ThemeMetadata[] {
  return getAllThemes().filter(theme => theme.category === category);
}

/**
 * Get theme metadata by ID
 */
export function getThemeMetadata(themeId: ThemeName): ThemeMetadata {
  return THEME_REGISTRY[themeId];
}

/**
 * Get all theme categories
 */
export function getThemeCategories(): Array<'Futuristic' | 'Shadcn' | 'SaaS'> {
  return ['Futuristic', 'Shadcn', 'SaaS'];
}

/**
 * Get themes grouped by category
 */
export function getThemesGrouped(): Record<string, ThemeMetadata[]> {
  return {
    Futuristic: getThemesByCategory('Futuristic'),
    Shadcn: getThemesByCategory('Shadcn'),
    SaaS: getThemesByCategory('SaaS'),
  };
}

/**
 * Default theme
 */
export const DEFAULT_THEME: ThemeName = 'futuristic-green';

/**
 * Storage keys for theme persistence
 */
export const THEME_STORAGE_KEYS = {
  admin: 'rs_admin_theme',
  client: 'rs_client_theme',
} as const;

/**
 * Cookie names for SSR theme
 */
export const THEME_COOKIE_NAMES = {
  admin: 'rs_admin_theme',
  client: 'rs_client_theme',
} as const;

