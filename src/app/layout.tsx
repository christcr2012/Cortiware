import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Cortiware - Workflow Management Platform',
  description: 'Multi-tenant workflow management with CRM, Fleet, and Provider Portal',
};

/**
 * Root Layout for App Router
 * Minimal wrapper - authentication and navigation handled per route group
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
  const theme = adminTheme || clientTheme || 'futuristic-green';

  // Debug logging (remove in production)
  console.log('[RootLayout] Theme cookies:', { adminTheme, clientTheme, finalTheme: theme });

  return (
    <html lang="en" data-theme={theme} suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

