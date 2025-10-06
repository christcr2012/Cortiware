export const metadata = {
  title: 'Cortiware App',
  description: 'Tenant application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

