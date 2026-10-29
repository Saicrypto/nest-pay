
const tenantDetailsCache = new Map();

export function getTenantDetailsCache(tenantId) {
  return tenantDetailsCache.get(tenantId) ?? null;
}

export function setTenantDetailsCache(tenantId, data) {
  tenantDetailsCache.set(tenantId, data);
}

export function clearTenantDetailsCache(tenantId) {
  if (tenantId) {
    tenantDetailsCache.delete(tenantId);
  } else {
    tenantDetailsCache.clear();
  }
}
