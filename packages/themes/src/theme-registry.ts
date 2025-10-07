/**
 * Shared Theme Registry
 * Central source of truth for theme metadata across apps.
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
  | 'figma-creative'
  // Corporate Professional
  | 'corporate-blue'
  | 'modern-slate'
  | 'executive-steel'
  // Financial Services
  | 'finance-navy'
  | 'trust-gold'
  | 'quant-teal'
  // Healthcare
  | 'clinical-blue'
  | 'wellness-green'
  // Legal/Consulting
  | 'counsel-burgundy'
  | 'parchment-cream'
  // Minimalist/High-Contrast
  | 'mono-high-contrast'
  | 'minimalist-ink';

export type ThemeScope = 'admin' | 'client';

export interface ThemeMetadata {
  id: ThemeName;
  name: string;
  description: string;
  category: 'Futuristic' | 'Shadcn' | 'SaaS' | 'Corporate' | 'Finance' | 'Healthcare' | 'Legal' | 'Monochrome' | 'HighContrast';
  primaryColor: string;
  preview?: string;
}

export const THEME_REGISTRY: Record<ThemeName, ThemeMetadata> = {
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

  // Corporate Professional
  'corporate-blue': {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    description: 'Enterprise-grade corporate palette',
    category: 'Corporate',
    primaryColor: '#2563eb',
  },
  'modern-slate': {
    id: 'modern-slate',
    name: 'Modern Slate',
    description: 'Contemporary professional gray tones',
    category: 'Corporate',
    primaryColor: '#64748b',
  },
  'executive-steel': {
    id: 'executive-steel',
    name: 'Executive Steel',
    description: 'Refined steel and charcoal aesthetic',
    category: 'Corporate',
    primaryColor: '#475569',
  },

  // Financial Services
  'finance-navy': {
    id: 'finance-navy',
    name: 'Finance Navy',
    description: 'Deep navy for financial trust',
    category: 'Finance',
    primaryColor: '#1e3a8a',
  },
  'trust-gold': {
    id: 'trust-gold',
    name: 'Trust Gold',
    description: 'Premium gold accents for wealth management',
    category: 'Finance',
    primaryColor: '#d4af37',
  },
  'quant-teal': {
    id: 'quant-teal',
    name: 'Quant Teal',
    description: 'Data-driven teal for analytics',
    category: 'Finance',
    primaryColor: '#14b8a6',
  },

  // Healthcare
  'clinical-blue': {
    id: 'clinical-blue',
    name: 'Clinical Blue',
    description: 'Calming clinical blue for healthcare',
    category: 'Healthcare',
    primaryColor: '#1e40af',
  },
  'wellness-green': {
    id: 'wellness-green',
    name: 'Wellness Green',
    description: 'Healing green for wellness applications',
    category: 'Healthcare',
    primaryColor: '#059669',
  },

  // Legal/Consulting
  'counsel-burgundy': {
    id: 'counsel-burgundy',
    name: 'Counsel Burgundy',
    description: 'Sophisticated burgundy for legal services',
    category: 'Legal',
    primaryColor: '#7f1d1d',
  },
  'parchment-cream': {
    id: 'parchment-cream',
    name: 'Parchment Cream',
    description: 'Classic cream and warm neutrals',
    category: 'Legal',
    primaryColor: '#d4a574',
  },

  // Minimalist/High-Contrast
  'mono-high-contrast': {
    id: 'mono-high-contrast',
    name: 'Mono High Contrast',
    description: 'Maximum readability black and white',
    category: 'HighContrast',
    primaryColor: '#ffffff',
  },
  'minimalist-ink': {
    id: 'minimalist-ink',
    name: 'Minimalist Ink',
    description: 'Pure ink black with subtle accents',
    category: 'Monochrome',
    primaryColor: '#111111',
  },
};

export function getAllThemes(): ThemeMetadata[] {
  return Object.values(THEME_REGISTRY);
}

export function getThemesByCategory(category: 'Futuristic' | 'Shadcn' | 'SaaS' | 'Corporate' | 'Finance' | 'Healthcare' | 'Legal' | 'Monochrome' | 'HighContrast'): ThemeMetadata[] {
  return getAllThemes().filter(theme => theme.category === category);
}

export function getThemeMetadata(themeId: ThemeName): ThemeMetadata {
  return THEME_REGISTRY[themeId];
}

export function getThemeCategories(): Array<'Futuristic' | 'Shadcn' | 'SaaS' | 'Corporate' | 'Finance' | 'Healthcare' | 'Legal' | 'Monochrome' | 'HighContrast'> {
  return ['Futuristic', 'Shadcn', 'SaaS', 'Corporate', 'Finance', 'Healthcare', 'Legal', 'Monochrome', 'HighContrast'];
}

export function getThemesGrouped(): Record<string, ThemeMetadata[]> {
  return {
    Futuristic: getThemesByCategory('Futuristic'),
    Shadcn: getThemesByCategory('Shadcn'),
    SaaS: getThemesByCategory('SaaS'),
    Corporate: getThemesByCategory('Corporate'),
    Finance: getThemesByCategory('Finance'),
    Healthcare: getThemesByCategory('Healthcare'),
    Legal: getThemesByCategory('Legal'),
    Monochrome: getThemesByCategory('Monochrome'),
    HighContrast: getThemesByCategory('HighContrast'),
  };
}

export const DEFAULT_THEME: ThemeName = 'futuristic-green';

export const THEME_STORAGE_KEYS = {
  admin: 'rs_admin_theme',
  client: 'rs_client_theme',
} as const;

export const THEME_COOKIE_NAMES = {
  admin: 'rs_admin_theme',
  client: 'rs_client_theme',
} as const;

