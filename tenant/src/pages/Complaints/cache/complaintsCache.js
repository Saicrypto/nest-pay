let complaintsCache = null;

export function getComplaintsCache() {
  return complaintsCache;
}

export function setComplaintsCache(data) {
  complaintsCache = data;
}

export function clearComplaintsCache() {
  complaintsCache = null;
}