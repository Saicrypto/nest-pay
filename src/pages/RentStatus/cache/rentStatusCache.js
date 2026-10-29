let rentStatusCache = null;

export function getRentStatusCache() {
  return rentStatusCache;
}

export function setRentStatusCache(data) {
  rentStatusCache = data;
}

export function clearRentStatusCache() {
  rentStatusCache = null;
}