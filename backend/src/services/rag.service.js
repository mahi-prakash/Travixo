const logger = require('../utils/logger');
const { fetchGooglePlacesPool } = require('./places.service');

// ─── 1. Wikipedia Fetcher ────────────────────────────────────────────────────
const fetchWikipediaContext = async (destination) => {
  try {
    const cleanDest = destination.split(',')[0].trim();
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanDest)}`;
    const response = await fetch(url);
    if (!response.ok) return '';
    const data = await response.json();
    return data.extract ? `Wikipedia Summary: ${data.extract}` : '';
  } catch (error) {
    logger.error(`Wikipedia RAG Error: ${error.message}`);
    return '';
  }
};

// ─── 2. Weather Fetcher ──────────────────────────────────────────────────────
const fetchCoordinates = async (destination) => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`;
    const response = await fetch(url, { headers: { 'User-Agent': 'TravstoryApp/1.0' } });
    const data = await response.json();
    if (data && data.length > 0) {
      return { lat: data[0].lat, lng: data[0].lon };
    }
    return null;
  } catch (error) {
    return null;
  }
};

const fetchLiveWeather = async (destination) => {
  try {
    const coords = await fetchCoordinates(destination);
    if (!coords) return '';

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current_weather=true`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.current_weather) {
      const { temperature, windspeed } = data.current_weather;
      return `Current Weather: ${temperature}°C with wind speeds around ${windspeed}km/h.`;
    }
    return '';
  } catch (error) {
    logger.error(`Weather RAG Error: ${error.message}`);
    return '';
  }
};

// ─── 3. Reddit Hive-Mind Fetcher ─────────────────────────────────────────────
const fetchRedditTips = async (destination) => {
  try {
    const url = `https://www.reddit.com/search.json?q=travel+${encodeURIComponent(destination)}&limit=3`;
    const response = await fetch(url, { headers: { 'User-Agent': 'TravstoryApp/1.0 (by KIIT0001)' } });
    if (!response.ok) return '';
    
    const data = await response.json();
    const posts = data.data?.children || [];
    
    if (posts.length > 0) {
      const tips = posts.map(post => `- "${post.data.title}"`).join('\n');
      return `Local Reddit Discussions:\n${tips}`;
    }
    return '';
  } catch (error) {
    logger.error(`Reddit RAG Error: ${error.message}`);
    return '';
  }
};

// ─── 4. OSRM Distance Fetcher ─────────────────────────────────────────────
const fetchDistanceContext = async (arrivalStation, hotelAddress) => {
  if (!arrivalStation || !hotelAddress || arrivalStation === 'Unknown' || hotelAddress === 'Unknown') return '';
  
  try {
    // 1. Get coords for both
    const stationCoords = await fetchCoordinates(arrivalStation);
    const hotelCoords = await fetchCoordinates(hotelAddress);
    
    if (!stationCoords || !hotelCoords) return '';
    
    // 2. Hit OSRM
    const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${stationCoords.lng},${stationCoords.lat};${hotelCoords.lng},${hotelCoords.lat}?overview=false`;
    const response = await fetch(osrmUrl);
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      const distanceKm = (data.routes[0].distance / 1000).toFixed(1);
      const durationMin = Math.round(data.routes[0].duration / 60);
      return `Logistics: The travel distance from ${arrivalStation} to ${hotelAddress} is exactly ${distanceKm} km, which typically takes ${durationMin} minutes by car. Plan check-in times accordingly.`;
    }
    return '';
  } catch (error) {
    logger.error(`Distance RAG Error: ${error.message}`);
    return '';
  }
};

// ─── Master Aggregator ───────────────────────────────────────────────────────
/**
 * Fetches all contextual data concurrently using Promise.allSettled.
 * This guarantees the API doesn't crash even if Reddit or Weather goes down.
 */
const fetchFullDestinationContext = async (destination, origin, arrivalStation, hotelAddress) => {
  if (!destination || destination === 'Unknown') return '';

  logger.info(`⚡ RAG: Initiating multi-source fetch for "${destination}"`);

  // Run all fetches at the exact same time
  const results = await Promise.allSettled([
    fetchWikipediaContext(destination),
    fetchLiveWeather(destination),
    fetchRedditTips(destination),
    fetchDistanceContext(arrivalStation, hotelAddress),
    fetchGooglePlacesPool(destination)
  ]);

  // Extract successful strings and filter out empties
  const contextBlocks = results
    .filter(res => res.status === 'fulfilled' && res.value !== '')
    .map(res => res.value);

  if (contextBlocks.length === 0) {
    logger.warn(`⚠️ RAG: No context could be found for "${destination}"`);
    return '';
  }

  logger.info(`✅ RAG: Successfully aggregated ${contextBlocks.length} data sources for "${destination}"`);
  
  // Combine all strings into one giant context block
  return contextBlocks.join('\n\n');
};

module.exports = {
  fetchFullDestinationContext
};
