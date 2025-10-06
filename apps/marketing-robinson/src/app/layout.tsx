export const metadata = {
  title: 'Robinson AI Systems',
  description: 'Enterprise AI solutions',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

