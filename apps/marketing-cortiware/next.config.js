/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/app/:path*',
        destination: process.env.TENANT_APP_URL 
          ? `${process.env.TENANT_APP_URL}/:path*`
          : 'http://localhost:3003/:path*', // Local dev fallback
      },
    ];
  },
};

module.exports = nextConfig;

