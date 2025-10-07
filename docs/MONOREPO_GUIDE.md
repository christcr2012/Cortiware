# Cortiware Monorepo Guide

## Overview

Cortiware is a Turborepo-based monorepo containing multiple Next.js applications and shared packages. This guide explains the structure, conventions, and best practices for working in this monorepo.

## Structure

```
cortiware/
├── apps/
│   ├── provider-portal/      # Provider admin dashboard
│   ├── tenant-app/            # Tenant application
│   ├── marketing-robinson/    # Marketing site (Robinson)
│   └── marketing-cortiware/   # Marketing site (Cortiware)
├── packages/
│   ├── auth-service/          # Shared authentication utilities
│   ├── themes/                # Shared theme system (CSS + metadata)
│   ├── db/                    # Shared Prisma client singleton
│   └── kv/                    # Shared KV/Redis utilities (future)
├── docs/                      # Documentation
├── ops/                       # Operations and deployment
└── turbo.json                 # Turborepo configuration
```

## Key Principles

### 1. Shared Packages First

**Always prefer shared packages over duplication.**

❌ **Bad**: Copying CSS or utilities into each app
```typescript
// apps/provider-portal/src/lib/theme.ts
export const themes = { ... }; // Duplicated

// apps/tenant-app/src/lib/theme.ts
export const themes = { ... }; // Duplicated
```

✅ **Good**: Single source of truth in shared package
```typescript
// packages/themes/src/theme-registry.ts
export const THEME_REGISTRY = { ... }; // Single source

// apps/provider-portal/src/lib/theme.ts
export { THEME_REGISTRY } from '@cortiware/themes'; // Re-export

// apps/tenant-app/src/lib/theme.ts
export { THEME_REGISTRY } from '@cortiware/themes'; // Re-export
```

### 2. CSS Sharing via @import

**Import shared CSS from packages, don't duplicate.**

```css
/* apps/provider-portal/src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Import shared theme system */
@import '@cortiware/themes/src/themes.css';
```

```css
/* apps/tenant-app/src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Import shared theme system */
@import '@cortiware/themes/src/themes.css';
```

### 3. Workspace Dependencies

**Use `file:` protocol for local packages.**

```json
{
  "dependencies": {
    "@cortiware/auth-service": "file:../../packages/auth-service",
    "@cortiware/themes": "file:../../packages/themes",
    "@cortiware/db": "file:../../packages/db"
  }
}
```

### 4. Transpile Packages in Next.js

**Always add shared packages to `transpilePackages`.**

```javascript
// apps/*/next.config.js
const nextConfig = {
  transpilePackages: [
    '@cortiware/auth-service',
    '@cortiware/themes',
    '@cortiware/db'
  ],
};
```

## Shared Packages

### @cortiware/themes

**Purpose**: Centralized theme system with CSS and metadata.

**Contents**:
- `src/themes.css` - All theme CSS variables and component classes
- `src/theme-registry.ts` - Theme metadata (27 themes across 9 categories)
- `src/theme-utils.ts` - Client-side utilities (getTheme, setTheme, etc.)
- `src/index.ts` - Public API exports

**Usage**:
```typescript
import { getAllThemes, getTheme, setTheme } from '@cortiware/themes';

// Get all themes
const themes = getAllThemes();

// Get current theme
const currentTheme = getTheme('admin'); // or 'client'

// Set theme
setTheme('admin', 'futuristic-green');
```

**CSS Classes**:
- `.premium-card` - Glass morphism card
- `.input-field` - Themed input
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button

**CSS Variables**:
- `--bg-main`, `--bg-primary`, `--bg-secondary`
- `--text-primary`, `--text-secondary`, `--text-tertiary`
- `--brand-primary`, `--brand-secondary`
- `--accent-success`, `--accent-error`, `--accent-warning`
- `--border-primary`, `--border-secondary`

### @cortiware/auth-service

**Purpose**: Shared authentication logic for all apps.

**Contents**:
- `src/authenticate.ts` - Authentication functions
- `src/ticket.ts` - SSO ticket issue/verify
- `src/cookie.ts` - Cookie helpers
- `src/totp.ts` - TOTP/2FA utilities
- `src/types.ts` - TypeScript types

