const servicesCache = new Map();
const MAX_CACHE_ENTRIES = 10;

function normalizeToken(deviceToken) {
  if (typeof deviceToken !== "string") return "";
  return deviceToken.trim();
}

export function getServicesCache(deviceToken) {
  const key = normalizeToken(deviceToken);
  if (!key) return null;

  const value = servicesCache.get(key);
  if (value === undefined) return null;

  // Refresh LRU order on read
  servicesCache.delete(key);
  servicesCache.set(key, value);
  return value;
}

export function setServicesCache(deviceToken, data) {
  const key = normalizeToken(deviceToken);
  if (!key) return;

  if (servicesCache.has(key)) {
    servicesCache.delete(key);
  } else if (servicesCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = servicesCache.keys().next().value;
    servicesCache.delete(oldestKey);
  }

  servicesCache.set(key, data);
}

export function clearServicesCache(deviceToken) {
  const key = normalizeToken(deviceToken);
  if (key) {
    servicesCache.delete(key);
  } else {
    servicesCache.clear();
  }
}