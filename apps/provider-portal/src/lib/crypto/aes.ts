export function encrypt(plaintext: string, _key: string): string {
  // Placeholder: DO NOT USE IN PRODUCTION
  return Buffer.from(plaintext, 'utf8').toString('base64');
}

export function decrypt(ciphertext: string, _key: string): string {
  try { return Buffer.from(ciphertext, 'base64').toString('utf8'); } catch { return ''; }
}

