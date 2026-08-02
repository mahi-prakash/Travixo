// ⚡ Cache Engine: Stores Google Places & Unsplash results in browser memory and sessionStorage!
// This eliminates repetitive API calls and speeds up tab/filter switching without touching the backend DB.

const nearbyPlacesCache = {};

export const getCachedNearby = (key) => {
  if (nearbyPlacesCache[key]) return nearbyPlacesCache[key];
  try {
    const cached = sessionStorage.getItem(key);
    if (cached) {
      const parsed = JSON.parse(cached);
      nearbyPlacesCache[key] = parsed;
      return parsed;
    }
  } catch (e) {
    // ignore storage error
  }
  return null;
};

export const setCachedNearby = (key, data) => {
  nearbyPlacesCache[key] = data;
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    // ignore storage error
  }
};
