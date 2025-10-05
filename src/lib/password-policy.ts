export const DEFAULT_PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSymbol: false,
};

export function getPasswordRequirements() {
  return [
    `At least ${DEFAULT_PASSWORD_POLICY.minLength} characters`,
    DEFAULT_PASSWORD_POLICY.requireUppercase ? 'One uppercase letter' : null,
    DEFAULT_PASSWORD_POLICY.requireLowercase ? 'One lowercase letter' : null,
    DEFAULT_PASSWORD_POLICY.requireNumber ? 'One number' : null,
    DEFAULT_PASSWORD_POLICY.requireSymbol ? 'One symbol' : null,
  ].filter(Boolean);
}

export function validatePasswordPolicy(password: string) {
  const errors: string[] = [];
  if (password.length < DEFAULT_PASSWORD_POLICY.minLength) errors.push('Password too short');
  if (DEFAULT_PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) errors.push('Missing uppercase');
  if (DEFAULT_PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) errors.push('Missing lowercase');
  if (DEFAULT_PASSWORD_POLICY.requireNumber && !/[0-9]/.test(password)) errors.push('Missing number');
  if (DEFAULT_PASSWORD_POLICY.requireSymbol && !/[^A-Za-z0-9]/.test(password)) errors.push('Missing symbol');

  const score = Math.max(0, 100 - errors.length * 20);
  const strength = score >= 80 ? 'strong' : score >= 60 ? 'medium' : 'weak';
  return { isValid: errors.length === 0, errors, strength, score };
}

