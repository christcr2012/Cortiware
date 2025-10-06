# Cortiware Style Guide (Phase 1 — Premium Theme System)

Status: Design Spec (GPT‑5). Implementation deferred to Sonnet 4.5.

## Goals
- Premium default look (dark/light), high contrast and legibility
- Token-driven design via CSS variables (no hardcoded colors in components)
- ThemeProvider with system preference + user toggle + local persistence
- Maintain legacy playful themes under `src/styles/themes/legacy/*` (opt‑in)
- Zero runtime console warnings; TypeScript clean

## Design Tokens (CSS Custom Properties)
Define on `:root` and variant scopes (e.g., `.theme-premium-dark`, `.theme-premium-light`).

Color tokens
- `--color-bg` (page background)
- `--color-surface` (cards/panels)
- `--color-overlay` (modals, popovers)
- `--color-text` (default text)
- `--color-text-muted` (secondary)
- `--color-primary` (accent; accessible)
- `--color-success`, `--color-warning`, `--color-danger`
- `--color-border`
- `--color-chart-1..6` (chart palettes aligned to Recharts)

Elevation & radius
- `--elevation-0..3` (shadow presets)
- `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`

Spacing & grid
- `--space-1..8` (4px base scale)
- `--container-max` (responsive shell width)

Typography
- `--font-sans`, `--font-mono`
- `--text-xs..3xl` (step scale)
- `--line-compact`, `--line-normal`

## Theme Definitions
Premium Dark (default)
- Background: #0B0F13
- Surface: #121821
- Overlay: rgba(8, 12, 16, 0.75) (backdrop blur)
- Text: #E6EBF0, Muted: #98A2B3
- Primary (teal): #44D1A6 (AA on surfaces)
- Border: #202A36
- Chart palette: teal, cyan, violet, amber, rose, emerald

Premium Light
- Background: #F7FAFC
- Surface: #FFFFFF
- Overlay: rgba(0,0,0,0.4)
- Text: #0A1015, Muted: #4A5568
- Primary (teal): #2BBF95 (AA on white)
- Border: #E2E8F0
- Chart palette mirrored for light backgrounds

Legacy Themes
- Keep playful themes in `src/styles/themes/legacy/*` as non-default; do not remove.

## File Layout
- `src/styles/theme.css` — tokens + theme scopes (root variables only)
- `src/styles/theme.ts` — helper exports for token names, semantic aliases
- `src/app/providers/ThemeProvider.tsx` — state & context provider
- `src/components/ui/ThemeToggle.tsx` — user-facing switch (cmd/ctrl+k palette optional)

## ThemeProvider Contract (for Sonnet)
- Detect system scheme via `window.matchMedia('(prefers-color-scheme: dark)')`
- Local persistence key: `cortiware.theme = "premium-dark" | "premium-light" | "system"`
- SSR-safe hydration: render body with `data-theme` from server hint; fix no-FoUC via inline script
- API shape:
  - `useTheme(): { theme: "premium-dark"|"premium-light"|"system", setTheme(t) }`
  - Provider mounts at app root in `src/app/layout.tsx`

## Accessibility Targets
- Text contrast ≥ 4.5:1 for body, ≥ 3:1 for large text and UI chrome
- Focus states visible for all interactive elements (outline or bg change)
- Motion-reduced variants for any animations (respect `prefers-reduced-motion`)

## Component Guidelines
- Buttons: size scale (sm, md, lg), variants (primary, outline, ghost, destructive)
- Cards: use `--color-surface`, `--elevation-1`, `--radius-lg`; avoid pure white boxes on light
- Tables: sticky header, zebra muted rows, focusable rows; virtualize if >1000 rows
- Forms: label + description + error; 44px min touch targets
- Charts: use `--color-chart-*`; never hardcode hex in component code

## Recharts Integration
- Define shared palette in `theme.css` and read via CSS variables or CSS-in-JS (fallback)
- Axis/label text uses `--color-text-muted`; grid lines use `--color-border`

## Example (non-binding excerpt)
```css
:root {
  --color-primary: #44D1A6;
  --elevation-1: 0 4px 16px rgba(0,0,0,0.25);
}
.theme-premium-dark {
  --color-bg: #0B0F13;
  --color-surface: #121821;
  --color-text: #E6EBF0;
}
```

## Success Gates (Phase 1)
- Typecheck: 0 errors
- Lighthouse (local): ≥ 90 Performance, ≥ 95 Accessibility on dashboard + home
- Visual snapshots saved to `ops/reports/theme/` (dark + light)

## Non-Goals
- Do not remove legacy themes; do not mix token names and Tailwind config at random
- Avoid brand color hardcoding in component files

