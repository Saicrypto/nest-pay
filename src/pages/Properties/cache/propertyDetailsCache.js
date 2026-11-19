const propertyDetailsCache = new Map();
const MAX_CACHE_ENTRIES = 50;

function makeKey(userId, propertyId) {
  if (!userId || !propertyId) return null;
  return `${userId}:${propertyId}`;
}

export function getPropertyDetailsCache(userId, propertyId) {
  const key = makeKey(userId, propertyId);
  if (!key) return null;
  return propertyDetailsCache.get(key) ?? null;
}

export function setPropertyDetailsCache(userId, propertyId, data) {
  const key = makeKey(userId, propertyId);
  if (!key) return;

  if (propertyDetailsCache.has(key)) {
    propertyDetailsCache.delete(key);
  } else if (propertyDetailsCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = propertyDetailsCache.keys().next().value;
    propertyDetailsCache.delete(oldestKey);
  }

  propertyDetailsCache.set(key, data);
}

export function clearPropertyDetailsCache(userId, propertyId) {
  if (userId && propertyId) {
    propertyDetailsCache.delete(makeKey(userId, propertyId));
  } else if (userId) {
    const prefix = `${userId}:`;
    for (const key of propertyDetailsCache.keys()) {
      if (key.startsWith(prefix)) {
        propertyDetailsCache.delete(key);
      }
    }
  } else {
    propertyDetailsCache.clear();
  }
}