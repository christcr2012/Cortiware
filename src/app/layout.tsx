import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'StreamFlow - Workflow Management Platform',
  description: 'Multi-tenant workflow management with CRM, Fleet, and Provider Portal',
};

/**
 * Root Layout for App Router
 * Minimal wrapper - authentication and navigation handled per route group
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

