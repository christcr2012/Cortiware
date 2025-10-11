const { PrismaPlugin } = require('@prisma/nextjs-monorepo-workaround-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: require('path').join(__dirname, '../../'),
  transpilePackages: ['@cortiware/auth-service', '@cortiware/themes', '@cortiware/db'],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }
    return config;
  },
};

module.exports = nextConfig;

