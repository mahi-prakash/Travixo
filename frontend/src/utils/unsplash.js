const ACCESS_KEYS = [
  import.meta.env.VITE_UNSPLASH_ACCESS_KEY,
  import.meta.env.VITE_UNSPLASH_ACCESS_KEY_1,
  import.meta.env.VITE_UNSPLASH_ACCESS_KEY_2,
  import.meta.env.VITE_UNSPLASH_ACCESS_KEY_3,
  import.meta.env.VITE_UNSPLASH_ACCESS_KEY_4,
  import.meta.env.VITE_UNSPLASH_ACCESS_KEY_5,
  import.meta.env.VITE_UNSPLASH_ACCESS_KEY_6,
  import.meta.env.VITE_UNSPLASH_ACCESS_KEY_7,
  import.meta.env.VITE_UNSPLASH_ACCESS_KEY_8,
  import.meta.env.VITE_UNSPLASH_ACCESS_KEY_9,
  import.meta.env.VITE_UNSPLASH_ACCESS_KEY_10,
  import.meta.env.VITE_UNSPLASH_ACCESS_KEY_11,
  import.meta.env.VITE_UNSPLASH_ACCESS_KEY_12,
].filter(key => key && key.trim() !== "");

let currentKeyIndex = 0;

export const fetchPhoto = async (query) => {
  if (ACCESS_KEYS.length === 0) {
    console.error("Unsplash: No API keys found in .env");
    return null;
  }

  // Try all available keys starting from the current index
  for (let i = 0; i < ACCESS_KEYS.length; i++) {
    const keyIndex = (currentKeyIndex + i) % ACCESS_KEYS.length;
    const activeKey = ACCESS_KEYS[keyIndex];

    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
        {
          headers: {
            Authorization: `Client-ID ${activeKey}`,
          },
        }
      );

      if (res.ok) {
        // Move index to the next key for the next global call to distribute load
        currentKeyIndex = (keyIndex + 1) % ACCESS_KEYS.length;
        const data = await res.json();
        return data.results?.[0]?.urls?.small || null;
      }

      if (res.status === 403 || res.status === 429) {
        console.warn(`Unsplash: Key ${keyIndex + 1} rate limited, trying next...`);
        continue; // Try next key
      }

      // If other error, just return null
      return null;
    } catch (error) {
      console.error(`Unsplash fetch failed with key ${keyIndex + 1}:`, error.message);
    }
  }

  console.error("Unsplash: All keys exhausted or failed.");
  return null;
};