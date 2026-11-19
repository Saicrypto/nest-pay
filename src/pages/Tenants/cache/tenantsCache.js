const tenantsCache = new Map();
const MAX_CACHE_ENTRIES = 10;

export function getTenantsCache(userId) {
  if (!userId) return null;
  return tenantsCache.get(userId) ?? null;
}

export function setTenantsCache(userId, data) {
  if (!userId) return;

  if (tenantsCache.has(userId)) {
    tenantsCache.delete(userId);
  } else if (tenantsCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = tenantsCache.keys().next().value;
    tenantsCache.delete(oldestKey);
  }

  tenantsCache.set(userId, data);
}

export function clearTenantsCache(userId) {
  if (userId) {
    tenantsCache.delete(userId);
  } else {
    tenantsCache.clear();
  }
}