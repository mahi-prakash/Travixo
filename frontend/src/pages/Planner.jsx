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
  CheckCircle2,
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
  SlidersHorizontal
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  Polyline,
  InfoWindowF,
  DirectionsRenderer
} from "@react-google-maps/api";

import { motion, AnimatePresence } from 'framer-motion';
import { useTrip } from '../context/TripContext';
import { useUser } from '../context/UserContext';
import Dropdown from '../components/common/Dropdown';
import SEO from '../components/common/SEO';
import { GOOGLE_MAPS_API_KEY } from '../utils/googleMaps';

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

const savedPlaces = [];



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
    libraries: ['places']
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
  const isModified = activeTrip?.itinerary &&
    activeTrip?.ai_itinerary &&
    JSON.stringify(activeTrip.itinerary) !== JSON.stringify(activeTrip.ai_itinerary);

  // 🌍 Dynamic Nearby Places from AI
  const activeItinerary = activeTrip?.itinerary || (itineraryCache || {})[activeTripId] || {};
  const aiNearbyPlaces = activeItinerary.nearby_places || activeTrip?.ai_itinerary?.nearby_places || [];

  const [days, setDays] = useState({});
  const [planMode, setPlanMode] = useState("user");
  const [selectedDayId, setSelectedDayId] = useState("all");
  const [activeTab, setActiveTab] = useState("nearby");
  const [collapsedDays, setCollapsedDays] = useState({});
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [hoveredMarkerId, setHoveredMarkerId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [addingPlace, setAddingPlace] = useState(null);
  const [addFeedback, setAddFeedback] = useState(null);
  const [editingTimeId, setEditingTimeId] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

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
            id: act.id || `item-${dayId}-${aIdx}-${Date.now()}`,
            ...act,
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
            id: act.id || `item-${id}-${aIdx}-${Date.now()}`,
            ...act,
            name: act.title || act.name || "Activity",
          }))
        };
      });
      setDays(normalizedAi);
      hasInitializedRef.current = activeTripId;
      // 🔥 PERSIST: Save the initial copy to DB immediately so it's not null anymore
      saveItineraryToCache(activeTripId, { days: normalizedAi });
      updateTripItinerary(activeTripId, { days: normalizedAi });
    }
  }, [activeTripId, activeTrip, itineraryCache]);



  // Review Modal State
  const [reviewingItem, setReviewingItem] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    facility_quality: 0,
    budget_friendly: 0,
    personal_experience: 0,
    review_text: ""
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // 💾 AUTO-SAVE ENGINE: Persists changes to backend automatically
  useEffect(() => {
    if (planMode !== 'user' || !activeTripId || Object.keys(days).length === 0) return;

    const timer = setTimeout(() => {
      updateTripItinerary(activeTripId, { days });
    }, 2000); // Wait 2 seconds of inactivity before saving

    return () => clearTimeout(timer);
  }, [days, activeTripId, planMode]);

  // Helper to format the permanent AI backup into Planner-friendly structure
  const getAiVersion = () => {
    // 🛡️ Always pull from the immutable backup column, NOT the cache
    const aiSource = activeTrip?.ai_itinerary;
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
          id: `ai-item-${id}-${aIdx}`,
          ...act,
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
    if (source.droppableId === destination.droppableId) {
      const day = days[source.droppableId];
      const newItems = Array.from(day.items);
      const [moved] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, moved);
      const newDays = { ...days, [source.droppableId]: { ...day, items: newItems } };
      setDays(newDays);
      saveItineraryToCache(activeTripId, { days: newDays });
      updateTripItinerary(activeTripId, { days: newDays }); // 🔥 Immediate DB Sync
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
      updateTripItinerary(activeTripId, { days: newDays }); // 🔥 Immediate DB Sync
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
      updateTripItinerary(activeTripId, { days: newDays }); // 🔥 Immediate DB Sync
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
    updateTripItinerary(activeTripId, { days: newDays }); // 🔥 Immediate DB Sync
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
          id: act.id || `item-${id}-${aIdx}-${Date.now()}`,
          ...act,
          name: act.title || act.name || "Activity",
        }))
      };
    });

    setDays(normalizedAi);
    saveItineraryToCache(activeTripId, { days: normalizedAi });
    updateTripItinerary(activeTripId, { days: normalizedAi });

    // 🔥 Success feedback
    setAddFeedback({ type: 'success', message: 'Restored to original AI plan!' });
    setTimeout(() => setAddFeedback(null), 3000);
  };

  const updateItemRating = (dayId, itemId, rating) => {
    if (isReadOnly) return;
    setDays(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        items: (prev[dayId]?.items || []).filter(item => item && item.id).map(item =>
          item.id === itemId ? { ...item, rating } : item
        )
      }
    }));
  };

  const submitPlaceReview = async () => {
    if (!reviewForm.rating || !reviewForm.facility_quality || !reviewForm.budget_friendly || !reviewForm.personal_experience) {
      alert("Please fill in all the star ratings!");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          place_id: reviewingItem.id, // Using item ID as place_id for now
          trip_id: activeTripId,
          place_name: reviewingItem.title,
          place_category: reviewingItem.category,
          ...reviewForm
        })
      });

      if (!res.ok) throw new Error("Failed to submit review");

      // Visually update the item rating in the UI
      updateItemRating(reviewingItem.dayId, reviewingItem.id, reviewForm.rating);

      setReviewingItem(null);
      setReviewForm({ rating: 0, facility_quality: 0, budget_friendly: 0, personal_experience: 0, review_text: "" });
    } catch (err) {
      console.error(err);
      alert("Error submitting review. Please try again.");
    } finally {
      setIsSubmittingReview(false);
    }
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

  // Map Data Logic
  const mapMarkers = [];
  const mapPolylines = [];
  const visibleDays = selectedDayId === "all" ? displayDayOrder : [selectedDayId];

  // 🔥 CUMULATIVE COUNTER: Keeps track of marker numbers across ALL days
  let cumulativeIndex = 1;

  // We scan ALL days to keep the numbering consistent
  displayDayOrder.forEach(dayId => {
    const day = displayDays[dayId];
    if (!day) return;

    // Check if this specific day is the focused one (or if everything is focused)
    const isFocused = selectedDayId === "all" || selectedDayId === dayId;
    const coords = [];

    (day.items || []).forEach((item) => {

      // 🛠️ UNIVERSAL COORDINATE RESOLVER: Forces everything to [Number, Number]
      const rawLat = item.coords?.[0] ?? item.lat ?? item.location?.lat;
      const rawLng = item.coords?.[1] ?? item.lng ?? item.location?.lng;

      const finalLat = Number(rawLat);
      const finalLng = Number(rawLng);
      const pos = (!isNaN(finalLat) && !isNaN(finalLng)) ? [finalLat, finalLng] : null;

      if (pos) {
        mapMarkers.push({
          ...item,
          dayColor: day.color,
          number: cumulativeIndex,
          dayId,
          pos,
          isFocused
        });
        coords.push(pos);
        cumulativeIndex++;
      }
    });

    if (coords.length > 1) {
      mapPolylines.push({
        coords,
        color: day.color,
        dayId,
        isFocused
      });
    }
  });

  // 🗺️ Automated Map Camera: Fits all pins into view
  useEffect(() => {
    if (map && mapMarkers.length > 0 && window.google) {
      const bounds = new window.google.maps.LatLngBounds();
      mapMarkers.forEach(marker => {
        bounds.extend({ lat: marker.pos[0], lng: marker.pos[1] });
      });
      map.fitBounds(bounds, { padding: 80 });
    }
  }, [map, mapMarkers]);

  const [directions, setDirections] = useState(null);

  // 🛣️ Real Road Directions: Fetches actual street paths between stops
  useEffect(() => {
    if (!window.google || mapMarkers.length < 2 || selectedDayId === 'all') {
      setDirections(null);
      return;
    }

    const focusedMarkers = mapMarkers.filter(m => m.isFocused);
    if (focusedMarkers.length < 2) {
      setDirections(null);
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    const origin = { lat: Number(focusedMarkers[0].pos[0]), lng: Number(focusedMarkers[0].pos[1]) };
    const destination = { lat: Number(focusedMarkers[focusedMarkers.length - 1].pos[0]), lng: Number(focusedMarkers[focusedMarkers.length - 1].pos[1]) };
    const waypoints = focusedMarkers.slice(1, -1).map(m => ({
      location: { lat: Number(m.pos[0]), lng: Number(m.pos[1]) },
      stopover: true
    }));

    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error(`Directions request failed: ${status}`);
          setDirections(null);
        }
      }
    );
  }, [mapMarkers, selectedDayId]);

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

  return (
    <div className="min-h-screen lg:h-[calc(100vh-20px)] bg-slate-50 font-sans grid grid-cols-1 lg:grid-cols-[450px_1fr_400px] gap-6 p-4 sm:p-6 overflow-y-auto lg:overflow-hidden no-scrollbar">
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
          className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col overflow-visible h-[600px] lg:h-[calc(100vh-20px)] relative z-10 border border-slate-200/50"
        >
          {/* Fixed Header */}
          <div className="p-6 pb-2 shrink-0 bg-white/50 backdrop-blur-md z-20 rounded-[40px]">
            <div className="flex flex-col gap-4 mb-4">
              {/* Header Row: Title/Selector & Plan Controls */}
              <div className="flex items-center justify-between relative z-30">
                <div className="flex flex-col">
                  <h2 className="text-[28px] font-bold text-slate-800 tracking-tight">Itinerary</h2>

                  {/* Current Trip Display */}
                  <div className="flex items-center gap-1.5 px-0.5 py-0.5">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                      {"(" + (activeTrip?.title || activeTrip?.name || "New Trip") + ")"}
                    </span>
                  </div>
                </div>


                {/* CONTROL POSITION: Adjust 'translate-y-[0px]' to move these buttons up or down */}
                <div className="flex items-center gap-2 relative translate-y-[-4px]">
                  {/* Plan Toggle */}
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
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 no-scrollbar">

            <div className="bg-white rounded-[32px] shadow-2xl border border-slate-200 p-6 space-y-2 min-h-full py-1 pb-28 relative">

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
                          className="overflow-visible"
                        >
                          <Droppable droppableId={dayId} type="item">
                            {(provided, snapshot) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={`transition-all min-h-[10px] pb-1 ${snapshot.isDraggingOver ? "bg-slate-50/50 rounded-3xl ring-2 ring-dashed ring-slate-200" : ""
                                  }`}
                              >
                                {day.items?.map((item, index) => {
                                  const isLastInDay = index === (day.items?.length || 1) - 1;
                                  const isLastDay = dayId === displayDayOrder[displayDayOrder.length - 1];
                                  const Icon = getItemIcon(item.type?.toLowerCase());

                                  return (
                                    <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={isReadOnly}>
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className="flex gap-4 items-stretch"
                                        >
                                          {/* ── TIMELINE COLUMN ── */}
                                          <div className="flex flex-col items-center">
                                            <div className="h-5 w-5 rounded-full border-2 border-sky-600 bg-sky-50 flex items-center justify-center shrink-0 mt-4">
                                              <Icon size={10} className="text-sky-600" />
                                            </div>
                                            {(!isLastInDay || !isLastDay) && (
                                              <div className="flex-1 w-px border-l-2 border-dotted border-sky-300 mt-1" />
                                            )}
                                          </div>

                                          {/* ── ACTIVITY CARD ── */}
                                          <div
                                            onClick={() => setSelectedPlace(item)}
                                            onMouseEnter={() => setHoveredMarkerId(item.id)}
                                            onMouseLeave={() => setHoveredMarkerId(null)}
                                            className={`group relative flex-1 flex flex-col bg-white rounded-2xl px-6 py-4 shadow-xl border border-sky-100 hover:shadow-2xl hover:-translate-y-1 transition-all mb-4 cursor-pointer ${snapshot.isDragging ? "rotate-2 scale-105 z-50 shadow-2xl ring-2 ring-sky-400" : ""
                                              } ${selectedPlace?.id === item.id ? "ring-2 ring-sky-400 shadow-md" : ""}`}
                                          >



                                            {/* 🔹 TOP ROW: Image + Essential Info */}
                                            <div className="flex gap-4">
                                              {/* Image Thumbnail */}
                                              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 relative shadow-sm border border-slate-100">
                                                <img
                                                  src={item.img || `https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=200&auto=format&fit=crop`}
                                                  alt={item.title}
                                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                              </div>

                                              {/* Content Area */}
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 text-[10px] text-sky-600 font-bold uppercase tracking-wider mb-1">
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
                                                      className="hover:text-sky-400 transition-colors"
                                                    >
                                                      {item.time || "No Time"}
                                                    </span>
                                                  )}
                                                  <span>•</span>
                                                  <div className="flex items-center gap-1">
                                                    {(item.type === 'Hotel' || item.type === 'HOTEL') && <Hotel size={10} className="text-amber-500" />}
                                                    {(item.type === 'Food' || item.type === 'FOOD') && <Utensils size={10} className="text-emerald-500" />}
                                                    {(item.type === 'Sightseeing' || item.type === 'SIGHTSEEING' || item.type === 'ACTIVITY') && <Camera size={10} className="text-sky-500" />}
                                                    {(item.type === 'FLIGHT' || item.type === 'DEPARTURE' || item.type === 'ARRIVAL') && <Plane size={10} className="text-blue-500" />}
                                                    {(item.type === 'TRANSPORT') && <Navigation size={10} className="text-slate-500" />}
                                                    <span className="capitalize">{item.type?.toLowerCase() || "Activity"}</span>
                                                  </div>
                                                </div>

                                                <h4 className="font-bold text-slate-800 text-[14px] leading-tight group-hover:text-sky-700 transition-colors">{item.title}</h4>

                                                <p className="text-[11px] text-slate-400 truncate mt-1 flex items-center gap-1 font-medium">
                                                  <MapPin size={10} className="text-slate-300" /> {item.location}
                                                </p>

                                                {item.price_range && (
                                                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 mt-1">
                                                    <DollarSign size={10} className="text-slate-400" />
                                                    {item.price_range}
                                                  </div>
                                                )}
                                              </div>

                                              {/* Action Buttons */}
                                              {!isReadOnly && (
                                                <button
                                                  className="opacity-40 group-hover:opacity-100 p-3 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all self-start"
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
                                              <div className="mt-4 p-3 rounded-xl bg-sky-50 border border-sky-100/50 flex items-start gap-2.5 shadow-sm group-hover:bg-sky-100/30 transition-colors">
                                                <Sparkles size={14} className="text-sky-500 shrink-0 mt-0.5" />
                                                <p className="text-[10px] text-sky-800 leading-relaxed font-semibold italic">
                                                  {item.booking_hint}
                                                </p>
                                              </div>
                                            )}

                                            {/* ⭐️ RATING UI - Unlocked when trip is completed */}
                                            {isCompleted && (
                                              <div className="flex items-center gap-0.5 mt-3 pt-3 border-t border-slate-50" onClick={(e) => e.stopPropagation()}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                  <button
                                                    key={star}
                                                    onClick={() => {
                                                      setReviewingItem({ ...item, dayId });
                                                      setReviewForm(prev => ({ ...prev, rating: star }));
                                                    }}
                                                    className="p-0.5 transition-transform hover:scale-125"
                                                  >
                                                    <Star
                                                      size={14}
                                                      fill={(item.rating || 0) >= star ? "#fbbf24" : "transparent"}
                                                      stroke={(item.rating || 0) >= star ? "#fbbf24" : "#cbd5e1"}
                                                      strokeWidth={2.5}
                                                    />
                                                  </button>
                                                ))}
                                                {item.rating > 0 && (
                                                  <span className="text-[10px] font-black text-amber-500 ml-1">{item.rating}.0</span>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  );
                                })}
                                {provided.placeholder}

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
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 z-0 bg-gradient-to-t from-white via-white/90 to-transparent rounded-b-[32px]" />

          {displayDayOrder.length > 0 && (
            <div className="absolute bottom-5 left-0 right-0 flex justify-center z-50">
              <button
                onClick={() => setIsCompleted(!isCompleted)}
                className={`w-1/2 max-w-[260px] py-3 rounded-2xl text-[12px] font-black flex items-center justify-center gap-2 border-2 transition-all duration-300 ${isCompleted
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-transparent text-sky-500 border-sky-400/40 opacity-70 hover:opacity-100 hover:text-sky-700 hover:border-sky-600 hover:bg-sky-50'
                  }`}
              >
                <CheckCircle2 size={16} strokeWidth={3} />
                {isCompleted ? 'TRIP COMPLETED' : 'COMPLETE JOURNEY'}
              </button>
            </div>
          )}

        </motion.div>

        {/* --- CENTER CARD: DYNAMIC EXPERIENCE VIEW --- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white/60 backdrop-blur-2xl rounded-[40px] shadow-2xl border border-white/50 h-[500px] lg:h-[calc(100vh-70px)] p-4 sm:p-8 flex flex-col z-0 relative group/center"
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
                        center={mapMarkers.length > 0 ? { lat: mapMarkers[0].pos[0], lng: mapMarkers[0].pos[1] } : { lat: 48.8566, lng: 2.3522 }}
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
          className={`bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl flex flex-col overflow-hidden h-[500px] lg:h-[calc(100vh-48px)] z-10 transition-all ${isReadOnly ? 'grayscale-[0.5] opacity-60 pointer-events-none' : ''}`}
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
              {['saved', 'nearby'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all duration-300 ${activeTab === tab
                    ? "bg-white text-sky-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Places List */}
          <div className="flex-1 overflow-y-auto px-4 pb-6 no-scrollbar">
            <div className="space-y-4 pt-2">
              {searchQuery.trim() && (
                <div className="px-1 mb-2">
                  <p className="text-[11px] font-bold text-slate-400">
                    Results for <span className="text-sky-600">“{searchQuery}”</span>
                  </p>
                </div>
              )}

              {/* EMPTY STATE FOR SAVED */}
              {!searchQuery.trim() && activeTab === "saved" && savedPlaces.length === 0 && (
                <div className="flex flex-col items-center justify-center mt-6 py-8 px-6 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mb-4 border border-amber-100/50 shadow-sm">
                    <Star size={24} className="text-amber-500 fill-amber-500/20" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-800 mb-2">Your wishlist is waiting! ✨</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mb-5 max-w-[220px]">
                    You haven't saved any places yet. Discover amazing spots in Explore and add them here to craft your perfect journey!
                  </p>
                  <button
                    onClick={() => navigate("/explore")}
                    className="text-xs font-bold text-sky-600 hover:text-white transition-all bg-sky-50 hover:bg-sky-500 px-5 py-2.5 rounded-full border border-sky-100 hover:border-sky-500 shadow-sm"
                  >
                    Go to Explore
                  </button>
                </div>
              )}

              {(searchQuery.trim()
                ? [...savedPlaces, ...aiNearbyPlaces].filter(p =>
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.desc.toLowerCase().includes(searchQuery.toLowerCase())
                )
                : (activeTab === "saved" ? savedPlaces : aiNearbyPlaces)
              ).map((place, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={place.id}
                  onClick={() => setSelectedPlace(place)}
                  className="group bg-white rounded-[24px] p-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-slate-100 cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative h-32 w-full rounded-2xl overflow-hidden mb-3 group-hover:shadow-md transition-shadow">
                    <img src={place.img} alt={place.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm flex items-center gap-1">
                      <Star size={10} className="text-amber-500 fill-amber-500" /> {place.rating}
                    </div>
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-white text-[10px] font-bold">
                      {place.category}
                    </div>
                  </div>

                  <div className="px-1">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex flex-col">
                        <h4 className="font-bold text-slate-800 text-sm group-hover:text-sky-600 transition-colors">{place.name}</h4>
                        {place.aiMatchScore && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                            <span className="text-[9px] font-black italic text-emerald-600 tracking-tighter uppercase">{place.aiMatchScore}% Match</span>
                          </div>
                        )}
                      </div>
                      {/* Add Action */}
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        {Object.values(days).some(d => d.items?.some(it => it.placeId === place.id)) ? (
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

                    <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">{place.desc}</p>

                    <div className="flex justify-end mt-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate("/explore"); }}
                        className="text-[10px] font-bold text-sky-600 hover:text-sky-700 hover:underline transition-all"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
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

      {/* --- REVIEW MODAL --- */}
      <AnimatePresence>
        {reviewingItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReviewingItem(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-[32px] shadow-2xl z-[101] overflow-hidden border border-slate-100 p-8"
            >
              <div className="mb-6">
                <div className="text-sky-500 text-[10px] font-black uppercase tracking-widest mb-2">Detailed Feedback</div>
                <h2 className="text-2xl font-bold text-slate-800">{reviewingItem.title}</h2>
                <p className="text-slate-500 text-sm mt-1">Tell us about your experience to help personalize your future trips.</p>
              </div>

              <div className="space-y-6">
                {/* Overall Rating */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Overall Rating *</label>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={`r-${star}`} onClick={() => setReviewForm(p => ({ ...p, rating: star }))}>
                        <Star size={24} fill={reviewForm.rating >= star ? "#fbbf24" : "transparent"} stroke={reviewForm.rating >= star ? "#fbbf24" : "#cbd5e1"} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Facility Quality */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Facility Quality *</label>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={`f-${star}`} onClick={() => setReviewForm(p => ({ ...p, facility_quality: star }))}>
                        <Star size={24} fill={reviewForm.facility_quality >= star ? "#60a5fa" : "transparent"} stroke={reviewForm.facility_quality >= star ? "#60a5fa" : "#cbd5e1"} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Budget Friendly */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Budget Friendly *</label>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={`b-${star}`} onClick={() => setReviewForm(p => ({ ...p, budget_friendly: star }))}>
                        <Star size={24} fill={reviewForm.budget_friendly >= star ? "#34d399" : "transparent"} stroke={reviewForm.budget_friendly >= star ? "#34d399" : "#cbd5e1"} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Personal Experience */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Personal Experience *</label>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={`p-${star}`} onClick={() => setReviewForm(p => ({ ...p, personal_experience: star }))}>
                        <Star size={24} fill={reviewForm.personal_experience >= star ? "#c084fc" : "transparent"} stroke={reviewForm.personal_experience >= star ? "#c084fc" : "#cbd5e1"} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-2 block">Notes (Optional)</label>
                  <textarea
                    value={reviewForm.review_text}
                    onChange={(e) => setReviewForm(p => ({ ...p, review_text: e.target.value }))}
                    placeholder="Any specific thoughts?"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-sky-300 focus:bg-white transition-all resize-none text-sm"
                    rows={3}
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={submitPlaceReview}
                  disabled={isSubmittingReview}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-colors disabled:opacity-50"
                >
                  {isSubmittingReview ? "Submitting..." : "Submit Feedback"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div >
  );
}
