/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/portal/:path*',
        destination: process.env.PROVIDER_PORTAL_URL
          ? `${process.env.PROVIDER_PORTAL_URL}/:path*`
          : 'http://localhost:3000/:path*', // Local dev fallback
      },
    ];
  },
};

module.exports = nextConfig;
