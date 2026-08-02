import { useState, useEffect, useRef } from 'react';
import { fetchRoadRoute } from '../../../utils/mapRouting';

export function usePlannerLogistics({
  isLoaded,
  activeTrip,
  activeItinerary,
  aiSourceForCheck,
  days,
  mapMarkers,
  selectedDayId
}) {
  const [map, setMap] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [logistics, setLogistics] = useState({});
  const [directions, setDirections] = useState(null);
  const [baseCampMode, setBaseCampMode] = useState(null);
  const [baseCampHotel, setBaseCampHotel] = useState(null);
  const [baseCampStation, setBaseCampStation] = useState(null);
  const autocompleteRef = useRef(null);

  // 🌍 Geocode Actual Trip Destination: Never fall back to Paris if pins aren't loaded yet!
  useEffect(() => {
    const destName = activeTrip?.itinerary?.destination || activeTrip?.ai_itinerary?.destination || activeItinerary?.destination || aiSourceForCheck?.destination || activeTrip?.destination || activeTrip?.name?.split(' ')[0] || activeTrip?.title?.split(' ')[0];
    if (!destName || !window.google?.maps?.Geocoder) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: destName }, (results, status) => {
      if (status === "OK" && results?.[0]?.geometry?.location) {
        const loc = results[0].geometry.location;
        setDestinationCoords({ lat: loc.lat(), lng: loc.lng() });
      }
    });
  }, [activeTrip?.destination, activeTrip?.name, activeTrip?.title, activeTrip?.itinerary?.destination, activeTrip?.ai_itinerary?.destination, activeItinerary?.destination, aiSourceForCheck?.destination, isLoaded]);

  // 🚗 Fetch Logistics (Distances & Times)
  useEffect(() => {
    const fetchLogistics = async () => {
      const newLogistics = { ...logistics };
      let updated = false;
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      for (const dayId of Object.keys(days || {})) {
        const rawItems = days[dayId]?.items || [];
        const routingItems = [...rawItems];
        if (baseCampHotel && routingItems.length > 0) {
          routingItems.unshift({ ...baseCampHotel, id: `basecamp-start-${dayId}` });
          routingItems.push({ ...baseCampHotel, id: `basecamp-end-${dayId}` });
        }

        for (let i = 0; i < routingItems.length - 1; i++) {
          const itemA = routingItems[i];
          const itemB = routingItems[i + 1];
          const key = `${itemA.id}_${itemB.id}`;

          const latA = itemA.coords?.[0] ?? itemA.lat ?? itemA.location?.lat;
          const lngA = itemA.coords?.[1] ?? itemA.lng ?? itemA.location?.lng;

          const latB = itemB.coords?.[0] ?? itemB.lat ?? itemB.location?.lat;
          const lngB = itemB.coords?.[1] ?? itemB.lng ?? itemB.location?.lng;

          if (newLogistics[key] || !latA || !lngA || !latB || !lngB) continue;

          try {
            const res = await fetch(`${API_BASE}/logistics/calculate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                coordinates: [
                  [lngA, latA],
                  [lngB, latB]
                ]
              })
            });
            const data = await res.json();
            if (data.results && data.results.length > 0) {
              newLogistics[key] = data.results[0];
              updated = true;
            }
          } catch (err) {
            console.error('Failed to fetch logistics for', key, err);
          }
        }
      }

      if (updated) {
        setLogistics(newLogistics);
      }
    };

    const timer = setTimeout(() => {
      if (Object.keys(days || {}).length > 0) {
        fetchLogistics();
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [days, baseCampHotel]);

  // 🛣️ Real Road Directions (TypeScript Engine): Fetches actual street road paths between stops
  useEffect(() => {
    let isMounted = true;
    if (!window.google || (mapMarkers || []).length < 2 || selectedDayId === 'all') {
      setDirections(null);
      return;
    }

    const focusedMarkers = (mapMarkers || []).filter(m => m.isFocused);
    fetchRoadRoute(focusedMarkers, 'DRIVING').then(res => {
      if (isMounted && res) {
        setDirections(res);
      } else if (isMounted) {
        setDirections(null);
      }
    });

    return () => { isMounted = false; };
  }, [mapMarkers, selectedDayId]);

  const handleBaseCampLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const handleBaseCampPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (!place.geometry) return;

      const newBaseCamp = {
        id: place.place_id,
        name: place.name,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        type: baseCampMode
      };

      if (baseCampMode === 'hotel') {
        setBaseCampHotel(newBaseCamp);
      } else if (baseCampMode === 'station') {
        setBaseCampStation(newBaseCamp);
      }
      setBaseCampMode(null);
    }
  };

  return {
    map,
    setMap,
    destinationCoords,
    setDestinationCoords,
    logistics,
    directions,
    baseCampMode,
    setBaseCampMode,
    baseCampHotel,
    setBaseCampHotel,
    baseCampStation,
    setBaseCampStation,
    handleBaseCampLoad,
    handleBaseCampPlaceChanged
  };
}
