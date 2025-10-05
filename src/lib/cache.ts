type CacheEntry<T> = { value: T; expiresAt: number };

const store = new Map<string, CacheEntry<any>>();

export function setCache<T>(key: string, value: T, ttlMs = 60_000) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function getCache<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { store.delete(key); return null; }
  return entry.value as T;
}

export function clearCache(key?: string) {
  if (key) store.delete(key); else store.clear();
}

