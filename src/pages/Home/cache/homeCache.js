
let homeCache = null;

export function getHomeCache() {
  return homeCache;
}

export function setHomeCache(data) {
  homeCache = data;
}

export function clearHomeCache() {
  homeCache = null;
}
