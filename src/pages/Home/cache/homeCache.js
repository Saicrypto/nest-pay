let homeCache = {
  userId: null,
  data: null,
};

export function getHomeCache(userId) {
  if (!userId || homeCache.userId !== userId) {
    return null;
  }
  return homeCache.data;
}

export function setHomeCache(userId, data) {
  if (!userId) return;
  homeCache = { userId, data };
}

export function clearHomeCache() {
  homeCache = { userId: null, data: null };
}