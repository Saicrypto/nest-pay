let servicesCache = null;

export function getServicesCache() {
  return servicesCache;
}

export function setServicesCache(data) {
  servicesCache = data;
}

export function clearServicesCache() {
  servicesCache = null;
}