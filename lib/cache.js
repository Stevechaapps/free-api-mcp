const cache = new Map();
const MAX_CACHE_SIZE = 1000;

export function get(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

export function set(key, value, ttlMs = 60000) {
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs
  });
}

export function clear() {
  cache.clear();
}
