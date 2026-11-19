const tenantDetailsCache = new Map();
const MAX_CACHE_ENTRIES = 50;

function makeKey(userId, tenantId) {
  return `${userId}:${tenantId}`;
}

export function getTenantDetailsCache(userId, tenantId) {
  if (!userId || !tenantId) return null;

  const key = makeKey(userId, tenantId);
  const value = tenantDetailsCache.get(key);
  if (value === undefined) return null;

  // Refresh LRU order on read
  tenantDetailsCache.delete(key);
  tenantDetailsCache.set(key, value);
  return value;
}

export function setTenantDetailsCache(userId, tenantId, data) {
  if (!userId || !tenantId) return;

  const key = makeKey(userId, tenantId);

  if (tenantDetailsCache.has(key)) {
    tenantDetailsCache.delete(key);
  } else if (tenantDetailsCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = tenantDetailsCache.keys().next().value;
    tenantDetailsCache.delete(oldestKey);
  }

  tenantDetailsCache.set(key, data);
}

export function clearTenantDetailsCache(tenantId, userId) {
  if (userId && tenantId) {
    tenantDetailsCache.delete(makeKey(userId, tenantId));
    return;
  }

  if (tenantId) {
    const suffix = `:${tenantId}`;
    for (const key of tenantDetailsCache.keys()) {
      if (key.endsWith(suffix)) {
        tenantDetailsCache.delete(key);
      }
    }
    return;
  }

  if (userId) {
    const prefix = `${userId}:`;
    for (const key of tenantDetailsCache.keys()) {
      if (key.startsWith(prefix)) {
        tenantDetailsCache.delete(key);
      }
    }
    return;
  }

  tenantDetailsCache.clear();
}