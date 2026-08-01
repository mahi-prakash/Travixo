// Travstory Planner - v1.0.1 - STABILITY_LOCK_ACTIVE
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Calendar,
  ChevronDown,
  Plus,
  MoreVertical,
  Save,
  Navigation,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Rocket,
  Map as MapIcon,
  Layout,
  Layers,
  History,
  Trash2,
  Share2,
  Maximize2,
  Trash,
  Move,
  Settings,
  HelpCircle,
  GripVertical,
  Plane,
  Hotel,
  Utensils,
  Camera,
  Star,
  ArrowLeft,
  Tag,
  DollarSign,
  Check,
  RotateCcw,
  Undo2,
  SlidersHorizontal,
  Train,
  Bookmark
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  Polyline,
  InfoWindowF,
  DirectionsRenderer,
  Autocomplete
} from "@react-google-maps/api";

import { motion, AnimatePresence } from 'framer-motion';
import { useTrip } from '../context/TripContext';
import { useUser } from '../context/UserContext';
import Dropdown from '../components/common/Dropdown';
import SEO from '../components/common/SEO';
import { GOOGLE_MAPS_API_KEY } from '../utils/googleMaps';
import { fetchPhoto } from '../utils/unsplash';
import { buildMapVisuals, fetchRoadRoute } from '../utils/mapRouting';

const googleLibraries = ['places'];

// ⚡ Cache Engine: Stores Google Places & Unsplash results in browser memory and sessionStorage!
// This eliminates repetitive API calls and speeds up tab/filter switching without touching the backend DB.
const nearbyPlacesCache = {};
const getCachedNearby = (key) => {
  if (nearbyPlacesCache[key]) return nearbyPlacesCache[key];
  try {
    const cached = sessionStorage.getItem(key);
    if (cached) {
      const parsed = JSON.parse(cached);
      nearbyPlacesCache[key] = parsed;
      return parsed;
    }
  } catch (e) { /* ignore storage error */ }
  return null;
};
const setCachedNearby = (key, data) => {
  nearbyPlacesCache[key] = data;
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch (e) { /* ignore storage error */ }
};

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "1.5rem",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  overflow: "hidden"
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: true,
  mapTypeControl: false,
  fullscreenControl: false,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ]
};

// --- Mock Data ---

const initialDays = {
  "day-1": {
    id: "day-1",
    title: "Day 1: Arrival & Classics",
    date: "Oct 12",
    color: "#0284c7",
    items: [
      {
        id: "item-1",
        type: "flight",
        title: "Landing at CDG",
        time: "10:00 AM",
        location: "Charles de Gaulle Airport",
        coords: [49.0097, 2.5479],
        img: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=600",
        category: "Transit",
        cost: "N/A",
        duration: "1h 30m",
        bestTime: "Morning",
        tags: ["Travel", "Airport"],
        desc: "Arrival at Paris Charles de Gaulle. Proceed to baggage claim and take the RER B train to the city center."
      },
      {
        id: "item-2",
        type: "hotel",
        title: "Check-in at Le Littré",
        time: "12:00 PM",
        location: "Hotel Le Littré",
        coords: [48.8431, 2.3248],
        img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600",
        category: "Stay",
        cost: "€250/night",
        duration: "Check-in",
        bestTime: "After 2 PM",
        tags: ["Luxury", "Comfort"],
        desc: "A charming 4-star hotel located in the 6th arrondissement, between Saint-Germain-des-Prés and Montparnasse."
      },
      {
        id: "item-3",
        type: "food",
        title: "Lunch at Angelina",
        time: "01:30 PM",
        location: "Angelina Paris",
        coords: [48.8653, 2.3292],
        img: "https://images.unsplash.com/photo-1554679665-f5537f187268?q=80&w=600",
        category: "Food",
        cost: "€40-60",
        duration: "1h 30m",
        bestTime: "Lunch",
        tags: ["Famous", "Hot Chocolate", "Pastry"],
        desc: "Famous tearoom known for its signature hot chocolate 'L'Africain' and Mont-Blanc pastry. A must-visit classic."
      },
      {
        id: "item-4",
        type: "activity",
        title: "Louvre Museum",
        time: "03:00 PM",
        location: "Musée du Louvre",
        coords: [48.8606, 2.3376],
        img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=900&auto=format&fit=crop",
        category: "Landmark",
        cost: "€17",
        duration: "3h+",
        bestTime: "Early Morning or Late Night",
        tags: ["Art", "History", "Museum"],
        desc: "The world's largest art museum and a historic monument in Paris. Home to the Mona Lisa and thousands of other masterpieces."
      },
    ],
  },
  "day-2": {
    id: "day-2",
    title: "Day 2: Bohemian Vibes",
    date: "Oct 13",
    color: "#0284c7",
    items: [
      {
        id: "item-5",
        type: "food",
        title: "Brunch at Carette",
        time: "10:00 AM",
        location: "Carette",
        coords: [48.8637, 2.2872],
        img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600",
        category: "Food",
        cost: "€30-50",
        duration: "1h 30m",
        bestTime: "Morning",
        tags: ["Brunch", "Macarons", "View"],
        desc: "Elegant café serving delicious brunch and pastries. Great view of Trocadéro."
      },
      {
        id: "item-6",
        type: "activity",
        title: "Montmartre Walk",
        time: "11:30 AM",
        location: "Montmartre",
        coords: [48.8867, 2.3431],
        img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=60",
        category: "Adventure",
        cost: "Free",
        duration: "2h",
        bestTime: "Anytime",
        tags: ["Walking", "Views", "Art"],
        desc: "Explore the artistic hilltop district of Montmartre, famous for its cobbled streets, artists, and the Sacré-Cœur."
      },
    ],
  },
  "day-3": {
    id: "day-3",
    title: "Day 3: Shopping & Seine",
    date: "Oct 14",
    color: "#0284c7",
    items: [],
  },
};

// --- Helpers ---

const getItemIcon = (type) => {
  switch (type) {
    case "flight": return Plane;
    case "hotel": return Hotel;
    case "food": return Utensils;
    case "activity": return Camera;
    default: return MapPin;
  }
};

