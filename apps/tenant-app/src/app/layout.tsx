import { DirectAccessBanner } from '@/components/DirectAccessBanner';
import { getAuthContext } from '@/lib/auth-context';

export const metadata = {
  title: 'Cortiware App',
  description: 'Tenant application',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const authContext = await getAuthContext();

  return (
    <html lang="en">
      <body>
        {authContext.isDirectAccess && authContext.role && authContext.email && (
          <DirectAccessBanner
            role={authContext.role as 'provider' | 'developer'}
            email={authContext.email}
          />
        )}
        {children}
      </body>
    </html>
  );
}

