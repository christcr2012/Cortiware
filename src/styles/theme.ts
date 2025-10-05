// Global theme configuration for Robinson Solutions
// Masculine, futuristic, high-tech aesthetic with green accents

export const theme = {
  colors: {
    // Primary green palette
    primary: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
    // Accent emerald
    accent: {
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
    },
    // Dark backgrounds
    background: {
      primary: '#0a0f0d',
      secondary: '#111816',
      tertiary: '#1a2420',
      card: '#0f1613',
      hover: '#1a2420',
    },
    // Borders
    border: {
      default: 'rgba(16, 185, 129, 0.2)',
      hover: 'rgba(16, 185, 129, 0.4)',
      active: 'rgba(16, 185, 129, 0.6)',
    },
    // Text
    text: {
      primary: '#f9fafb',
      secondary: '#d1d5db',
      tertiary: '#9ca3af',
      muted: '#6b7280',
    },
  },
  gradients: {
    primary: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    header: 'linear-gradient(to right, #10b981, #34d399)',
    card: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
    glow: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(16, 185, 129, 0.05)',
    md: '0 4px 6px -1px rgba(16, 185, 129, 0.1)',
    lg: '0 10px 15px -3px rgba(16, 185, 129, 0.2)',
    xl: '0 20px 25px -5px rgba(16, 185, 129, 0.3)',
    glow: '0 0 20px rgba(16, 185, 129, 0.3)',
    glowStrong: '0 0 30px rgba(16, 185, 129, 0.5)',
  },
  effects: {
    backdropBlur: 'blur(12px)',
    glassBackground: 'rgba(15, 22, 19, 0.8)',
  },
} as const;

export type Theme = typeof theme;

