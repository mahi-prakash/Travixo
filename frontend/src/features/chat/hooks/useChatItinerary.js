import { useState, useEffect } from "react";
import { fetchPhoto } from "../../../utils/unsplash";
import { getDayNumber } from "../utils/chatHelpers";

export default function useChatItinerary({
  activeTripId,
  getItinerary,
  aiItineraryCache,
  tripData
}) {
  const [activeTab, setActiveTab] = useState("itinerary");
  const [activePlanView, setActivePlanView] = useState("user");
  const [activeDay, setActiveDay] = useState("All days");
  const [placeIndex, setPlaceIndex] = useState(0);
  const [activeNearbyId, setActiveNearbyId] = useState(null);
  const [nearbyPlacesData, setNearbyPlacesData] = useState([]);
  const [isFetchingNearby, setIsFetchingNearby] = useState(false);

  // ── Reset UI state when trip changes ──────────────────────────────────────
  useEffect(() => {
    setPlaceIndex(0);
    setActiveTab("itinerary");
    setActiveDay("All days");
  }, [activeTripId]);

  // ── Use AI-generated nearby places ─────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== "nearby" || !activeTripId) return;

    const itinerary = getItinerary();
    if (itinerary && itinerary.nearby_places && itinerary.nearby_places.length > 0) {
      setNearbyPlacesData(itinerary.nearby_places);
      if (!activeNearbyId && itinerary.nearby_places[0]) {
        setActiveNearbyId(itinerary.nearby_places[0].id);
      }
    } else {
      setNearbyPlacesData([]);
    }
  }, [activeTab, activeTripId, tripData]);

  // ── Enhance itinerary activities with Unsplash images ─────────────────────
  const enhanceItineraryWithImages = async (itineraryData) => {
    if (!itineraryData?.days) return itineraryData;

    const dayEntries = Array.isArray(itineraryData.days)
      ? itineraryData.days.map((d, i) => [i, d])
      : Object.entries(itineraryData.days);

    const enhancedDaysArray = await Promise.all(
      dayEntries.map(async ([dayKey, day]) => {
        const activitiesToProcess = day.items || day.activities || [];

        const enhancedActivities = await Promise.all(
          activitiesToProcess.map(async (activity, aIdx) => {
            const actWithId = {
              ...activity,
              id: activity.id || `ai-item-${dayKey}-${aIdx}-${Date.now()}`
            };
            if (actWithId.img) return actWithId;
            const query = `${actWithId.title || actWithId.name} ${actWithId.location || ""}`.trim();
            const imageUrl = await fetchPhoto(query);
            return {
              ...actWithId,
              img:
                imageUrl ||
                "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=600&auto=format&fit=crop",
            };
          }),
        );
        return [dayKey, { ...day, items: enhancedActivities, activities: enhancedActivities }];
      }),
    );

    // ── Enhance nearby places ──
    let enhancedNearby = itineraryData.nearby_places;
    if (Array.isArray(enhancedNearby)) {
      enhancedNearby = await Promise.all(
        enhancedNearby.map(async (place, pIdx) => {
          const placeWithId = {
            ...place,
            id: place.id || `nearby-${pIdx}-${Date.now()}`
          };
          if (placeWithId.img && !placeWithId.img.includes("1554118811") && !placeWithId.img.includes("unsplash.com")) {
            return placeWithId;
          }
          const query = `${placeWithId.name} ${placeWithId.category || ""} ${itineraryData.destination || ""}`.trim();
          const imageUrl = await fetchPhoto(query);
          return {
            ...placeWithId,
            img: imageUrl || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=600&auto=format&fit=crop",
          };
        })
      );
    }

    if (!Array.isArray(itineraryData.days)) {
      return { ...itineraryData, days: Object.fromEntries(enhancedDaysArray), nearby_places: enhancedNearby };
    }

    return { ...itineraryData, days: enhancedDaysArray.map(pair => pair[1]), nearby_places: enhancedNearby };
  };

  // ── Derived values for panels ──────────────────────────────────────────────
  const activeItinerary = getItinerary();
  const activeItineraryToRender = activePlanView === "ai"
    ? ((aiItineraryCache || {})[activeTripId] || activeItinerary?.ai_locked_copy || activeItinerary)
    : activeItinerary;

  const itineraryDays = Array.isArray(activeItineraryToRender?.days)
    ? activeItineraryToRender.days
    : Object.values(activeItineraryToRender?.days || {});

  const places =
    itineraryDays.flatMap((day, dIdx) =>
      (day.items || day.activities || []).map((act) => ({
        ...act,
        dayNum: getDayNumber(day, dIdx),
      })),
    ) || [];

  const currentPlace = places[placeIndex] || {};
  const currentNearby =
    nearbyPlacesData.find((p) => p.id === activeNearbyId) || nearbyPlacesData[0];

  const dayTabs = itineraryDays.length > 0
    ? [
      "All days",
      ...itineraryDays.map((d, i) => `Day ${getDayNumber(d, i)}`),
    ]
    : ["All days"];

  return {
    activeTab,
    setActiveTab,
    activePlanView,
    setActivePlanView,
    activeDay,
    setActiveDay,
    placeIndex,
    setPlaceIndex,
    activeNearbyId,
    setActiveNearbyId,
    nearbyPlacesData,
    setNearbyPlacesData,
    isFetchingNearby,
    setIsFetchingNearby,
    enhanceItineraryWithImages,
    activeItineraryToRender,
    itineraryDays,
    places,
    currentPlace,
    currentNearby,
    dayTabs
  };
}
