
const servicesCache = new Map();

export function getServicesCache(deviceToken) {
  return servicesCache.get(deviceToken) ?? null;
}

export function setServicesCache(deviceToken, data) {
  if (!deviceToken) return;
  servicesCache.set(deviceToken, data);
}

export function clearServicesCache(deviceToken) {
  if (deviceToken) {
    servicesCache.delete(deviceToken);
  } else {
    servicesCache.clear();
  }
}
