let propertiesCache = {
  userId: null,
  data: null,
};

export function getPropertiesCache(userId) {
  if (!userId || propertiesCache.userId !== userId) {
    return null;
  }
  return propertiesCache.data;
}

export function setPropertiesCache(userId, data) {
  if (!userId) return;
  propertiesCache = { userId, data };
}

export function clearPropertiesCache() {
  propertiesCache = { userId: null, data: null };
}