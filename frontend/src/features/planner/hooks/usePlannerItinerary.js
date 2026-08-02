import { useState, useEffect, useMemo, useRef } from 'react';
import { parseTimeToMinutes } from '../utils/plannerHelpers';
import { buildMapVisuals } from '../../../utils/mapRouting';

export function usePlannerItinerary({
  isLoaded,
  activeTrip,
  activeTripId,
  itineraryCache,
  aiItineraryCache,
  saveItineraryToCache,
  loading,
  updateTripItinerary
}) {
  const [days, setDays] = useState({});
  const [placePool, setPlacePool] = useState([]); // Drafts / Unassigned places
  const [planMode, setPlanMode] = useState("user");
  const [selectedDayId, setSelectedDayId] = useState("all");
  const [collapsedDays, setCollapsedDays] = useState({});
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [hoveredMarkerId, setHoveredMarkerId] = useState(null);
  const [addingPlace, setAddingPlace] = useState(null);
  const [addFeedback, setAddFeedback] = useState(null);
  const [editingTimeId, setEditingTimeId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState([]);

  const hasInitializedRef = useRef(null);
  const unsavedRef = useRef(false);
  const daysRef = useRef({});
  const tripIdRef = useRef(activeTripId);

  const activeItinerary = activeTrip?.itinerary || (itineraryCache || {})[activeTripId] || {};
  const aiSourceForCheck = activeTrip?.ai_itinerary || (aiItineraryCache || {})[activeTripId];
  const isModified = activeTrip?.itinerary &&
    aiSourceForCheck &&
    JSON.stringify(activeTrip.itinerary) !== JSON.stringify(aiSourceForCheck);

  useEffect(() => {
    unsavedRef.current = hasUnsavedChanges;
    daysRef.current = days;
    tripIdRef.current = activeTripId;
  }, [hasUnsavedChanges, days, activeTripId]);

  // 📍 Automated Frontend Geocode Recovery: Instantly resolve GPS coordinates for items if missing from older generations
  useEffect(() => {
    if (!isLoaded || !window.google?.maps?.Geocoder || !days || Object.keys(days).length === 0) return;
    const geocoder = new window.google.maps.Geocoder();
    let madeChanges = false;
    const updatedDays = JSON.parse(JSON.stringify(days));
    const destName = activeTrip?.itinerary?.destination || activeTrip?.ai_itinerary?.destination || activeTrip?.destination || "";

    const geocodePromises = [];

    Object.entries(updatedDays).forEach(([dayId, day]) => {
      (day.items || day.activities || []).forEach(item => {
        const hasCoords = (item.coords && item.coords.length === 2 && item.coords[0] !== 0) || (item.lat && item.lng) || item.geocodingAttempted;
        if (!hasCoords && (item.name || item.title || item.location)) {
          const query = `${item.name || item.title} ${item.location || destName}`.trim();
          item.geocodingAttempted = true;
          geocodePromises.push(
            new Promise(resolve => {
              geocoder.geocode({ address: query }, (results, status) => {
                if (status === "OK" && results?.[0]?.geometry?.location) {
                  const loc = results[0].geometry.location;
                  item.coords = [loc.lat(), loc.lng()];
                  item.lat = loc.lat();
                  item.lng = loc.lng();
                  madeChanges = true;
                }
                resolve();
              });
            })
          );
        }
      });
    });

    if (geocodePromises.length > 0) {
      Promise.all(geocodePromises).then(() => {
        if (madeChanges) {
          setDays(updatedDays);
          if (activeTripId && saveItineraryToCache) {
            saveItineraryToCache(activeTripId, { ...activeItinerary, days: updatedDays });
          }
        }
      });
    }
  }, [days, isLoaded, activeTripId]);

  // 🚨 PROTECT AGAINST TAB CLOSE (Native popup)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave without saving?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // 💾 SILENT AUTO-SAVE ON UNMOUNT
  useEffect(() => {
    return () => {
      if (unsavedRef.current && tripIdRef.current && updateTripItinerary) {
        const currentItin = (itineraryCache || {})[tripIdRef.current] || {};
        updateTripItinerary(tripIdRef.current, { ...currentItin, days: daysRef.current });
      }
    };
  }, []);

  // Manual Save Function
  const saveChanges = async () => {
    if (!unsavedRef.current || isSaving) return;

    setIsSaving(true);
    try {
      const currentItin = activeTrip?.itinerary || {};
      const response = await updateTripItinerary(tripIdRef.current, { ...currentItin, days: daysRef.current });

      if (response && response.error) {
        throw new Error(response.error.message);
      }

      setHasUnsavedChanges(false);
      unsavedRef.current = false;
      alert("Plan saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save plan. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // 🔄 INITIAL LOAD ONLY
  useEffect(() => {
    if (!activeTripId || loading) return;

    const dbItinerary = activeTrip?.itinerary;
    const cachedItinerary = (itineraryCache || {})[activeTripId];
    const sourceItinerary = dbItinerary || cachedItinerary;

    const initKey = `${activeTripId}_${sourceItinerary?.destination || activeTrip?.ai_itinerary?.destination || ''}_${JSON.stringify(sourceItinerary?.days || activeTrip?.ai_itinerary?.days || '').length}`;

    if (hasInitializedRef.current === initKey) {
      return;
    }

    const hasDays = sourceItinerary?.days && (
      Array.isArray(sourceItinerary.days)
        ? sourceItinerary.days.length > 0
        : Object.keys(sourceItinerary.days).length > 0
    );

    if (hasDays) {
      let sourceDays = sourceItinerary.days;
      const normalizedDays = {};

      const entries = Array.isArray(sourceDays)
        ? sourceDays.map((d, i) => [i, d])
        : Object.entries(sourceDays);

      entries.forEach(([key, dayData], index) => {
        const dayId = `day-${index + 1}`;
        normalizedDays[dayId] = {
          ...dayData,
          id: dayId,
          title: dayData.title || `Day ${index + 1}`,
          date: dayData.date || `Day ${index + 1}`,
          color: dayData.color || "#0284c7",
          items: (dayData.items || dayData.activities || []).map((act, aIdx) => ({
            ...act,
            id: act.id || `item-${dayId}-${aIdx}-${Date.now()}`,
            name: act.title || act.name || "Activity",
          }))
        };
      });

      setDays(normalizedDays);
      hasInitializedRef.current = initKey;
    } else if (activeTrip?.ai_itinerary && sourceItinerary === null) {
      const aiDays = activeTrip.ai_itinerary.days || {};
      const normalizedAi = {};

      const entries = Array.isArray(aiDays)
        ? aiDays.map((d, i) => [i, d])
        : Object.entries(aiDays);

      entries.forEach(([k, v], i) => {
        const id = `day-${i + 1}`;
        normalizedAi[id] = {
          ...v,
          id,
          items: (v.items || v.activities || []).map((act, aIdx) => ({
            ...act,
            id: act.id || `item-${id}-${aIdx}-${Date.now()}`,
            name: act.title || act.name || "Activity",
          }))
        };
      });
      setDays(normalizedAi);
      hasInitializedRef.current = initKey;
      const currentItin = activeTrip?.itinerary || {};
      const seededItin = { ...currentItin, days: normalizedAi };
      if (saveItineraryToCache) saveItineraryToCache(activeTripId, seededItin);
      if (updateTripItinerary) updateTripItinerary(activeTripId, seededItin);
    }
  }, [activeTripId, activeTrip, itineraryCache]);

  const getAiVersion = () => {
    const aiSource = activeTrip?.ai_itinerary || (aiItineraryCache || {})[activeTripId] || activeTrip?.itinerary;
    if (!aiSource || !aiSource.days) return {};

    const plannerObj = {};
    const dayEntries = Array.isArray(aiSource.days)
      ? aiSource.days.map((d, i) => [`day-${i + 1}`, d])
      : Object.entries(aiSource.days);

    dayEntries.forEach(([id, day], idx) => {
      plannerObj[id] = {
        id,
        title: day.title || `Day ${idx + 1}`,
        date: day.date || `Day ${idx + 1}`,
        color: "#0891b2",
        items: (day.activities || day.items || []).map((act, aIdx) => ({
          ...act,
          id: act.id || `ai-item-${id}-${aIdx}`,
          name: act.title || act.name || "Activity",
        }))
      };
    });
    return plannerObj;
  };

  const displayDays = planMode === "ai" ? getAiVersion() : (days || {});
  const displayDayOrder = Object.keys(displayDays).sort((a, b) => {
    const numA = parseInt(a.split('-')[1] || 0);
    const numB = parseInt(b.split('-')[1] || 0);
    return numA - numB;
  });
  const isReadOnly = planMode === "ai";
  const visibleDays = selectedDayId === "all" ? displayDayOrder : [selectedDayId];

  // History logic
  const pushToHistory = () => {
    setHistory(prev => [...prev, JSON.parse(JSON.stringify(days))].slice(-20));
  };

  const undo = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setDays(lastState);
  };

  useEffect(() => {
    setHistory([]);
  }, [activeTripId]);

  const toggleCollapse = (dayId) => {
    setCollapsedDays(prev => ({ ...prev, [dayId]: !prev[dayId] }));
  };

  const addToDay = (place, dayId, time = "TBD") => {
    if (isReadOnly || !dayId) return;

    pushToHistory();
    const newItem = {
      id: `item-${Date.now()}`,
      placeId: place.id,
      title: place.name,
      type: place.type,
      time: time || "TBD",
      location: place.name,
      coords: place.coords,
      img: place.img,
      category: place.category,
      cost: place.cost,
      duration: place.duration,
      bestTime: place.bestTime,
      tags: place.tags || [],
      desc: place.desc
    };

    setDays(prev => {
      const currentItems = prev[dayId]?.items || [];
      const newItems = [...currentItems, newItem];
      newItems.sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));

      const newDays = {
        ...prev,
        [dayId]: {
          ...prev[dayId],
          items: newItems
        }
      };
      if (saveItineraryToCache) saveItineraryToCache(activeTripId, { days: newDays });
      setHasUnsavedChanges(true);
      return newDays;
    });

    setAddFeedback({ id: place.id, dayName: (displayDays[dayId]?.title || "").split(':')[0] || "Day" });
    setAddingPlace(null);
    setTimeout(() => setAddFeedback(null), 3000);
  };

  const updateItemTime = (dayId, itemId, newTime) => {
    if (isReadOnly) return;
    pushToHistory();
    setDays(prev => {
      const currentItems = prev[dayId]?.items || [];
      const newItems = currentItems.map(item =>
        item.id === itemId ? { ...item, time: newTime } : item
      );
      newItems.sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));

      return {
        ...prev,
        [dayId]: {
          ...prev[dayId],
          items: newItems
        }
      };
    });
    unsavedRef.current = true;
    setHasUnsavedChanges(true);
    setEditingTimeId(null);
  };

  const deleteItem = (dayId, itemId) => {
    if (isReadOnly) return;
    pushToHistory();

    const newDays = {
      ...days,
      [dayId]: {
        ...days[dayId],
        items: (days[dayId]?.items || []).filter(item => item.id !== itemId)
      }
    };

    setDays(newDays);
    if (saveItineraryToCache) saveItineraryToCache(activeTripId, { days: newDays });
    unsavedRef.current = true;
    setHasUnsavedChanges(true);
  };

  const restorePlan = () => {
    if (!activeTrip?.ai_itinerary) {
      alert("No AI version found for this trip.");
      return;
    }

    if (!window.confirm("This will overwrite all your custom changes with the original AI plan. Are you sure?")) {
      return;
    }

    const aiDays = activeTrip.ai_itinerary.days || {};
    const normalizedAi = {};

    const entries = Array.isArray(aiDays)
      ? aiDays.map((d, i) => [i, d])
      : Object.entries(aiDays);

    entries.forEach(([k, v], i) => {
      const id = `day-${i + 1}`;
      normalizedAi[id] = {
        ...v,
        id,
        items: (v.items || v.activities || []).map((act, aIdx) => ({
          ...act,
          id: act.id || `item-${id}-${aIdx}-${Date.now()}`,
          name: act.title || act.name || "Activity",
        }))
      };
    });

    setDays(normalizedAi);
    if (saveItineraryToCache) saveItineraryToCache(activeTripId, { days: normalizedAi });
    setHasUnsavedChanges(true);
    setAddFeedback({ type: 'success', message: 'Restored to original AI plan!' });
    setTimeout(() => setAddFeedback(null), 3000);
  };

  const addDay = () => {
    if (isReadOnly) return;
    pushToHistory();
    const nextDayNum = displayDayOrder.length + 1;
    const nextDayId = `day-${nextDayNum}-${Date.now()}`;

    setDays(prev => ({
      ...prev,
      [nextDayId]: {
        id: nextDayId,
        title: `Day ${nextDayNum}: New Chapter`,
        date: "TBD",
        color: "#0284c7",
        items: []
      }
    }));
  };

  const { markers: mapMarkers, polylines: mapPolylines } = useMemo(() => {
    return buildMapVisuals(displayDayOrder, displayDays, selectedDayId);
  }, [displayDayOrder, displayDays, selectedDayId]);

  return {
    days,
    setDays,
    placePool,
    setPlacePool,
    planMode,
    setPlanMode,
    selectedDayId,
    setSelectedDayId,
    collapsedDays,
    setCollapsedDays,
    selectedPlace,
    setSelectedPlace,
    hoveredMarkerId,
    setHoveredMarkerId,
    addingPlace,
    setAddingPlace,
    addFeedback,
    setAddFeedback,
    editingTimeId,
    setEditingTimeId,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    isSaving,
    setIsSaving,
    history,
    setHistory,
    unsavedRef,
    activeItinerary,
    aiSourceForCheck,
    isModified,
    displayDays,
    displayDayOrder,
    isReadOnly,
    visibleDays,
    mapMarkers,
    mapPolylines,
    pushToHistory,
    undo,
    toggleCollapse,
    addToDay,
    updateItemTime,
    deleteItem,
    restorePlan,
    addDay,
    saveChanges
  };
}
