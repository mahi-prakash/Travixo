const GOOGLE_MAPS_KEYS = [
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY_1,
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY_2,
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY_3,
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY_4,
].filter(key => key && key.trim() !== "");

// We pick one key per session to ensure consistency and avoid multiple script loads
// with different keys which can lead to Google Maps errors.
const getSessionKey = () => {
  if (GOOGLE_MAPS_KEYS.length === 0) return "";

  // Use sessionStorage to keep the same key for the entire session 
  // but potentially different across different tabs/sessions
  const sessionKey = sessionStorage.getItem('SELECTED_GOOGLE_MAPS_API_KEY');
  if (sessionKey && GOOGLE_MAPS_KEYS.includes(sessionKey)) {
    return sessionKey;
  }

  const randomIndex = Math.floor(Math.random() * GOOGLE_MAPS_KEYS.length);
  const pickedKey = GOOGLE_MAPS_KEYS[randomIndex];
  sessionStorage.setItem('SELECTED_GOOGLE_MAPS_API_KEY', pickedKey);
  return pickedKey;
};

export const GOOGLE_MAPS_API_KEY = getSessionKey();
