export const ENV = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV !== 'production',
  isStaging: process.env.VERCEL_ENV === 'preview',
  isProduction: process.env.NODE_ENV === 'production',
  allowDevUsers: process.env.DISABLE_DEV_USERS !== 'true',
};

export function getEnvironmentStatus() {
  return {
    nodeEnv: ENV.nodeEnv,
    isDevelopment: ENV.isDevelopment,
    isStaging: ENV.isStaging,
    isProduction: ENV.isProduction,
    allowDevUsers: ENV.allowDevUsers,
  };
}

export function validateEnvironment() {
  const warnings: string[] = [];
  if (!process.env.DATABASE_URL) warnings.push('DATABASE_URL is not set');
  if (!process.env.SESSION_SECRET) warnings.push('SESSION_SECRET is not set');
  return { valid: warnings.length === 0, warnings };
}