**Usage**:
```typescript
import {
  authenticateDatabaseUser,
  authenticateEmergency,
  issueAuthTicket,
  verifyAuthTicket,
  buildCookieHeader,
} from '@cortiware/auth-service';

// Authenticate user
const result = await authenticateDatabaseUser(input, dbUser, config);

// Issue SSO ticket
const ticket = await issueAuthTicket(payload, secret);

// Verify ticket
const verified = await verifyAuthTicket(ticket, secret, audience, nonceStore);
```

### @cortiware/db

**Purpose**: Shared Prisma client singleton to avoid multiple instances.

**Contents**:
- `src/index.ts` - Prisma client singleton

**Usage**:
```typescript
import { prisma } from '@cortiware/db';

// Use Prisma client
const users = await prisma.user.findMany();
```

**Important**: Only `provider-portal` runs `prisma generate`. Other apps import the generated client via this package.

## Development Workflow

### Installing Dependencies

```bash
# Install all dependencies (root + all apps/packages)
npm install

# Install for specific app
npm install -w apps/provider-portal <package-name>

# Install for specific package
npm install -w packages/themes <package-name>
```

### Running Apps

```bash
# Run all apps in dev mode
npm run dev

# Run specific app
npm run dev -- --filter=provider-portal
npm run dev -- --filter=tenant-app

# Run multiple apps
npm run dev -- --filter=provider-portal --filter=tenant-app
```

### Building

```bash
# Build all apps
npm run build

# Build specific app
npm run build -- --filter=provider-portal

# Build with dependencies
npm run build -- --filter=provider-portal...
```

### Type Checking

```bash
# Type check all apps/packages
npm run typecheck

# Type check specific app
npm run typecheck -- --filter=provider-portal
```

### Testing

```bash
# Run all tests
npm test

# Run tests for specific package
npm test -- --filter=@cortiware/auth-service

# Watch mode
npm test -- --filter=@cortiware/auth-service -- --watch
```

## Common Tasks

### Adding a New Shared Package

1. **Create package directory**
   ```bash
   mkdir -p packages/my-package/src
   ```

2. **Create package.json**
   ```json
   {
     "name": "@cortiware/my-package",
     "version": "0.0.1",
     "private": true,
     "main": "src/index.ts",
     "types": "src/index.ts"
   }
   ```

3. **Add to apps' dependencies**
   ```json
   {
     "dependencies": {
       "@cortiware/my-package": "file:../../packages/my-package"
     }
   }
   ```

4. **Add to transpilePackages**
   ```javascript
   transpilePackages: ['@cortiware/my-package']
   ```

5. **Install dependencies**
   ```bash
   npm install
   ```

### Sharing CSS Between Apps

1. **Create CSS in shared package**
   ```css
   /* packages/themes/src/my-styles.css */
   .my-component {
     /* styles */
   }
   ```

2. **Import in app globals.css**
   ```css
   /* apps/*/src/styles/globals.css */
   @import '@cortiware/themes/src/my-styles.css';
   ```

### Sharing TypeScript Code

1. **Export from shared package**
   ```typescript
   // packages/my-package/src/index.ts
   export function myUtility() { ... }
   ```

2. **Import in app**
   ```typescript
   // apps/*/src/lib/my-file.ts
   import { myUtility } from '@cortiware/my-package';
   ```

## Troubleshooting

### Build Errors: "Cannot find module '@cortiware/...'"

**Solution**: Add package to `transpilePackages` in `next.config.js`

### Prisma Errors: "EPERM: operation not permitted"

**Solution**: Only `provider-portal` should run `prisma generate`. Remove from other apps' build scripts.

### CSS Not Loading

**Solution**: Ensure `@import` path is correct and package is in `transpilePackages`

### Type Errors After Adding Package

**Solution**: Restart TypeScript server in VS Code (Cmd/Ctrl + Shift + P → "Restart TS Server")

## Best Practices

1. **DRY (Don't Repeat Yourself)**
   - If code/CSS is used in 2+ apps, move it to a shared package

2. **Single Source of Truth**
   - Theme CSS: `packages/themes/src/themes.css`
   - Auth logic: `packages/auth-service/src/*`
   - Database client: `packages/db/src/index.ts`

3. **Explicit Dependencies**
   - Always declare dependencies in package.json
   - Never rely on hoisting from root node_modules

4. **Type Safety**
   - Export types from shared packages
   - Use TypeScript for all shared code

5. **Testing**
   - Test shared packages independently
   - Mock shared packages in app tests

## Resources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [npm Workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
- [Next.js transpilePackages](https://nextjs.org/docs/app/api-reference/next-config-js/transpilePackages)

