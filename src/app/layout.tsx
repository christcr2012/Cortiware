import type { Metadata } from 'next';
import '../styles/globals.css';
import { ThemeProvider } from './providers/ThemeProvider';

export const metadata: Metadata = {
  title: 'Cortiware - Workflow Management Platform',
  description: 'Multi-tenant workflow management with CRM, Fleet, and Provider Portal',
};

/**
 * Root Layout for App Router
 * Minimal wrapper - authentication and navigation handled per route group
 * Theme system: premium-dark (default) and premium-light with system preference detection
 */
import { cookies } from 'next/headers';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const adminTheme = cookieStore.get('rs_admin_theme')?.value;
  const clientTheme = cookieStore.get('rs_client_theme')?.value;
  // Default to premium-dark for SSR; client-side ThemeProvider will handle system preference
  const theme = adminTheme || clientTheme || 'premium-dark';

  return (
    <html lang="en" data-theme={theme} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('cortiware.theme');
                  const theme = stored === 'system'
                    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'premium-dark' : 'premium-light')
                    : (stored || 'premium-dark');
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

