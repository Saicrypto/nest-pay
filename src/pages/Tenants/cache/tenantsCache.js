
let tenantsCache = null;

export function getTenantsCache() {
  return tenantsCache;
}

export function setTenantsCache(data) {
  tenantsCache = data;
}

export function clearTenantsCache() {
  tenantsCache = null;
}
