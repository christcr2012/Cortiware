// Simple in-memory idempotency store
// TODO: Upgrade to Redis/Upstash or Postgres table for production

import crypto from 'crypto';

type IdempotencyEntry = {
  requestHash: string;
  response: {
    status: number;
    body: any;
  };
  expiresAt: number;
};

const store = new Map<string, IdempotencyEntry>();

// Cleanup expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.expiresAt < now) {
      store.delete(key);
    }
  }
}, 10 * 60 * 1000);

function hashRequest(body: string): string {
  return crypto.createHash('sha256').update(body).digest('hex');
}

export async function checkIdempotency(
  key: string,
  requestBody: string
): Promise<{ replay: false } | { replay: true; response: { status: number; body: any } } | { conflict: true }> {
  const entry = store.get(key);
  const requestHash = hashRequest(requestBody);

  if (!entry) {
    // First time seeing this key
    return { replay: false };
  }

  const now = Date.now();
  if (entry.expiresAt < now) {
    // Expired entry, treat as new
    store.delete(key);
    return { replay: false };
  }

  if (entry.requestHash === requestHash) {
    // Same request body, replay response
    return { replay: true, response: entry.response };
  }

  // Different request body with same key = conflict
  return { conflict: true };
}

export async function recordIdempotency(
  key: string,
  requestBody: string,
  response: { status: number; body: any }
): Promise<void> {
  const ttlMinutes = parseInt(process.env.IDEMPOTENCY_TTL_MINUTES || '1440', 10);
  const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
  const requestHash = hashRequest(requestBody);

  store.set(key, {
    requestHash,
    response,
    expiresAt,
  });
}

