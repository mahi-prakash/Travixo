import { useState, useEffect, useMemo } from 'react';
import { fetchPhoto } from '../../../utils/unsplash';
import { getCachedNearby, setCachedNearby } from '../utils/plannerCache';

export function useNearbyPlaces({
  map,
  mapMarkers,
  destinationCoords,
  baseCampHotel,
  activeTrip,
  activeItinerary,
  aiSourceForCheck,
  activeTripId,
  placePool
}) {
  const [activeTab, setActiveTab] = useState("popular");
  const [livePopularPlaces, setLivePopularPlaces] = useState([]);
  const [isLoadingPopular, setIsLoadingPopular] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);

  // 🌍 Dynamic Nearby Places from AI & Step 1 Must-Visit Selections
  const aiSourceForNearby = activeTrip?.ai_itinerary || aiSourceForCheck || {};
  const rawAiNearby = activeItinerary?.nearby_places || aiSourceForNearby?.nearby_places || [];

  // 🎯 Immediately inject spots clicked by the user during Step 1 / Onboarding
  const stepOnePicks = useMemo(() => {
    let spots = activeTrip?.must_visit || activeTrip?.mustVisitPlaces || activeItinerary?.must_visit || [];
    if (!spots.length) {
      try {
        const fromSession = JSON.parse(sessionStorage.getItem('STEP_ONE_MUST_VISIT') || '[]');
        if (Array.isArray(fromSession) && fromSession.length) spots = fromSession;
      } catch (e) {
        // ignore
      }
    }
    return spots.map((spot, idx) => {
      if (typeof spot === 'object' && spot !== null) return spot;
      return {
        id: `step1-pick-${idx}-${spot}`,
        title: spot,
        name: spot,
        category: "STEP 1 PICK 📌",
        rating: "5.0",
        desc: `A popular must-visit attraction you explicitly selected during Step 1!`,
        img: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=600&auto=format&fit=crop",
        isStepOnePick: true
      };
    });
  }, [activeTrip, activeItinerary]);

  const aiNearbyPlaces = useMemo(() => {
    const list = [...stepOnePicks, ...rawAiNearby];
    const seen = new Set();
    return list.filter(item => {
      const nameKey = (item?.name || item?.title || "").toLowerCase().trim();
      if (!nameKey || seen.has(nameKey)) return false;
      seen.add(nameKey);
      return true;
    });
  }, [stepOnePicks, rawAiNearby]);

  const searchLat = (mapMarkers || [])[0]?.pos?.[0] || destinationCoords?.lat || baseCampHotel?.lat || map?.getCenter()?.lat() || null;
  const searchLng = (mapMarkers || [])[0]?.pos?.[1] || destinationCoords?.lng || baseCampHotel?.lng || map?.getCenter()?.lng() || null;

  useEffect(() => {
    if (activeTab !== "popular" || !map || !window.google?.maps?.places) {
      return;
    }

    let isMounted = true;

    // ⚡ 1. CHECK CACHE FIRST: Zero API calls if already fetched in this session!
    const cacheKey = `popular_spots_${activeTripId || 'default'}`;
    const cachedData = getCachedNearby(cacheKey);
    if (cachedData && Array.isArray(cachedData)) {
      setLivePopularPlaces(cachedData);
      setIsLoadingPopular(false);
      return;
    }

    setIsLoadingPopular(true);
    const service = new window.google.maps.places.PlacesService(map);

    let searchCenter = null;
    if (searchLat && searchLng) {
      searchCenter = { lat: Number(searchLat), lng: Number(searchLng) };
    } else if (map.getCenter()) {
      searchCenter = map.getCenter();
    }

    if (!searchCenter) {
      setIsLoadingPopular(false);
      return;
    }

    const categoriesToFetch = ['tourist_attraction', 'restaurant'];
    const fetchPromises = categoriesToFetch.map(type => new Promise(resolve => {
      service.nearbySearch({
        location: searchCenter,
        radius: 6500,
        type: type
      }, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results);
        } else {
          resolve([]);
        }
      });
    }));

    Promise.all(fetchPromises).then(async (resultsArrays) => {
      if (!isMounted) return;

      const allResults = resultsArrays.flat();
      const seenIds = new Set();
      const uniqueResults = allResults.filter(p => {
        if (!p.place_id || seenIds.has(p.place_id)) return false;
        seenIds.add(p.place_id);
        return true;
      });

      const sortedPopular = uniqueResults.sort((a, b) => {
        const scoreA = (a.rating || 4.0) * Math.log10((a.user_ratings_total || 10) + 10);
        const scoreB = (b.rating || 4.0) * Math.log10((b.user_ratings_total || 10) + 10);
        return scoreB - scoreA;
      });

      const topResults = sortedPopular.slice(0, 8);

      const enhancedPlaces = await Promise.all(
        topResults.map(async (p, idx) => {
          const query = `${p.name} ${p.types?.[0]?.replace(/_/g, ' ') || ''} ${activeTrip?.name?.split(' ')[0] || ''}`.trim();
          const photoUrl = await fetchPhoto(query);
          return {
            id: p.place_id || `google-popular-${idx}-${Date.now()}`,
            title: p.name,
            name: p.name,
            category: (p.types?.[0] || "Explore").replace(/_/g, ' ').toUpperCase(),
            rating: p.rating || (4.5 + (idx % 5) * 0.1).toFixed(1),
            desc: p.vicinity || `One of the highest-rated popular destinations near your journey route!`,
            img: photoUrl || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=600&auto=format&fit=crop",
            coords: p.geometry?.location ? [p.geometry.location.lat(), p.geometry.location.lng()] : null,
            isGooglePlace: true
          };
        })
      );

      if (isMounted) {
        setCachedNearby(cacheKey, enhancedPlaces);
        setLivePopularPlaces(enhancedPlaces);
        setIsLoadingPopular(false);
      }
    });

    return () => { isMounted = false; };
  }, [activeTab, map, searchLat, searchLng, activeTrip?.name, activeTripId]);

  const handlePlaceSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!searchQuery.trim() || !window.google?.maps?.places) {
      if (!searchQuery.trim()) setSearchResults([]);
      return;
    }

    setIsSearchingPlaces(true);
    const service = new window.google.maps.places.PlacesService(map || document.createElement('div'));

    let sCenter = null;
    const sLat = (mapMarkers || [])[0]?.pos?.[0] || destinationCoords?.lat || baseCampHotel?.lat || map?.getCenter()?.lat() || null;
    const sLng = (mapMarkers || [])[0]?.pos?.[1] || destinationCoords?.lng || baseCampHotel?.lng || map?.getCenter()?.lng() || null;
    if (sLat && sLng) {
      sCenter = { lat: Number(sLat), lng: Number(sLng) };
    } else if (map && map.getCenter()) {
      sCenter = map.getCenter();
    }

    const destName = activeTrip?.itinerary?.destination || activeTrip?.ai_itinerary?.destination || activeItinerary?.destination || aiSourceForCheck?.destination || activeTrip?.destination || activeTrip?.name?.split(' ')[0] || activeTrip?.title?.split(' ')[0] || "";
    const queryText = `${searchQuery} ${destName}`.trim();

    const request = {
      query: queryText,
      radius: 25000
    };
    if (sCenter) {
      request.location = sCenter;
    }

    service.textSearch(request, async (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
        const topResults = results.slice(0, 10);
        const enhanced = await Promise.all(
          topResults.map(async (p, idx) => {
            const photoQuery = `${p.name} ${p.types?.[0]?.replace(/_/g, ' ') || ''} ${destName}`.trim();
            const photoUrl = await fetchPhoto(photoQuery);
            return {
              id: p.place_id || `google-search-${idx}-${Date.now()}`,
              title: p.name,
              name: p.name,
              category: (p.types?.[0] || "Place").replace(/_/g, ' ').toUpperCase(),
              rating: p.rating || (4.2 + (idx % 8) * 0.1).toFixed(1),
              desc: p.formatted_address || p.vicinity || `Match for "${searchQuery}" near ${destName}`,
              img: photoUrl || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=600&auto=format&fit=crop",
              coords: p.geometry?.location ? [p.geometry.location.lat(), p.geometry.location.lng()] : null,
              isGooglePlace: true
            };
          })
        );
        setSearchResults(enhanced);
      } else {
        setSearchResults([]);
      }
      setIsSearchingPlaces(false);
    });
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchingPlaces(false);
      return;
    }
    const timer = setTimeout(() => {
      handlePlaceSearch();
    }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery, map, destinationCoords]);

  const savedPlaces = placePool || [];
  const safeSavedPlaces = Array.isArray(savedPlaces) ? savedPlaces : [];
  const safeAiNearbyPlaces = Array.isArray(aiNearbyPlaces) ? aiNearbyPlaces : [];
  const safeLivePopularPlaces = Array.isArray(livePopularPlaces) ? livePopularPlaces : [];
  const safeSearchResults = Array.isArray(searchResults) ? searchResults : [];

  const displayedExplorationPlaces = useMemo(() => {
    if (isLoadingPopular || isSearchingPlaces) return [];
    if (searchQuery.trim()) {
      const localMatches = [...safeSavedPlaces, ...safeAiNearbyPlaces, ...safeLivePopularPlaces].filter(p =>
        (p?.name || p?.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p?.desc || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
      const seen = new Set();
      return [...safeSearchResults, ...localMatches].filter(p => {
        const key = (p?.id || p?.place_id || p?.name || p?.title || "").toString().toLowerCase().trim();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    if (activeTab === "drafts" || activeTab === "saved") {
      return safeSavedPlaces;
    }
    return [...safeAiNearbyPlaces, ...safeLivePopularPlaces];
  }, [isLoadingPopular, isSearchingPlaces, searchQuery, safeSearchResults, safeSavedPlaces, safeAiNearbyPlaces, safeLivePopularPlaces, activeTab]);

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearchingPlaces,
    livePopularPlaces,
    isLoadingPopular,
    displayedExplorationPlaces,
    handlePlaceSearch
  };
}
