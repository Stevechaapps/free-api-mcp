const cache = new Map();

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
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs
  });
}

export function clear() {
  cache.clear();
}
