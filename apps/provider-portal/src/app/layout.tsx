import { cookies } from 'next/headers';
import '../styles/theme.css';

/**
 * Root Layout for Provider Portal
 * Applies theme from cookie and includes theme CSS
 */
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const adminTheme = cookieStore.get('rs_admin_theme')?.value || 'futuristic-green';

  return (
    <html lang="en" data-theme={adminTheme}>
      <body>{children}</body>
    </html>
  );
}

