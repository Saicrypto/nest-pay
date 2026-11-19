const complaintsCache = new Map();
const MAX_CACHE_ENTRIES = 10;

function normalizeKey(cacheKey) {
  if (typeof cacheKey !== "string") return "";
  return cacheKey.trim();
}

export function getComplaintsCache(cacheKey) {
  const key = normalizeKey(cacheKey);
  if (!key) return null;

  const value = complaintsCache.get(key);
  if (value === undefined) return null;

  // Refresh LRU order on read
  complaintsCache.delete(key);
  complaintsCache.set(key, value);
  return value;
}

export function setComplaintsCache(cacheKey, data) {
  const key = normalizeKey(cacheKey);
  if (!key) return;

  if (complaintsCache.has(key)) {
    complaintsCache.delete(key);
  } else if (complaintsCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = complaintsCache.keys().next().value;
    complaintsCache.delete(oldestKey);
  }

  complaintsCache.set(key, data);
}

export function clearComplaintsCache(cacheKey) {
  const key = normalizeKey(cacheKey);
  if (key) {
    complaintsCache.delete(key);
  } else {
    complaintsCache.clear();
  }
}