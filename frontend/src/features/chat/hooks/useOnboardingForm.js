import { useState, useEffect } from "react";
import { api } from "../../../services/api";
import { supabase } from "../../../utils/supabase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function useOnboardingForm({
  isLoaded,
  createTrip,
  setActiveTripId,
  setIsGenerating,
  userName,
  setTripData,
  sendMessage
}) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");
  const [onboardingData, setOnboardingData] = useState({
    tripName: "",
    origin: "",
    destination: "",
    mustVisitPlaces: [],
    days: "",
    transportBooked: null,
    arrivalStation: "",
    arrivalTime: "",
    returnTransportBooked: null,
    departureStation: "",
    departureTime: "",
    hotelBooked: null,
    hotelAddress: "",
    budget: "",
    people: "2 People",
    vibe: "Balanced",
  });

  // Auto-default departure date based on arrival date + number of trip days
  useEffect(() => {
    if (onboardingStep === 5 && !onboardingData.departureTime && onboardingData.arrivalTime && onboardingData.days) {
      const [arrDate, arrTime] = onboardingData.arrivalTime.split("T");
      if (arrDate) {
        const [year, month, day] = arrDate.split("-").map(Number);
        if (year && month && day) {
          const d = new Date(year, month - 1, day + (parseInt(onboardingData.days, 10) || 1));
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          const defTime = arrTime || "10:00";
          setOnboardingData(prev => ({ ...prev, departureTime: `${yyyy}-${mm}-${dd}T${defTime}` }));
        }
      }
    }
  }, [onboardingStep, onboardingData.arrivalTime, onboardingData.days, onboardingData.departureTime]);

  // ── Must-Visit Places Feature ───────────────────────────────────────────
  const [topAttractions, setTopAttractions] = useState([]);
  const [isFetchingPlaces, setIsFetchingPlaces] = useState(false);
  const [placesError, setPlacesError] = useState(null);
  const [placeSearchQuery, setPlaceSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("sights");

  const searchPlacesInDestination = async (customQuery, dest, categoryOverride = null) => {
    if (!window.google || !isLoaded || (!dest && !customQuery)) {
      setPlacesError("Google Maps API not loaded yet.");
      return;
    }
    setIsFetchingPlaces(true);
    setPlacesError(null);

    try {
      if (!window.google.maps.places) {
        throw new Error("Places library missing.");
      }

      let PlaceClass = window.google.maps.places.Place;
      if (!PlaceClass && window.google.maps.importLibrary) {
        const placesLib = await window.google.maps.importLibrary("places");
        PlaceClass = placesLib.Place;
      }
      if (!PlaceClass) {
        throw new Error("New Google Maps Place API is not available.");
      }

      let textQuery = `top tourist attractions monuments in ${dest}`;
      const targetCat = categoryOverride || activeCategory;
      if (customQuery && customQuery.trim()) {
        textQuery = `${customQuery} in ${dest}`;
      } else if (targetCat === "dining") {
        textQuery = `top iconic restaurants famous street food cafes in ${dest}`;
      } else if (targetCat === "markets") {
        textQuery = `top famous local shopping markets craft bazars in ${dest}`;
      }

      const request = {
        textQuery: textQuery,
        fields: ['displayName', 'id'],
      };

      const { places } = await PlaceClass.searchByText(request);

      if (places && places.length > 0) {
        const formattedPlaces = places.slice(0, 10).map(p => ({
          name: p.displayName,
          place_id: p.id
        }));
        setTopAttractions(formattedPlaces);
      } else {
        setPlacesError(`No places found for ${targetCat} matching query.`);
      }
    } catch (err) {
      console.error("Places API Error:", err);
      setPlacesError(err.message || "Failed to fetch places.");
    } finally {
      setIsFetchingPlaces(false);
    }
  };

  const fetchTopAttractions = (dest) => {
    setPlaceSearchQuery("");
    setActiveCategory("sights");
    searchPlacesInDestination("", dest, "sights");
  };

  const searchPlacesByCategory = (cat, dest) => {
    setPlaceSearchQuery("");
    setActiveCategory(cat);
    searchPlacesInDestination("", dest, cat);
  };

  const handleNewChat = () => {
    setShowOnboarding(true);
    setOnboardingStep(1); // Mode selection
    setOnboardingData({
      tripName: "",
      origin: "",
      destination: "",
      days: "",
      transportBooked: null,
      arrivalStation: "",
      arrivalTime: "",
      returnTransportBooked: null,
      departureStation: "",
      departureTime: "",
      hotelBooked: null,
      hotelAddress: "",
      budget: "Moderate",
      people: "2 People",
      vibe: "Balanced",
    });
  };

  const completeOnboarding = async (skip = false) => {
    setShowOnboarding(false);

    const { destination, days, budget, tripName, people, vibe, origin, arrivalStation, arrivalTime, departureStation, departureTime, hotelAddress, isExploring, mustVisitPlaces } = onboardingData;

    try {
      try { sessionStorage.setItem('STEP_ONE_MUST_VISIT', JSON.stringify(mustVisitPlaces || [])); } catch (e) { }
      const heroImage = await api.unsplash.fetchPhoto(destination || tripName || "Travel");
      const tripPayload = {
        title: tripName || (destination ? `${destination} Adventure` : `Surprise Trip`),
        destination: destination || "Unknown",
        start_date: new Date().toISOString().split("T")[0],
        image: heroImage,
        must_visit: mustVisitPlaces || []
      };

      const newTrip = await createTrip(tripPayload);
      if (!newTrip || !newTrip.id) return;

      setActiveTripId(newTrip.id);

      const collected = {
        destination: destination || null,
        days: days || null,
        budget: budget || null,
        origin: origin || null,
        arrivalStation: arrivalStation || null,
        hotelAddress: hotelAddress || null
      };

      let aiStage = "CHAT";
      let firstQuestion = null;
      let options = null;

      if (isExploring) {
        aiStage = "CHAT";
        firstQuestion = `Hey ${userName}! 🌍 Let's explore ${destination}. What would you like to know about it? (Food, culture, best time to visit...)`;
      } else if (!collected.destination) {
        aiStage = "ASK_DESTINATION";
        firstQuestion = `Hey ${userName}! I've set up your trip. First things first—where are we headed? 🌍`;
        options = ["Beach 🏖️", "Mountains ⛰️", "City 🏙️"];
      } else if (!collected.days) {
        aiStage = "ASK_DAYS";
        firstQuestion = `Love it, ${destination} is amazing! 🌍 How many days should I plan for?`;
        options = ["3", "5", "7", "10"];
      } else if (!collected.budget) {
        aiStage = "ASK_BUDGET";
        firstQuestion = `Got it! And what's the budget looking like for ${destination}? 💸`;
        options = ["Budget 💸", "Moderate 💳", "Luxury 💎"];
      } else {
        aiStage = "GENERATING";
        setIsGenerating(true);
      }

      const initialMessages = firstQuestion ? [{
        id: Date.now(),
        from: "bot",
        text: firstQuestion,
        options: options
      }] : [];

      setTripData(prev => ({
        ...prev,
        [newTrip.id]: {
          messages: initialMessages,
          messagesFetched: true,
          aiStage,
          collected
        }
      }));

      if (aiStage === "GENERATING" && !skip) {
        let finalDays = days;
        if (days === "Surprise me") {
          finalDays = Math.floor(Math.random() * 8) + 3;
        }

        const mustVisitText = onboardingData.mustVisitPlaces && onboardingData.mustVisitPlaces.length > 0
          ? ` Must visit places: ${onboardingData.mustVisitPlaces.join(', ')}.`
          : '';

        const prompt = `Plan a ${finalDays} day trip to ${destination} for ${people} with a ${budget} budget (${vibe} vibe). Origin: ${origin || 'Unknown'}. Arrival Station: ${arrivalStation || 'Unknown'} at ${arrivalTime || 'Unknown time'}. Departure Station: ${departureStation || 'Unknown'} at ${departureTime || 'Unknown time'}. Hotel Address: ${hotelAddress || 'Unknown'}.${mustVisitText} Mention it's for ${userName}. Start with a friendly summary acknowledging these details.`;
        setTimeout(() => sendMessage(prompt, newTrip.id), 600);
      }

      if (firstQuestion) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;
          await fetch(`${API_URL}/messages/save-only`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tripId: newTrip.id,
              role: "assistant",
              content: firstQuestion,
            }),
          });
        } catch (e) { console.error("First Bot Message save failed:", e); }
      }

    } catch (err) {
      console.error("Onboarding Sync Error:", err);
    }
  };

  return {
    showOnboarding,
    setShowOnboarding,
    onboardingStep,
    setOnboardingStep,
    isEditingTitle,
    setIsEditingTitle,
    editingTitle,
    setEditingTitle,
    onboardingData,
    setOnboardingData,
    topAttractions,
    isFetchingPlaces,
    placesError,
    placeSearchQuery,
    setPlaceSearchQuery,
    activeCategory,
    fetchTopAttractions,
    searchPlacesByCategory,
    searchPlacesInDestination,
    handleNewChat,
    completeOnboarding
  };
}