const createCustomIcon = (number, color) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); color: white; font-weight: 800; font-size: 14px;">${number}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return 1440;
  if (timeStr.toLowerCase() === "tbd") return 1440;

  // Try to match HH:MM AM/PM
  const match = timeStr.match(/(\d+):?(\d+)?\s*(AM|PM)/i);
  if (!match) {
    // Check for keywords
    const lower = timeStr.toLowerCase();
    if (lower.includes("morning")) return 480; // 8 AM
    if (lower.includes("noon")) return 720; // 12 PM
    if (lower.includes("afternoon")) return 840; // 2 PM
    if (lower.includes("evening")) return 1080; // 6 PM
    if (lower.includes("night")) return 1260; // 9 PM
    return 1441; // Anything else goes to the bottom
  }

  let [_, hours, minutes, period] = match;
  hours = parseInt(hours);
  minutes = parseInt(minutes || 0);

  if (period.toUpperCase() === "PM" && hours < 12) hours += 12;
  if (period.toUpperCase() === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

// ==========================================
// 🚀 MAIN PLANNER COMPONENT
// ==========================================

// --- Main Component ---

export default function Planner() {

  // 🧪 Mount Pulse
  useEffect(() => {
    // alert("Planner Engine Initialized! 🚀"); // Removed to avoid annoying popups if it works fast
  }, []);

  const navigate = useNavigate();
  const { tripId: urlTripId } = useParams();
  const hasInitializedRef = useRef(null); // 🛡️ Source of Truth Lock: tracks which tripId is currently loaded

  // 🗺️ Initialize Google Maps Engine
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: googleLibraries
  });

  const [mapAuthFailed, setMapAuthFailed] = useState(false);

  useEffect(() => {
    // 🛡️ Catch Google Maps Auth Failures (e.g. invalid API key)
    window.gm_authFailure = () => {
      console.error("❌ [Google Maps] Authentication Failure");
      setMapAuthFailed(true);
    };
  }, []);

  if (loadError) {
    console.error("❌ [Google Maps] Load Error:", loadError);
  }


  const [map, setMap] = useState(null);

  const {
    trips: realTrips,
    activeTripId: contextActiveTripId,
    setActiveTrip,
    itineraryCache,
    aiItineraryCache,
    saveItineraryToCache,
    loading,
    trips,
    updateTripItinerary,
    isGenerating
  } = useTrip();

  // 🔥 URL Sync Logic: If URL has a tripId, make it the active one in Context
  useEffect(() => {
    if (urlTripId && urlTripId !== contextActiveTripId && urlTripId !== "1") {
      setActiveTrip(urlTripId);
    }
  }, [urlTripId, contextActiveTripId]);

  const activeTripId = (urlTripId && urlTripId !== "1") ? urlTripId : contextActiveTripId;
  const activeTrip = (trips || []).find(t => t.id === activeTripId);

  // 🔥 Is Modified Check: Does the user plan differ from the original AI plan?
  const aiSourceForCheck = activeTrip?.ai_itinerary || (aiItineraryCache || {})[activeTripId];
  const isModified = activeTrip?.itinerary &&
    aiSourceForCheck &&
    JSON.stringify(activeTrip.itinerary) !== JSON.stringify(aiSourceForCheck);

  // 🌍 Dynamic Nearby Places from AI & Step 1 Must-Visit Selections
  const activeItinerary = activeTrip?.itinerary || (itineraryCache || {})[activeTripId] || {};
  const aiSourceForNearby = activeTrip?.ai_itinerary || (aiItineraryCache || {})[activeTripId];
  const rawAiNearby = activeItinerary.nearby_places || aiSourceForNearby?.nearby_places || [];

  // 🎯 Immediately inject spots clicked by the user during Step 1 / Onboarding
  const stepOnePicks = useMemo(() => {
    let spots = activeTrip?.must_visit || activeTrip?.mustVisitPlaces || activeItinerary?.must_visit || [];
    if (!spots.length) {
      try {
        const fromSession = JSON.parse(sessionStorage.getItem('STEP_ONE_MUST_VISIT') || '[]');
        if (Array.isArray(fromSession) && fromSession.length) spots = fromSession;
      } catch (e) { /* ignore */ }
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

  const [days, setDays] = useState({});
  const [placePool, setPlacePool] = useState([]); // Drafts / Unassigned places
  const savedPlaces = placePool; // Direct mirror for drafts and unscheduled holding bucket
  const [planMode, setPlanMode] = useState("user");
  const [selectedDayId, setSelectedDayId] = useState("all");
  const [activeTab, setActiveTab] = useState("popular");
  // 🌟 Google Places Popular Spots (Combined Sights + Dining) + Free Unsplash Integration
  const [livePopularPlaces, setLivePopularPlaces] = useState([]);
  const [isLoadingPopular, setIsLoadingPopular] = useState(false);
  const [collapsedDays, setCollapsedDays] = useState({});
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [hoveredMarkerId, setHoveredMarkerId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [addingPlace, setAddingPlace] = useState(null);
  const [addFeedback, setAddFeedback] = useState(null);
  const [editingTimeId, setEditingTimeId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [logistics, setLogistics] = useState({});
  const [baseCampMode, setBaseCampMode] = useState(null);
  const [baseCampHotel, setBaseCampHotel] = useState(null);
  const [baseCampStation, setBaseCampStation] = useState(null);
  const autocompleteRef = useRef(null);
  const [destinationCoords, setDestinationCoords] = useState(null);

  // 🌍 Geocode Actual Trip Destination: Never fall back to Paris if pins aren't loaded yet!
  useEffect(() => {
    const destName = activeTrip?.destination || activeTrip?.name?.split(' ')[0] || activeTrip?.title?.split(' ')[0];
    if (!destName || !window.google?.maps?.Geocoder) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: destName }, (results, status) => {
      if (status === "OK" && results?.[0]?.geometry?.location) {
        const loc = results[0].geometry.location;
        setDestinationCoords({ lat: loc.lat(), lng: loc.lng() });
      }
    });
  }, [activeTrip?.destination, activeTrip?.name, activeTrip?.title, isLoaded]);

  // 🚗 Fetch Logistics (Distances & Times)
  useEffect(() => {
    const fetchLogistics = async () => {
      // Collect sequential coordinate pairs for each day
      const newLogistics = { ...logistics };
      let updated = false;

      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      for (const dayId of Object.keys(days)) {
        const rawItems = days[dayId]?.items || [];
        // Inject Hotel at start and end of the day if it exists
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

          // Skip if already fetched or missing coordinates
          if (newLogistics[key] || !latA || !lngA || !latB || !lngB) continue;

          try {
            const res = await fetch(`${API_BASE}/logistics/calculate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                coordinates: [
                  [lngA, latA], // OSRM expects [lng, lat]
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
      if (Object.keys(days).length > 0) {
        fetchLogistics();
      }
    }, 600); // 🛡️ Debounce 600ms so rapid dragging doesn't flood the routing engine

    return () => clearTimeout(timer);
  }, [days, baseCampHotel]);

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
      setBaseCampSearch('');
    }
  };

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

  // 💾 SILENT AUTO-SAVE ON UNMOUNT (For client-side navigation like clicking 'Chat')
  const unsavedRef = useRef(false);
  const daysRef = useRef({});
  const tripIdRef = useRef(activeTripId);

  useEffect(() => {
    unsavedRef.current = hasUnsavedChanges;
    daysRef.current = days;
    tripIdRef.current = activeTripId;
  }, [hasUnsavedChanges, days, activeTripId]);

  useEffect(() => {
    return () => {
      if (unsavedRef.current && tripIdRef.current) {
        // Automatically save if they navigate away without clicking Save
        const currentItin = (itineraryCache || {})[tripIdRef.current] || {};
        updateTripItinerary(tripIdRef.current, { ...currentItin, days: daysRef.current });
      }
    };
  }, []);

  // Manual Save Function
  const saveChanges = async () => {
    if (!unsavedRef.current || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      const currentItin = activeTrip?.itinerary || {};
      const response = await updateTripItinerary(tripIdRef.current, { ...currentItin, days: daysRef.current });

      if (response && response.error) {
        throw new Error(response.error.message);
      }

      setHasUnsavedChanges(false);
      unsavedRef.current = false; // Manually sync the ref instantly

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
    // 🛡️ GUARD: Wait for trips to finish loading before deciding what to initialize
    if (!activeTripId || loading) return;

    // 🛡️ HARD STOP: If this specific trip is already initialized in state, DO NOT OVERWRITE
    if (hasInitializedRef.current === activeTripId) {
      return;
    }


    const dbItinerary = activeTrip?.itinerary;
    const cachedItinerary = (itineraryCache || {})[activeTripId];
    const sourceItinerary = dbItinerary || cachedItinerary;



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
          // 🛡️ FIX: Normalize 'activities' vs 'items' mismatch
          items: (dayData.items || dayData.activities || []).map((act, aIdx) => ({
            ...act,
            id: act.id || `item-${dayId}-${aIdx}-${Date.now()}`,
            name: act.title || act.name || "Activity",
          }))
        };
      });

      setDays(normalizedDays);
      hasInitializedRef.current = activeTripId;
    } else if (activeTrip?.ai_itinerary && sourceItinerary === null) {
      // 🛡️ ONLY seed from AI if Your Plan (itinerary) is ABSOLUTELY null (never touched)
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
      hasInitializedRef.current = activeTripId;
      // 🔥 PERSIST: Save the initial copy to DB immediately so it's not null anymore
      const currentItin = activeTrip?.itinerary || {};
      const seededItin = { ...currentItin, days: normalizedAi };
      saveItineraryToCache(activeTripId, seededItin);
      updateTripItinerary(activeTripId, seededItin);
    }
  }, [activeTripId, activeTrip, itineraryCache]);



  // Helper to format the permanent AI backup into Planner-friendly structure
  const getAiVersion = () => {
    // 🛡️ Always pull from the immutable backup (ai_itinerary), fallback to itinerary for legacy trips
    const aiSource = activeTrip?.ai_itinerary || (aiItineraryCache || {})[activeTripId] || activeTrip?.itinerary;
    if (!aiSource || !aiSource.days) return {};

    const plannerObj = {};

    // 🛡️ Handle both Array and Object formats
    const dayEntries = Array.isArray(aiSource.days)
      ? aiSource.days.map((d, i) => [`day-${i + 1}`, d])
      : Object.entries(aiSource.days);

    dayEntries.forEach(([id, day], idx) => {
      plannerObj[id] = {
        id,
        title: day.title || `Day ${idx + 1}`,
        date: day.date || `Day ${idx + 1}`,
        color: "#0891b2", // Distinguish AI color (Cyan)
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
    const numA = parseInt(a.split('-')[1]);
    const numB = parseInt(b.split('-')[1]);
    return numA - numB;
  });
  const isReadOnly = planMode === "ai";

  // --- HISTORY / UNDO LOGIC ---
  const [history, setHistory] = useState([]);

  const pushToHistory = () => {
    setHistory(prev => [...prev, JSON.parse(JSON.stringify(days))].slice(-20)); // Keep last 20 states
  };

  const undo = () => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setDays(lastState);
  };

  // Clear history when switching trips
  useEffect(() => {
    setHistory([]);
  }, [activeTripId]);

  const toggleCollapse = (dayId) => {
    setCollapsedDays(prev => ({ ...prev, [dayId]: !prev[dayId] }));
  };

  const onDragEnd = (result) => {
    if (isReadOnly) return;
    const { source, destination } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    pushToHistory();
    unsavedRef.current = true;
    setHasUnsavedChanges(true);

    // Case 1: Reordering within Place Pool
    if (source.droppableId === "place-pool" && destination.droppableId === "place-pool") {
      const newPool = Array.from(placePool);
      const [moved] = newPool.splice(source.index, 1);
      newPool.splice(destination.index, 0, moved);
      setPlacePool(newPool);
      return;
    }

    // Case 2: Moving from Place Pool to a Day
    if (source.droppableId === "place-pool" && destination.droppableId !== "place-pool") {
      const newPool = Array.from(placePool);
      const [moved] = newPool.splice(source.index, 1);

      const destDay = days[destination.droppableId];
      const newItems = Array.from(destDay.items || []);
      newItems.splice(destination.index, 0, moved);

      const newDays = { ...days, [destination.droppableId]: { ...destDay, items: newItems } };
      setPlacePool(newPool);
      setDays(newDays);
      saveItineraryToCache(activeTripId, { days: newDays });
      return;
    }

    // Case 3: Moving from a Day to Place Pool
    if (source.droppableId !== "place-pool" && destination.droppableId === "place-pool") {
      const sourceDay = days[source.droppableId];
      const newItems = Array.from(sourceDay.items || []);
      const [moved] = newItems.splice(source.index, 1);

      const newPool = Array.from(placePool);
      newPool.splice(destination.index, 0, moved);

      const newDays = { ...days, [source.droppableId]: { ...sourceDay, items: newItems } };
      setDays(newDays);
      setPlacePool(newPool);
      saveItineraryToCache(activeTripId, { days: newDays });
      return;
    }

    // Case 4: Moving within the same Day or between two Days (Existing logic)
    if (source.droppableId === destination.droppableId) {
      const day = days[source.droppableId];
      const newItems = Array.from(day.items);
      const [moved] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, moved);
      const newDays = { ...days, [source.droppableId]: { ...day, items: newItems } };
      setDays(newDays);
      saveItineraryToCache(activeTripId, { days: newDays });
    } else {
      const sourceDay = days[source.droppableId];
      const destDay = days[destination.droppableId];
      const sourceItems = Array.from(sourceDay.items);
      const destItems = Array.from(destDay.items);
      const [moved] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, moved);
      const newDays = {
        ...days,
        [source.droppableId]: { ...sourceDay, items: sourceItems },
        [destination.droppableId]: { ...destDay, items: destItems },
      };
      setDays(newDays);
      saveItineraryToCache(activeTripId, { days: newDays });
    }
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
      saveItineraryToCache(activeTripId, { days: newDays });
      setHasUnsavedChanges(true);
      return newDays;
    });

    // Feedback logic
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
      // Sort items by time
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
    saveItineraryToCache(activeTripId, { days: newDays });
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
    saveItineraryToCache(activeTripId, { days: normalizedAi });
    setHasUnsavedChanges(true);

    // 🔥 Success feedback
    setAddFeedback({ type: 'success', message: 'Restored to original AI plan!' });
    setTimeout(() => setAddFeedback(null), 3000);
  };

  const addDay = () => {
    if (isReadOnly) return;
    pushToHistory();
    const nextDayNum = displayDayOrder.length + 1;
    const nextDayId = `day-${nextDayNum}-${Date.now()}`; // Unique ID

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
    setDayOrder(prev => [...prev, nextDayId]);
  };

  const visibleDays = selectedDayId === "all" ? displayDayOrder : [selectedDayId];

  // ⚡ TypeScript Map Data Logic: Seamlessly delegates coordinate resolution and sequencing to our strict TS engine!
  const { markers: mapMarkers, polylines: mapPolylines } = useMemo(() => {
    return buildMapVisuals(displayDayOrder, displayDays, selectedDayId);
  }, [displayDayOrder, displayDays, selectedDayId]);

  // 🗺️ Automated Map Camera: Fits all pins into view or pans directly to trip destination!
  useEffect(() => {
    if (!map || !window.google) return;
    if (mapMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      mapMarkers.forEach(marker => {
        bounds.extend({ lat: marker.pos[0], lng: marker.pos[1] });
      });
      map.fitBounds(bounds, { padding: 80 });
    } else if (destinationCoords) {
      map.panTo(destinationCoords);
      map.setZoom(13);
    }
  }, [map, mapMarkers, destinationCoords]);

  const [directions, setDirections] = useState(null);

  // 🛣️ Real Road Directions (TypeScript Engine): Fetches actual street road paths between stops
  useEffect(() => {
    let isMounted = true;
    if (!window.google || mapMarkers.length < 2 || selectedDayId === 'all') {
      setDirections(null);
      return;
    }

    const focusedMarkers = mapMarkers.filter(m => m.isFocused);
    fetchRoadRoute(focusedMarkers, 'DRIVING').then(res => {
      if (isMounted && res) {
        setDirections(res);
      } else if (isMounted) {
        setDirections(null);
      }
    });

    return () => { isMounted = false; };
  }, [mapMarkers, selectedDayId]);

  // 🌟 Google Places Popular Spots Search + Free Unsplash Photo Integration (Zero Google Photo Costs!)
  const searchLat = mapMarkers[0]?.pos?.[0] || destinationCoords?.lat || baseCampHotel?.lat || map?.getCenter()?.lat() || null;
  const searchLng = mapMarkers[0]?.pos?.[1] || destinationCoords?.lng || baseCampHotel?.lng || map?.getCenter()?.lng() || null;

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

    // 🌟 COMBINED QUERY: Automatically gather sights, dining, and landmarks, then sort by user ratings & reviews!
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

      // 🌟 POPULARITY RANKING: Sort descending by prominence (rating combined with review volume)
      const sortedPopular = uniqueResults.sort((a, b) => {
        const scoreA = (a.rating || 4.0) * Math.log10((a.user_ratings_total || 10) + 10);
        const scoreB = (b.rating || 4.0) * Math.log10((b.user_ratings_total || 10) + 10);
        return scoreB - scoreA;
      });

      // Keep the top 8 most prominent attractions & restaurants in town!
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
        // ⚡ SAVE TO CACHE: Ensure subsequent clicks on this tab are instant!
        setCachedNearby(cacheKey, enhancedPlaces);
        setLivePopularPlaces(enhancedPlaces);
        setIsLoadingPopular(false);
      }
    });

    return () => { isMounted = false; };
  }, [activeTab, map, searchLat, searchLng, activeTrip?.name, activeTripId]);

  // 🎨 Custom SVG Marker Generator - Clean Circle for Native Labeling
  const getMarkerIcon = (color, isFocused) => {
    if (!window.google) return null;

    const svg = `
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="white" fill-opacity="0.9" />
        <circle cx="20" cy="20" r="15" fill="${color}" fill-opacity="${isFocused ? '1' : '0.3'}" />
      </svg>
    `;

    const encoded = window.btoa(unescape(encodeURIComponent(svg)));

    return {
      url: `data:image/svg+xml;base64,${encoded}`,
      scaledSize: new window.google.maps.Size(36, 36),
      anchor: new window.google.maps.Point(18, 18),
      labelOrigin: new window.google.maps.Point(18, 18) // Center the native label
    };
  };

  // 🛡️ GUARANTEED ARRAY DEFENSE: Protect against non-array cache, state, or legacy localStorage formats
  const safeSavedPlaces = Array.isArray(savedPlaces) ? savedPlaces : [];
  const safeAiNearbyPlaces = Array.isArray(aiNearbyPlaces) ? aiNearbyPlaces : [];
  const safeLivePopularPlaces = Array.isArray(livePopularPlaces) ? livePopularPlaces : [];

  const displayedExplorationPlaces = useMemo(() => {
    if (isLoadingPopular) return [];
    if (searchQuery.trim()) {
      return [...safeSavedPlaces, ...safeAiNearbyPlaces, ...safeLivePopularPlaces].filter(p =>
        (p?.name || p?.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p?.desc || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (activeTab === "drafts" || activeTab === "saved") {
      return safeSavedPlaces;
    }
    return [...safeAiNearbyPlaces, ...safeLivePopularPlaces];
  }, [isLoadingPopular, searchQuery, safeSavedPlaces, safeAiNearbyPlaces, safeLivePopularPlaces, activeTab]);

  return (
    <div className="flex-1 w-full bg-slate-50 font-sans grid grid-cols-1 lg:grid-cols-[450px_1fr_400px] gap-6 p-4 sm:px-6 sm:pt-6 sm:pb-4 overflow-hidden no-scrollbar min-h-0">
      <SEO
        title="Trip Planner"
        url="/planner"
        description="Organize your travel itinerary with our interactive trip planner. Drag and drop activities, view routes on the map, and manage your daily travel schedule effortlessly."
        keywords="trip planner, travel itinerary, travel map, trip organizer, vacation planner"
      />

      <DragDropContext onDragEnd={onDragEnd}>

        {/* --- LEFT CARD: ITINERARY --- */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col overflow-visible h-[600px] lg:h-full relative z-10 border border-slate-200/50 min-h-0"
        >
          {/* Fixed Header */}
          <div className="p-6 pb-2 shrink-0 bg-white/50 backdrop-blur-md z-20 rounded-[40px]">
            <div className="flex flex-col gap-4 mb-4">
              {/* Header Row: Title/Selector & Plan Controls */}
              <div className="flex items-center justify-between relative z-30">
                <div className="flex flex-col">
                  <h2 className="text-[28px] font-bold text-slate-800 tracking-tight">Itinerary</h2>

                  {/* Current Trip Display */}

                </div>


                {/* CONTROL POSITION: Adjust 'translate-y-[0px]' to move these buttons up or down */}
                <div className="flex items-center gap-2 relative translate-y-[-4px]">
                  {/* Save Changes Button */}
                  {planMode === 'user' && (
                    <button
                      onClick={saveChanges}
                      disabled={!hasUnsavedChanges || isSaving}
                      className={`px-4 h-9 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${hasUnsavedChanges
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 scale-105'
                        : 'bg-slate-100/50 text-slate-400 border border-slate-200/50 hover:bg-slate-100 cursor-not-allowed'
                        }`}
                    >
                      <Save size={14} className={isSaving ? "animate-pulse" : ""} />
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  )}

                  {/* Plan Actions Filter Button */}
                  {planMode === 'user' && (
                    <Dropdown
                      width="w-52"
                      trigger={
                        <button
                          className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all border outline-none relative bg-white border-slate-200 text-slate-400 hover:border-slate-300 shadow-sm`}
                          title="Plan Actions & History"
                        >
                          <SlidersHorizontal size={14} strokeWidth={2.5} />
                          {activeTrip?.isModified && (
                            <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-sky-500 rounded-full border-2 border-white shadow-sm" />
                          )}
                        </button>
                      }
                    >
                      {({ close }) => (
                        <div className="py-3">
                          <div className="px-4 pb-2.5 border-b border-slate-50 mb-1.5">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${isModified ? 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)] animate-pulse' : 'bg-slate-300'}`} />
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] whitespace-nowrap">
                                {isModified ? 'Status: Modified' : 'Status: Original'}
                              </span>
                            </div>
                          </div>

                          <div className="px-2 space-y-1">
                            {(isModified || activeTrip?.itinerary) ? (
                              <>
                                <button
                                  onClick={() => undo()}
                                  disabled={history.length === 0}
                                  className={`w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold rounded-xl transition-all group ${history.length > 0 ? 'text-slate-600 hover:bg-slate-50' : 'text-slate-300 pointer-events-none'}`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <Undo2 size={13} className={history.length > 0 ? 'text-slate-400 group-hover:text-sky-600' : 'text-slate-200'} />
                                    <span>Undo Edit</span>
                                  </div>
                                  {history.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-sky-400/20" />}
                                </button>
                                <button
                                  onClick={() => { restorePlan(); close(); }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all group"
                                >
                                  <RotateCcw size={13} className="text-slate-600 group-hover:rotate-180 transition-transform duration-500" />
                                  <span>Restore to AI</span>
                                </button>
                              </>
                            ) : (
                              <div className="px-3 py-4 text-center">
                                <p className="text-[10px] font-medium text-slate-400 leading-relaxed italic">
                                  Your plan matches the AI version.<br />Make edits to see history.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Dropdown>
                  )}
                </div>
              </div>

              {/* Row 2: Centered Plan Toggle */}
              <div className="flex justify-center relative z-20">
                <div className="flex p-1 bg-slate-100/30 backdrop-blur-md rounded-2xl border border-slate-200/50 shadow-sm h-9 items-center">
                  <button
                    onClick={() => setPlanMode('ai')}
                    className={`h-full px-4 text-[9.5px] font-black rounded-2xl transition-all flex items-center gap-2 ${planMode === 'ai' ? 'bg-white shadow-sm text-slate-600 border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    AI PLAN
                  </button>
                  <button
                    onClick={() => setPlanMode('user')}
                    className={`h-full px-4 text-[9.5px] font-black rounded-2xl transition-all flex items-center gap-2 ${planMode === 'user' ? 'bg-white shadow-sm text-slate-600 border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    YOUR PLAN
                  </button>
                </div>
              </div>

              {/* Row 3: Integrated Day Filter Container */}
              <div className="p-2 bg-slate-100/20 backdrop-blur-md rounded-2xl border border-slate-200 shadow-md relative z-10">

                <div className="flex gap-1 overflow-x-auto scrollbar-hide items-center no-scrollbar">


                  <button
                    onClick={() => setSelectedDayId("all")}
                    className={`flex-shrink-0 px-5 py-1.5 text-xs font-semibold rounded-full border whitespace-nowrap transition ${selectedDayId === "all"
                      ? "bg-sky-600 text-white border-sky-500 shadow-lg shadow-sky-100"
                      : "bg-white text-slate-600 border-slate-300 hover:border-sky-400"
                      }`}
                  >
                    All Days
                  </button>

                  {displayDayOrder.map(dayId => {
                    const day = displayDays[dayId];
                    if (!day) return null;
                    const isActive = selectedDayId === dayId;
                    return (
                      <button
                        key={dayId}
                        onClick={() => setSelectedDayId(dayId)}
                        className={`flex-shrink-0 px-4 py-1.5 text-xs font-semibold rounded-full border whitespace-nowrap transition ${isActive
                          ? "text-white shadow-lg shadow-sky-100"
                          : "bg-white text-slate-600 border-slate-300 hover:border-sky-400"
                          }`}
                        style={isActive ? { backgroundColor: day.color, borderColor: day.color } : {}}
                      >
                        {day.date}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Timeline Container - Wrapped in Box to match Chat */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2 sm:px-4 no-scrollbar">

            <div className="bg-white rounded-[32px] shadow-2xl border border-slate-200 p-3 sm:p-5 space-y-2 min-h-full py-2 pb-6 relative overflow-hidden">

              <AnimatePresence>
                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm rounded-[32px] p-6 space-y-8 overflow-hidden pointer-events-none"
                  >
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-px flex-1 bg-slate-100" />
                          <div className="w-24 h-6 bg-slate-100 rounded-full animate-pulse" />
                          <div className="h-px flex-1 bg-slate-100" />
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-full animate-pulse" />
                          <div className="flex-1 space-y-2">
                            <div className="w-1/3 h-3 bg-slate-100 rounded-full animate-pulse" />
                            <div className="w-3/4 h-4 bg-slate-100 rounded-full animate-pulse shadow-sm" />
                            <div className="w-1/2 h-2 bg-slate-50 rounded-full animate-pulse" />
                          </div>
                        </div>
                        <div className="flex items-start gap-4 ml-6 border-l-2 border-slate-50 pl-8">
                          <div className="w-8 h-8 bg-slate-50 rounded-full animate-pulse" />
                          <div className="flex-1 space-y-2">
                            <div className="w-1/4 h-2 bg-slate-50 rounded-full animate-pulse" />
                            <div className="w-1/2 h-3 bg-slate-50 rounded-full animate-pulse" />
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="absolute inset-x-0 bottom-60 flex flex-col items-center gap-3">
                      <div className="flex items-center gap-2 px-4 py-3 bg-sky-600 text-white rounded-full text-sm font-bold shadow-xl animate-bounce">
                        <Sparkles size={14} className="animate-spin-slow" />
                        AI is crafting your journey...
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Optimizing routes & finding stays
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Empty State for AI Plan */}
              {planMode === 'ai' && displayDayOrder.length === 0 && !isGenerating && (
                <div className="flex flex-col items-center justify-center py-25 text-center">
                  <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mb-6">
                    <Sparkles className="text-sky-600" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">No AI Plan Yet</h3>
                  <p className="text-sm text-slate-500 max-w-xs mb-8">
                    Go to Chat to start a new trip and let our AI craft a perfect itinerary for you!
                  </p>
                  <button
                    onClick={() => navigate('/chat')}
                    className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-slate-800 transition shadow-lg shadow-slate-200 cursor-pointer"
                  >
                    Start a Trip in Chat
                  </button>
                </div>
              )}

              {/* Empty State for Your Plan */}
              {planMode === 'user' && displayDayOrder.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <Rocket className="text-slate-600" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Your Plan is Empty</h3>
                  <p className="text-sm text-slate-500 max-w-xs mb-8">
                    Start building your journey! You can add places from Explore or head to Chat to let AI generate a reference plan for you.
                  </p>
                  <div className="flex gap-4 justify-center items-center">
                    <button
                      onClick={() => navigate('/explore')}
                      className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-full font-bold text-sm hover:bg-slate-50 transition shadow-sm cursor-pointer"
                    >
                      Browse Explore
                    </button>
                    <button
                      onClick={() => navigate('/chat')}
                      className="px-6 py-3 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-slate-800 transition shadow-lg shadow-slate-200 cursor-pointer"
                    >
                      Ask AI in Chat
                    </button>
                  </div>
                </div>
              )}



              {visibleDays.map((dayId, dayIdx) => {
                const day = displayDays[dayId];
                if (!day) return null;
                const isCollapsed = collapsedDays[dayId];

                return (
                  <div key={dayId} className="relative">
                    {/* Day Header - SPACING CONTROL: Change 'mb-3' to move activities closer to header */}
                    <div
                      onClick={() => toggleCollapse(dayId)}
                      className="flex items-center gap-3 mb-3 cursor-pointer group"
                    >
                      <div className="h-px flex-1 bg-slate-100" />
                      <div className="bg-sky-50 border border-sky-100 px-4 py-1.5 rounded-full flex items-center gap-2 transition-all group-hover:bg-sky-50 group-hover:border-sky-100">
                        <span className="text-[10px] font-extrabold text-sky-600 uppercase tracking-widest">
                          Day {dayIdx + 1}
                        </span>
                      </div>
                      <div className="h-px flex-1 bg-slate-100" />
                    </div>

                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden w-full min-w-0"
                        >
                          <Droppable droppableId={dayId} type="item">
                            {(provided, snapshot) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={`transition-all min-h-[10px] pb-1 w-full min-w-0 ${snapshot.isDraggingOver ? "bg-slate-50/50 rounded-3xl ring-2 ring-dashed ring-slate-200" : ""
                                  }`}
                              >
                                {/* ⛺ Base Camp Morning Start */}
                                {baseCampHotel && day.items?.length > 0 && (
                                  <div className="flex gap-2.5 sm:gap-4 items-stretch opacity-75 w-full min-w-0">
                                    <div className="flex flex-col items-center shrink-0">
                                      <div className="h-5 w-5 rounded-full border-2 border-slate-300 bg-white flex items-center justify-center shrink-0 mt-4">
                                        <Hotel size={10} className="text-slate-400" />
                                      </div>
                                      <div className="flex-1 relative flex justify-center mt-1 w-full min-h-[40px]">
                                        <div className="w-px h-full border-l-2 border-dotted border-slate-200 absolute left-1/2 -translate-x-1/2" />
                                        {logistics[`basecamp-start-${dayId}_${day.items[0].id}`] && (
                                          <div className="absolute top-1/2 -translate-y-1/2 bg-white border border-slate-200 text-slate-500 text-[9px] px-2 py-0.5 rounded-full flex items-center shadow-sm whitespace-nowrap z-10 font-bold tracking-tight">
                                            🚙 {logistics[`basecamp-start-${dayId}_${day.items[0].id}`].duration}m
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col bg-white rounded-2xl p-4 sm:px-5 sm:py-4 border border-slate-100 mb-4 items-start justify-center overflow-hidden">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Morning Start</p>
                                      <p className="text-sm font-extrabold text-slate-700 truncate min-w-0 w-full">{baseCampHotel.name}</p>
                                    </div>
                                  </div>
                                )}

                                {day.items?.map((item, index) => {
                                  const isLastInDay = index === (day.items?.length || 1) - 1;
                                  const isLastDay = dayId === displayDayOrder[displayDayOrder.length - 1];
                                  const nextItem = !isLastInDay ? day.items[index + 1] : null;
                                  const logisticsData = nextItem ? logistics[`${item.id}_${nextItem.id}`] : null;
                                  const Icon = getItemIcon(item.type?.toLowerCase());

                                  return (
                                    <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={isReadOnly}>
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className="flex gap-2 sm:gap-3.5 items-stretch w-full min-w-0"
                                        >
                                          {/* ── TIMELINE COLUMN ── */}
                                          <div className="flex flex-col items-center shrink-0">
                                            <div className="h-5 w-5 rounded-full border-2 border-sky-600 bg-sky-50 flex items-center justify-center shrink-0 mt-4">
                                              <Icon size={10} className="text-sky-600" />
                                            </div>
                                            {(!isLastInDay || (isLastInDay && baseCampHotel)) && (
                                              <div className="flex-1 relative flex justify-center mt-1 w-full min-h-[40px]">
                                                <div className="w-px h-full border-l-2 border-dotted border-sky-300 absolute left-1/2 -translate-x-1/2" />

                                                {/* Logic for connecting to next item OR the evening base camp return */}
                                                {(() => {
                                                  const badgeData = isLastInDay && baseCampHotel
                                                    ? logistics[`${item.id}_basecamp-end-${dayId}`]
                                                    : logisticsData;

                                                  if (!badgeData) return null;
                                                  return (
                                                    <div className="absolute top-1/2 -translate-y-1/2 bg-white border border-sky-200 text-sky-600 text-[9px] px-2 py-0.5 rounded-full flex items-center shadow-sm whitespace-nowrap z-10 font-bold tracking-tight">
                                                      🚙 {badgeData.duration}m ({badgeData.distance}km)
                                                    </div>
                                                  );
                                                })()}
                                              </div>
                                            )}
                                          </div>

                                          {/* ── ACTIVITY CARD ── */}
                                          <div
                                            onClick={() => setSelectedPlace(item)}
                                            onMouseEnter={() => setHoveredMarkerId(item.id)}
                                            onMouseLeave={() => setHoveredMarkerId(null)}
                                            className={`group relative flex-1 min-w-0 flex flex-col bg-white rounded-2xl p-4 sm:px-5 sm:py-4 shadow-xl border border-sky-100 hover:shadow-2xl hover:-translate-y-1 transition-all mb-4 cursor-pointer overflow-hidden ${snapshot.isDragging ? "rotate-2 scale-105 z-50 shadow-2xl ring-2 ring-sky-400" : ""
                                              } ${selectedPlace?.id === item.id ? "ring-2 ring-sky-400 shadow-md" : ""}`}
                                          >



                                            {/* 🔹 TOP ROW: Image + Essential Info */}
                                            <div className="flex gap-3 min-w-0 w-full">
                                              {/* Image Thumbnail */}
                                              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 relative shadow-sm border border-slate-100">
                                                <img
                                                  src={item.img || `https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=200&auto=format&fit=crop`}
                                                  alt={item.title}
                                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                              </div>

                                              {/* Content Area */}
                                              <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-sky-600 font-bold uppercase tracking-wider mb-1 min-w-0">
                                                  {editingTimeId === item.id ? (
                                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                      <input
                                                        type="text"
                                                        autoFocus
                                                        className="w-20 px-2 py-0.5 text-[10px] font-bold text-sky-600 bg-white border border-sky-200 rounded-lg outline-none ring-2 ring-sky-50 shadow-sm"
                                                        defaultValue={item.time}
                                                        onKeyDown={(e) => {
                                                          if (e.key === 'Enter') updateItemTime(dayId, item.id, e.target.value);
                                                          if (e.key === 'Escape') setEditingTimeId(null);
                                                        }}
                                                        onBlur={(e) => updateItemTime(dayId, item.id, e.target.value)}
                                                      />
                                                    </div>
                                                  ) : (
                                                    <span
                                                      onClick={(e) => {
                                                        if (!isReadOnly) {
                                                          e.stopPropagation();
                                                          setEditingTimeId(item.id);
                                                        }
                                                      }}
                                                      className="hover:text-sky-400 transition-colors shrink-0"
                                                    >
                                                      {item.time || "No Time"}
                                                    </span>
                                                  )}
                                                  <span>•</span>
                                                  <div className="flex items-center gap-1 min-w-0">
                                                    {(item.type === 'Hotel' || item.type === 'HOTEL') && <Hotel size={10} className="text-amber-500 shrink-0" />}
                                                    {(item.type === 'Food' || item.type === 'FOOD') && <Utensils size={10} className="text-emerald-500 shrink-0" />}
                                                    {(item.type === 'Sightseeing' || item.type === 'SIGHTSEEING' || item.type === 'ACTIVITY') && <Camera size={10} className="text-sky-500 shrink-0" />}
                                                    {(item.type === 'FLIGHT' || item.type === 'DEPARTURE' || item.type === 'ARRIVAL') && <Plane size={10} className="text-blue-500 shrink-0" />}
                                                    {(item.type === 'TRANSPORT') && <Navigation size={10} className="text-slate-500 shrink-0" />}
                                                    <span className="capitalize truncate min-w-0">{item.type?.toLowerCase() || "Activity"}</span>
                                                  </div>
                                                </div>

                                                <h4 className="font-bold text-slate-800 text-[14px] leading-tight group-hover:text-sky-700 transition-colors break-words min-w-0">{item.title}</h4>

                                                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium min-w-0">
                                                  <MapPin size={10} className="text-slate-300 shrink-0" />
                                                  <span className="truncate min-w-0 flex-1">{item.location}</span>
                                                </div>

                                                {item.price_range && (
                                                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 mt-1 min-w-0">
                                                    <DollarSign size={10} className="text-slate-400 shrink-0" />
                                                    <span className="truncate min-w-0">{item.price_range}</span>
                                                  </div>
                                                )}
                                              </div>

                                              {/* Action Buttons */}
                                              {!isReadOnly && (
                                                <button
                                                  className="opacity-40 group-hover:opacity-100 p-2 sm:p-2.5 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all shrink-0 self-start"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteItem(dayId, item.id);
                                                  }}
                                                >
                                                  <Trash2 size={15} />
                                                </button>
                                              )}
                                            </div>

                                            {/* 🔥 BOTTOM ROW: Full-width Booking Hint Strip */}
                                            {item.booking_hint && (
                                              <div className="mt-3 p-3 rounded-xl bg-sky-50 border border-sky-100/50 flex items-start gap-2 shadow-sm group-hover:bg-sky-100/30 transition-colors min-w-0 w-full">
                                                <Sparkles size={14} className="text-sky-500 shrink-0 mt-0.5" />
                                                <p className="text-[10px] text-sky-800 leading-relaxed font-semibold italic min-w-0 flex-1 break-words">
                                                  {item.booking_hint}
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  );
                                })}
                                {provided.placeholder}

                                {/* ⛺ Base Camp Evening Return */}
                                {baseCampHotel && day.items?.length > 0 && (
                                  <div className="flex gap-4 items-stretch opacity-75">
                                    <div className="flex flex-col items-center">
                                      <div className="h-5 w-5 rounded-full border-2 border-slate-300 bg-white flex items-center justify-center shrink-0 mt-4">
                                        <Hotel size={10} className="text-slate-400" />
                                      </div>
                                      <div className="flex-1 relative flex justify-center mt-1 w-full min-h-[40px]">
                                        <div className="w-px h-full border-l-2 border-dotted border-slate-200 absolute left-1/2 -translate-x-1/2" />
                                      </div>
                                    </div>
                                    <div className="flex-1 flex flex-col bg-white rounded-2xl px-6 py-4 border border-slate-100 mb-4 items-start justify-center">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Evening Return</p>
                                      <p className="text-sm font-extrabold text-slate-700">{baseCampHotel.name}</p>
                                    </div>
                                  </div>
                                )}

                                {(day.items?.length || 0) === 0 && (
                                  <div
                                    onClick={() => navigate('/explore')}
                                    className="cursor-pointer group flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-200/60 rounded-2xl bg-slate-50/50 hover:bg-sky-50 hover:border-sky-200 transition-all"
                                  >
                                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-sky-500 transition-colors mb-3">
                                      <Search size={18} />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest group-hover:text-sky-600 transition-colors">
                                      Go to explore to add places
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </Droppable>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

            </div>
          </div>
        </motion.div>

        {/* --- CENTER CARD: DYNAMIC EXPERIENCE VIEW --- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/60 backdrop-blur-2xl rounded-[40px] shadow-2xl border border-white/50 h-[500px] lg:h-full p-4 sm:p-8 flex flex-col z-0 relative group/center min-h-0"
        >
          <AnimatePresence mode="wait">
            {selectedPlace ? (
              // --- PLACE MODE ---
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex flex-col bg-slate-100/50 rounded-[32px] overflow-hidden p-3"
              >
                <div className="w-full h-full flex flex-col bg-white rounded-[24px] overflow-hidden shadow-sm ring-1 ring-black/5">
                  {/* 1. VISUAL HEADER (Fixed Top) */}
                  <div className="h-[40%] shrink-0 relative group/image">
                    <img src={selectedPlace.img} className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-105" />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

                    {/* Back Button */}
                    <div className="absolute top-6 left-6 z-50">
                      <button
                        onClick={() => setSelectedPlace(null)}
                        className="bg-white/90 backdrop-blur-md hover:bg-white text-slate-800 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-lg border border-white/50 flex items-center gap-2 group/btn"
                      >
                        <ArrowLeft size={16} className="group-hover/btn:-translate-x-1 transition-transform" /> Back
                      </button>
                    </div>

                    {/* Title Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider shadow-sm">
                          {selectedPlace.category || "Place"}
                        </span>
                      </div>
                      <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none mb-2 drop-shadow-md">
                        {selectedPlace.title}
                      </h1>
                      <p className="text-white/90 text-sm font-medium flex items-center gap-2 drop-shadow-sm">
                        <MapPin size={14} className="text-sky-400 fill-sky-400" /> {selectedPlace.location}
                      </p>
                    </div>
                  </div>

                  {/* 2. SCROLLABLE CONTENT (Cards Layout) */}
                  <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
                    <div className="space-y-4 pb-16">

                      {/* Description Card */}
                      <div>
                        <div className="flex items-center justify-between mb-3 px-1">
                          <h3 className="text-[11px] font-extrabold text-sky-600 uppercase tracking-widest">Overview</h3>
                          <button
                            onClick={() => {
                              const pos = selectedPlace.pos || selectedPlace.coords;
                              if (pos && map) {
                                map.panTo({ lat: Number(pos[0]), lng: Number(pos[1]) });
                                map.setZoom(16);
                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${pos[0]},${pos[1]}`, '_blank');
                                setSelectedPlace(null);
                              }
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-bold shadow-md hover:bg-slate-800 transition-all group/nav"
                          >
                            <Navigation size={10} className="group-hover/nav:-translate-y-0.5 transition-transform" /> Get Directions
                          </button>
                        </div>
                        <div className="bg-white p-4 rounded-[24px] shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50">
                          <p className="text-slate-600 text-[15px] leading-relaxed font-medium">
                            {selectedPlace.desc || "Experience the unique atmosphere of this location. Perfect for travelers looking to immerse themselves in local culture and history. A true gem in the heart of the city."}
                          </p>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Cost */}
                        <div className="bg-white p-4 rounded-[24px] shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center shrink-0 border border-sky-100">
                            <DollarSign size={20} />
                          </div>
                          <div>
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Cost</h4>
                            <p className="text-base font-bold text-slate-800">{selectedPlace.cost || "Free"}</p>
                          </div>
                        </div>

                        {/* Duration */}
                        <div className="bg-white p-4 rounded-[24px] shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0 border border-purple-100">
                            <Clock size={20} />
                          </div>
                          <div>
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Duration</h4>
                            <p className="text-base font-bold text-slate-800">{selectedPlace.duration || "1-2h"}</p>
                          </div>
                        </div>

                        {/* Best Time */}
                        <div className="bg-white p-4 rounded-[24px] shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 border border-amber-100">
                            <Calendar size={20} />
                          </div>
                          <div>
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Best Time</h4>
                            <p className="text-base font-bold text-slate-800">{selectedPlace.bestTime || "Anytime"}</p>
                          </div>
                        </div>

                        {/* Type */}
                        <div className="bg-white p-4 rounded-[24px] shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-100">
                            <Tag size={20} />
                          </div>
                          <div>
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Type</h4>
                            <p className="text-base font-bold text-slate-800">{selectedPlace.category || "General"}</p>
                          </div>
                        </div>
                      </div>

                      {/* CTAs - Removed as requested */}
                      <div className="pt-2"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              // --- MAP MODE ---
              <motion.div
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex flex-col bg-slate-100/50 rounded-[32px] overflow-hidden p-3"
              >
                <div className="w-full h-full flex flex-col bg-white rounded-[24px] overflow-hidden shadow-sm ring-1 ring-black/5">
                  {/* 1. VISUAL CARD (Map) */}
                  <div className="flex-1 relative z-0">
                    {isLoaded && !mapAuthFailed ? (
                      <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={mapMarkers.length > 0 && mapMarkers[0]?.pos ? { lat: Number(mapMarkers[0].pos[0]), lng: Number(mapMarkers[0].pos[1]) } : (destinationCoords || { lat: 19.8135, lng: 85.8312 })}
                        zoom={13}
                        options={mapOptions}
                        onLoad={map => setMap(map)}
                      >
                        {/* 🛣️ Real Road Paths (When a day is focused) */}
                        {directions && (
                          <DirectionsRenderer
                            directions={directions}
                            options={{
                              suppressMarkers: true,
                              polylineOptions: {
                                strokeColor: '#0284c7',
                                strokeWeight: 5,
                                strokeOpacity: 0.8
                              }
                            }}
                          />
                        )}

                        {/* 1. Day-level Polylines (Show only if no directions) */}
                        {!directions && mapPolylines.map((route, idx) => (
                          <Polyline
                            key={`${route.dayId}-${idx}`}
                            path={route.coords.map(c => ({ lat: c[0], lng: c[1] }))}
                            options={{
                              strokeColor: route.color,
                              strokeOpacity: route.isFocused ? 0.8 : 0.1,
                              strokeWeight: route.isFocused ? 4 : 2,
                              icons: route.isFocused ? [{
                                icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 4 },
                                offset: '0',
                                repeat: '20px'
                              }] : []
                            }}
                          />
                        ))}

                        {/* 2. Global Trip Path */}
                        {mapMarkers.length > 1 && (
                          <Polyline
                            path={mapMarkers.map(m => ({ lat: m.pos[0], lng: m.pos[1] }))}
                            options={{
                              strokeColor: '#0284c7',
                              strokeOpacity: selectedDayId === 'all' ? 0.6 : 0.1,
                              strokeWeight: 2
                            }}
                          />
                        )}

                        {/* 3. Numbered Markers */}
                        {(() => {

                          return mapMarkers.map((marker) => (
                            <MarkerF
                              key={`${marker.dayId}-${marker.id}-${marker.number}`}
                              position={{ lat: Number(marker.pos[0]), lng: Number(marker.pos[1]) }}
                              onClick={() => setSelectedPlace(marker)}
                              zIndex={marker.isFocused ? 1000 : 1}
                              icon={getMarkerIcon(marker.dayColor || '#0284c7', marker.isFocused)}
                              label={{
                                text: marker.number.toString(),
                                color: '#1e293b', // Slate 800 for high contrast
                                fontWeight: '900',
                                fontSize: '13px',
                                fontFamily: 'Inter, sans-serif'
                              }}
                            />
                          ));
                        })()}
                      </GoogleMap>
                    ) : (loadError || mapAuthFailed) ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-slate-100 overflow-hidden rounded-[24px]">
                        <img
                          src="https://external-preview.redd.it/google-maps-finally-added-regional-rail-to-the-transit-layer-v0-MZ-ySPYQOib7lHk2tEkyudX6f1BUCeYx42ETnX2nio4.png?width=1080&crop=smart&auto=webp&s=20ef66d68e89d4d3f1c6f17aee7ae472644503e5"
                          alt="Map Error"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
                        <p className="text-sm font-bold text-slate-400">Loading Maps...</p>
                      </div>
                    )}

                    {/* ⛺ BASE CAMP FABS */}
                    <div className="absolute top-4 left-4 z-[400] flex gap-2">
                      <button
                        onClick={() => setBaseCampMode('hotel')}
                        className={`px-3 py-2 rounded-xl shadow-md font-bold flex items-center gap-2 border transition-all ${baseCampHotel ? 'bg-sky-600 text-white border-sky-700' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'}`}
                      >
                        <Hotel size={16} />
                        <span className="text-xs">{baseCampHotel ? 'Hotel' : 'Add Hotel'}</span>
                      </button>
                      <button
                        onClick={() => setBaseCampMode('station')}
                        className={`px-3 py-2 rounded-xl shadow-md font-bold flex items-center gap-2 border transition-all ${baseCampStation ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'}`}
                      >
                        <Train size={16} />
                        <span className="text-xs">{baseCampStation ? 'Arrival' : 'Add Arrival'}</span>
                      </button>
                    </div>

                    {/* ⛺ BASE CAMP POPUP */}
                    <AnimatePresence>
                      {baseCampMode && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-16 left-4 right-16 z-[500] bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 max-w-sm"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                              {baseCampMode === 'hotel' ? <Hotel size={16} className="text-sky-600" /> : <Train size={16} className="text-sky-600" />}
                              Where are you {baseCampMode === 'hotel' ? 'staying' : 'arriving'}?
                            </h3>
                            <button onClick={() => setBaseCampMode(null)} className="text-slate-400 hover:text-slate-600">
                              <Undo2 size={16} />
                            </button>
                          </div>
                          {isLoaded && (
                            <Autocomplete onLoad={handleBaseCampLoad} onPlaceChanged={handleBaseCampPlaceChanged}>
                              <input
                                type="text"
                                placeholder={`Search for your ${baseCampMode}...`}
                                value={baseCampSearch}
                                onChange={(e) => setBaseCampSearch(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-sky-400 transition-all shadow-inner"
                              />
                            </Autocomplete>
                          )}
                          <p className="text-[10px] text-slate-500 mt-2 font-medium">
                            Based on your route, we recommend staying centrally to minimize travel.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Map Controls */}
                    <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
                      <button
                        onClick={() => map?.setZoom((map.getZoom() || 13) + 1)}
                        className="w-9 h-9 bg-white rounded-xl shadow-md text-slate-600 flex items-center justify-center hover:bg-slate-50 font-bold border border-slate-100 transition-transform active:scale-95"
                      >
                        +
                      </button>
                      <button
                        onClick={() => map?.setZoom((map.getZoom() || 13) - 1)}
                        className="w-9 h-9 bg-white rounded-xl shadow-md text-slate-600 flex items-center justify-center hover:bg-slate-50 font-bold border border-slate-100 transition-transform active:scale-95"
                      >
                        -
                      </button>
                    </div>
                  </div>

                  {/* 2. SUMMARY SECTION (Below) */}
                  <div className="bg-white p-5 shrink-0 border-t border-slate-200 z-10 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
                          <MapPin size={24} />
                        </div>
                        <div>
                          <h2 className="text-lg font-extrabold text-sky-800">{activeTrip?.name || "Your Trip"}</h2>
                          <p className="text-xs text-slate-500 font-bold mt-0.5">{displayDayOrder.length} Days • 14.2 km</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Stops</span>
                          <span className="text-sm font-extrabold text-slate-800">
                            {Object.values(displayDays).reduce((sum, d) => sum + (d?.items?.length || 0), 0)}
                          </span>
                        </div>
                        <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Days</span>
                          <span className="text-sm font-extrabold text-slate-800">{displayDayOrder.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* --- RIGHT CARD: EXPLORE --- */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl flex flex-col overflow-hidden h-[500px] lg:h-full z-10 transition-all min-h-0 ${isReadOnly ? 'grayscale-[0.5] opacity-60 pointer-events-none' : ''}`}
        >
          {/* Header & Tabs */}
          <div className="p-6 pb-2 shrink-0 bg-white/50 backdrop-blur-md z-20">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Add to Itinerary</h2>

            <div className="relative group mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500 transition-colors" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search places in ${activeTrip?.name?.split(' ')[0] || 'your destination'}...`}
                className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-medium outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all shadow-sm"
              />
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl">
              {['drafts', 'popular'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all duration-300 ${activeTab === tab
                    ? "bg-white text-sky-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                    }`}
                >
                  {tab === 'drafts' ? 'Drafts & Saved' : 'Popular Spots'}
                </button>
              ))}
            </div>
          </div>

          {/* Places List & Droppable Pocket */}
          <div className="flex-1 overflow-y-auto px-4 pb-6 no-scrollbar">
            <Droppable droppableId="place-pool">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`space-y-4 pt-2 min-h-[180px] rounded-3xl transition-all ${snapshot.isDraggingOver ? "bg-amber-50/60 p-2 border-2 border-dashed border-amber-400" : ""
                    }`}
                >
                  {searchQuery.trim() && (
                    <div className="px-1 mb-2">
                      <p className="text-[11px] font-bold text-slate-400">
                        Results for <span className="text-sky-600">“{searchQuery}”</span>
                      </p>
                    </div>
                  )}

                  {/* EMPTY STATE FOR SAVED & DRAFTS */}
                  {!searchQuery.trim() && (activeTab === "drafts" || activeTab === "saved") && safeSavedPlaces.length === 0 && (
                    <div className="flex flex-col items-center justify-center mt-6 py-8 px-6 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                      <h3 className="text-base font-extrabold text-slate-800 mb-2">Your drafts pocket is empty!</h3>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mb-5 max-w-[230px]">
                        Drag activities here from your timeline on the left to unschedule them, or discover new places to stage them before adding to a day!
                      </p>
                    </div>
                  )}

                  {/* LOADING STATE FOR POPULAR SPOTS */}
                  {(activeTab === "popular" || activeTab === "nearby") && isLoadingPopular && (
                    <div className="flex flex-col items-center justify-center py-10 px-6 text-center bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-100/80 my-2">
                      <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin mb-3" />
                      <p className="text-xs font-bold text-slate-700">Curating top attractions & dining...</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">Combining Google Places prominence with Unsplash imagery 🎨</p>
                    </div>
                  )}

                  {/* EMPTY STATE FOR POPULAR SPOTS */}
                  {!isLoadingPopular && (activeTab === "popular" || activeTab === "nearby") && safeAiNearbyPlaces.length === 0 && safeLivePopularPlaces.length === 0 && !searchQuery.trim() && (
                    <div className="flex flex-col items-center justify-center mt-4 py-8 px-6 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                      <h3 className="text-sm font-extrabold text-slate-700 mb-1">No spots found nearby</h3>
                      <p className="text-xs text-slate-400">Try zooming out on the map to expand your exploration radius.</p>
                    </div>
                  )}

                  {displayedExplorationPlaces.map((place, idx) => (
                    <Draggable
                      key={place.id || `place-${idx}`}
                      draggableId={String(place.id || `place-${idx}`)}
                      index={idx}
                      isDragDisabled={activeTab !== "drafts" && activeTab !== "saved"}
                    >
                      {(dragProvided, dragSnapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          {...dragProvided.dragHandleProps}
                          onClick={() => setSelectedPlace(place)}
                          className={`group bg-white rounded-[24px] p-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-slate-100 cursor-pointer ${dragSnapshot.isDragging ? "opacity-95 scale-[1.03] z-50 shadow-2xl border-sky-400" : ""
                            }`}
                        >
                          {/* Image or Activity Banner */}
                          {place.img ? (
                            <div className="relative h-32 w-full rounded-2xl overflow-hidden mb-3 group-hover:shadow-md transition-shadow">
                              <img src={place.img} alt={place.name || place.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                              {place.rating && (
                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm flex items-center gap-1">
                                  <Star size={10} className="text-amber-500 fill-amber-500" /> {place.rating}
                                </div>
                              )}
                              {place.category && (
                                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-white text-[10px] font-bold">
                                  {place.category}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-16 w-full rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100/60 mb-3 flex items-center justify-between px-4">
                              <div className="flex items-center gap-2">
                                <MapPin className="text-sky-600 w-5 h-5" />
                                <span className="text-xs font-extrabold text-sky-900 uppercase tracking-wider">{place.type || 'Activity'}</span>
                              </div>
                              <span className="text-[10px] font-bold bg-white/80 px-2 py-1 rounded-md text-slate-600 shadow-2xs">Staged Draft</span>
                            </div>
                          )}

                          <div className="px-1">
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex flex-col">
                                <h4 className="font-bold text-slate-800 text-sm group-hover:text-sky-600 transition-colors">{place.name || place.title || 'Activity'}</h4>
                                {place.aiMatchScore && (
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                                    <span className="text-[9px] font-black italic text-emerald-600 tracking-tighter uppercase">{place.aiMatchScore}% Match</span>
                                  </div>
                                )}
                              </div>
                              {/* Add Action */}
                              <div className="relative flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                {(activeTab === "popular" || activeTab === "nearby") && !placePool.some(p => p.id === place.id || p.name === (place.name || place.title)) && (
                                  <button
                                    onClick={() => {
                                      pushToHistory();
                                      setPlacePool(prev => [{ ...place, id: place.id || `draft-${Date.now()}` }, ...prev]);
                                    }}
                                    title="Save to Drafts & Saved Pocket"
                                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white border border-amber-100/60"
                                  >
                                    <Bookmark size={14} strokeWidth={2.5} />
                                  </button>
                                )}
                                {Object.values(days).some(d => d.items?.some(it => (it.placeId === place.id || it.id === place.id))) ? (
                                  <div className="flex items-center gap-2">
                                    {addFeedback?.id === place.id && (
                                      <span className="text-[10px] font-bold text-emerald-600 animate-pulse">
                                        {addFeedback.dayName} ✓
                                      </span>
                                    )}
                                    <button
                                      disabled
                                      className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center cursor-default shadow-sm border border-emerald-100"
                                    >
                                      <Check size={16} />
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => setAddingPlace({ place, dayId: displayDayOrder[0], time: "10:00 AM" })}
                                      className="w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm group/btn bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white"
                                    >
                                      <Plus size={16} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">{place.desc || place.description || "No details available."}</p>

                            <div className="flex justify-end mt-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedPlace(place); }}
                                className="text-[10px] font-bold text-sky-600 hover:text-sky-700 hover:underline transition-all"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </motion.div>

      </DragDropContext>

      {/* --- ADD PLACE MODAL (ASKING CARD) --- */}
      <AnimatePresence>
        {addingPlace && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAddingPlace(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100"
            >
              {/* Header */}
              <div className="p-6 pb-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-lg">Add to Itinerary</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tight truncate w-48">{addingPlace.place.name}</p>
                  </div>
                </div>
              </div>

              <div className="px-6 space-y-5 py-2">
                {/* Day Selection */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Select Day</p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {displayDayOrder.map(id => (
                      <button
                        key={id}
                        onClick={() => setAddingPlace({ ...addingPlace, dayId: id })}
                        className={`flex-shrink-0 px-4 py-2 rounded-xl text-[11px] font-black transition-all border ${addingPlace.dayId === id
                          ? "bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-100"
                          : "bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300"
                          }`}
                      >
                        {days[id]?.title?.split(':')[0] || "Day"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">What Time?</p>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors">
                      <Clock size={16} />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. 10:00 AM or Evening"
                      value={addingPlace.time}
                      onChange={(e) => setAddingPlace({ ...addingPlace, time: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-[13px] font-bold text-slate-700 outline-none ring-offset-0 focus:ring-2 focus:ring-sky-500/10 focus:border-sky-500/40 transition-all shadow-inner"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 pt-4 flex gap-3">
                <button
                  onClick={() => setAddingPlace(null)}
                  className="flex-1 py-3.5 rounded-2xl bg-slate-50 text-slate-500 text-xs font-black hover:bg-slate-100 transition-all border border-slate-100"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => addToDay(addingPlace.place, addingPlace.dayId, addingPlace.time)}
                  className="flex-[1.5] py-3.5 rounded-2xl bg-sky-600 text-white text-xs font-black hover:bg-sky-700 transition-all shadow-lg shadow-sky-100 active:scale-95"
                >
                  CONFIRM ADD
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div >
  );
}
