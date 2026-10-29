
const propertyDetailsCache = new Map();

export function getPropertyDetailsCache(propertyId) {
  return propertyDetailsCache.get(propertyId) ?? null;
}

export function setPropertyDetailsCache(propertyId, data) {
  propertyDetailsCache.set(propertyId, data);
}

export function clearPropertyDetailsCache(propertyId) {
  if (propertyId) {
    propertyDetailsCache.delete(propertyId);
  } else {
    propertyDetailsCache.clear();
  }
}
