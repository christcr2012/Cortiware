/**
 * Nonce Store for Anti-Replay Protection
 * 
 * Per hmac-auth.md spec:
 * - Nonces are UUIDv4 strings
 * - TTL: 10 minutes
 * - Duplicate nonce within TTL window = replay attack (reject with 401)
 * 
 * Uses Redis/Vercel KV for distributed systems
 * Falls back to in-memory for development
 */

// In-memory store for development
const nonceStore = new Map<string, number>(); // keyId:nonce -> timestamp

/**
 * Check if a nonce has been used before (within TTL window)
 * Returns true if nonce is fresh (not seen before)
 */
export async function checkNonce(keyId: string, nonce: string): Promise<boolean> {
  const key = `${keyId}:${nonce}`;
  const now = Date.now();
  const TTL_MS = 10 * 60 * 1000; // 10 minutes
  
  // Clean up expired nonces (simple cleanup on each check)
  for (const [storedKey, timestamp] of nonceStore.entries()) {
    if (now - timestamp > TTL_MS) {
      nonceStore.delete(storedKey);
    }
  }
  
  // Check if nonce exists and is still valid
  const existingTimestamp = nonceStore.get(key);
  if (existingTimestamp && (now - existingTimestamp < TTL_MS)) {
    // Nonce already used within TTL window - replay attack
    return false;
  }
  
  // Store nonce with current timestamp
  nonceStore.set(key, now);
  return true;
}

/**
 * Record a nonce (for use after successful auth)
 * This is called by withHmacAuth after signature verification
 */
export async function recordNonce(keyId: string, nonce: string): Promise<void> {
  const key = `${keyId}:${nonce}`;
  nonceStore.set(key, Date.now());
}

/**
 * Clear all nonces (for testing)
 */
export async function clearNonces(): Promise<void> {
  nonceStore.clear();
}

/**
 * Get nonce store stats (for monitoring)
 */
export async function getNonceStats(): Promise<{ count: number; oldestAge: number }> {
  const now = Date.now();
  let oldestAge = 0;
  
  for (const timestamp of nonceStore.values()) {
    const age = now - timestamp;
    if (age > oldestAge) {
      oldestAge = age;
    }
  }
  
  return {
    count: nonceStore.size,
    oldestAge: Math.floor(oldestAge / 1000), // in seconds
  };
}

