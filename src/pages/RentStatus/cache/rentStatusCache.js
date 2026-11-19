const rentStatusCache = new Map();
const MAX_CACHE_ENTRIES = 10;

export function getRentStatusCache(userId) {
  if (!userId) return null;
  return rentStatusCache.get(userId) ?? null;
}

export function setRentStatusCache(userId, data) {
  if (!userId) return;

  if (rentStatusCache.has(userId)) {
    rentStatusCache.delete(userId);
  } else if (rentStatusCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = rentStatusCache.keys().next().value;
    rentStatusCache.delete(oldestKey);
  }

  rentStatusCache.set(userId, data);
}

export function clearRentStatusCache(userId) {
  if (userId) {
    rentStatusCache.delete(userId);
  } else {
    rentStatusCache.clear();
  }
}