# Cortiware Theme System Architecture

## Monorepo-First Design

This document describes how the Cortiware theme system leverages the Turborepo monorepo structure for maximum code reuse and maintainability.

## Architecture Overview

```
packages/themes/                    # Shared theme package
├── package.json                    # Package definition
└── src/
    ├── index.ts                    # Public API (types, registry, utils)
    ├── theme-registry.ts           # Theme metadata (27 themes)
    ├── theme-utils.ts              # Client utilities (getTheme, setTheme, etc.)
    └── themes.css                  # SINGLE SOURCE OF TRUTH for all CSS

apps/provider-portal/
├── next.config.js                  # transpilePackages: ['@cortiware/themes']
├── src/
│   ├── app/layout.tsx              # Reads rs_admin_theme cookie → data-theme
│   ├── lib/theme.ts                # Re-exports from @cortiware/themes
│   └── styles/
│       └── globals.css             # @import '@cortiware/themes/src/themes.css'

apps/tenant-app/
├── next.config.js                  # transpilePackages: ['@cortiware/themes']
├── src/
│   ├── app/layout.tsx              # Reads rs_client_theme cookie → data-theme
│   └── styles/
│       └── globals.css             # @import '@cortiware/themes/src/themes.css'
```

## Key Principles

### 1. Single Source of Truth
- **All theme CSS lives in `packages/themes/src/themes.css`**
- Both apps import this file via `@import '@cortiware/themes/src/themes.css'`
- No duplication of CSS variables or theme definitions
- Changes to themes propagate to both apps automatically

### 2. Shared Metadata & Utilities
- Theme registry (27 themes with metadata) in `packages/themes/src/theme-registry.ts`
- Client utilities (getTheme, setTheme, initTheme) in `packages/themes/src/theme-utils.ts`
- TypeScript types exported from shared package
- Both apps consume the same API

### 3. Independent Cookie Scopes
- Provider Portal: `rs_admin_theme` cookie
- Tenant App: `rs_client_theme` cookie
- Each app's root layout reads its own cookie and sets `data-theme` on `<html>`
- Theme switching is isolated per app

### 4. SSR-Compatible
- Root layouts read cookies server-side
- `data-theme` attribute set on `<html>` before first paint
- No flash of unstyled content (FOUC)
- Login pages themed correctly from initial load

## Theme Registry (27 Themes)

### Futuristic (6 themes)
- futuristic-green (default)
- sapphire-blue
- crimson-tech
- cyber-purple
- graphite-orange
- neon-aqua

### Shadcn-Inspired (4 themes)
- shadcn-slate
- shadcn-zinc
- shadcn-rose
- shadcn-emerald

### SaaS-Inspired (5 themes)
- stripe-clean
- linear-minimal
- notion-warm
- vercel-contrast
- figma-creative

### Corporate Professional (3 themes)
- corporate-blue
- modern-slate
- executive-steel

### Financial Services (3 themes)
- finance-navy
- trust-gold
- quant-teal

### Healthcare (2 themes)
- clinical-blue
- wellness-green

### Legal/Consulting (2 themes)
- counsel-burgundy
- parchment-cream

### Minimalist/High-Contrast (2 themes)
- mono-high-contrast
- minimalist-ink

## CSS Variable Contract

All themes must define these variables:

### Backgrounds
- `--bg-primary`, `--bg-secondary`, `--bg-tertiary`, `--bg-elevated`
- `--bg-main` (gradient)
- `--glass-bg`, `--glass-border`, `--glass-border-accent`
- `--surface-1`, `--surface-2`, `--surface-3`, `--surface-hover`

### Typography
- `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-muted`, `--text-accent`

### Brand
- `--brand-primary`, `--brand-secondary`, `--brand-tertiary`
- `--brand-gradient`

### Accents
- `--accent-success`, `--accent-warning`, `--accent-error`, `--accent-info`, `--accent-purple`

### Borders
- `--border-primary`, `--border-secondary`, `--border-accent`, `--border-glow`

### Effects
- `--shadow-glow`, `--shadow-glow-intense`

### Tokens
- `--radius-sm/md/lg/xl`
- `--space-xs/sm/md/lg/xl`

## Component Classes

Defined in `packages/themes/src/themes.css`:

- `.premium-card` - Glass morphism card
- `.input-field` - Themed input
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.glass-panel` - Glass effect panel
- `.border-gradient` - Gradient border effect
- `.skeleton` - Loading skeleton

## Usage in Apps

### Provider Portal

```tsx
// apps/provider-portal/src/app/layout.tsx
import '../styles/globals.css'; // Imports shared themes.css
import { cookies } from 'next/headers';

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const theme = cookieStore.get('rs_admin_theme')?.value || 'futuristic-green';
  
  return (
    <html lang="en" data-theme={theme}>
      <body>{children}</body>
    </html>
  );
}
```

```tsx
// apps/provider-portal/src/lib/theme.ts
export { THEME_REGISTRY, getAllThemes, DEFAULT_THEME } from '@cortiware/themes';
export { getTheme, setTheme, initTheme } from '@cortiware/themes';
```

### Tenant App

```tsx
// apps/tenant-app/src/app/layout.tsx
import '../styles/globals.css'; // Imports shared themes.css
import { cookies } from 'next/headers';
import { DEFAULT_THEME } from '@cortiware/themes';

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const theme = cookieStore.get('rs_client_theme')?.value || DEFAULT_THEME;
  
  return (
    <html lang="en" data-theme={theme}>
      <body>{children}</body>
    </html>
  );
}
```

## Benefits of This Architecture

1. **DRY (Don't Repeat Yourself)**: One CSS file, two apps
2. **Type Safety**: Shared TypeScript types across apps
3. **Consistency**: Same theme definitions everywhere
4. **Maintainability**: Update once, deploy everywhere
5. **Performance**: Shared package cached by Turbo
6. **Scalability**: Easy to add new apps that consume themes
7. **Monorepo-Native**: Leverages workspace dependencies properly

## Adding New Themes

1. Add metadata to `packages/themes/src/theme-registry.ts`
2. Add CSS block to `packages/themes/src/themes.css`
3. Both apps automatically get the new theme
4. No app-specific changes needed

## Testing Theme Changes

```bash
# Build both apps to verify themes work
npm run build -- --filter=provider-portal --filter=tenant-app

# Dev mode for live testing
npm run dev -- --filter=provider-portal
npm run dev -- --filter=tenant-app
```

## Accessibility

All themes maintain WCAG AA contrast ratios minimum:
- Text on backgrounds: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: Clear focus states
- Error states: Color + icon/text (not color alone)

