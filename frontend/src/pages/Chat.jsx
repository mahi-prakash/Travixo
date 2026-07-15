import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import {
  Send,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Sparkles,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, ChevronDown, Edit3, Trash2, Star } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CircleLogo from "../pages/CircleLogo.png";
import { useTrip } from "../context/TripContext";
import { api } from "../services/api";
import Dropdown from "../components/common/Dropdown";
import SEO from "../components/common/SEO";
import { useJsApiLoader } from "@react-google-maps/api";
import { fetchPhoto } from "../utils/unsplash";
import { GOOGLE_MAPS_API_KEY } from "../utils/googleMaps";
import { supabase } from "../utils/supabase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─── Dynamic Nearby places from Google ──────────────────────────────────────

export default function Chat() {
  const navigate = useNavigate();
  const { user, loginWithGoogle, loading: authLoading } = useUser();
  const userName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Adventurer";
  const {
    trips: realTrips,
    activeTripId: realActiveTripId,
    setActiveTrip,
    createTrip,
    loading,
    saveItineraryToCache,
    updateTripItinerary,
    updateAiItinerary,
    deleteTrip,
    isGenerating,
    setIsGenerating,
    itineraryCache // 🛡️ Added this
  } = useTrip();

  // 🏛️ STATE
  const [tripData, setTripData] = useState(() => {
    const saved = sessionStorage.getItem("chatData");
    return saved ? JSON.parse(saved) : {};
  });
  const tripDataRef = useRef(tripData);
  const activeTripId = realActiveTripId; // Direct link to context

  const setActiveTripId = (id) => {
    setActiveTrip(id);
  };

  // Sync ref and sessionStorage with state
  useEffect(() => {
    tripDataRef.current = tripData;
    sessionStorage.setItem("chatData", JSON.stringify(tripData));
  }, [tripData]);

  const updateTripState = (tripId, updates) => {
    setTripData((prev) => ({
      ...prev,
      [tripId]: {
        ...prev[tripId],
        ...updates,
      },
    }));
  };

  // ── UI state ───────────────────────────────────────────────────────────────
  const [input, setInput] = useState("");
  const [activeTab, setActiveTab] = useState("itinerary");
  const [activeDay, setActiveDay] = useState("All days");
  const [placeIndex, setPlaceIndex] = useState(0);
  const [activeNearbyId, setActiveNearbyId] = useState(null);
  const [showTripSelector, setShowTripSelector] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [nearbyPlacesData, setNearbyPlacesData] = useState([]);
  const [isFetchingNearby, setIsFetchingNearby] = useState(false);

  // ── Google Maps Initialization ───────────────────────────────────────────
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });


  // ── Onboarding modal ───────────────────────────────────────────────────────
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");
  const [onboardingData, setOnboardingData] = useState({
    tripName: "",
    destination: "",
    days: "",
    budget: "",
    people: "2 People",
    vibe: "Balanced",
  });

  const messagesEndRef = useRef(null);

  // ── Reset UI state when trip changes ──────────────────────────────────────
  useEffect(() => {
    setPlaceIndex(0);
    setActiveTab("itinerary");
    setActiveDay("All days");
  }, [activeTripId]);

  // ── Auto-scroll chat to bottom ─────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tripData, activeTripId]);

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

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getActiveTripMeta = () => {
    if (!realTrips || realTrips.length === 0) return null;
    return realTrips.find((t) => t.id === activeTripId) || realTrips[0];
  };

  const getMessages = () => tripData[activeTripId]?.messages || [];

  const getItinerary = () => {
    // 🛡️ PRIORITY: Global Cache > Local Trip State
    return (itineraryCache || {})[activeTripId] || tripData[activeTripId]?.itinerary || null;
  };

  const setMessages = (tripId, updater) => {
    setTripData((prev) => ({
      ...prev,
      [tripId]: {
        ...prev[tripId],
        messages:
          typeof updater === "function"
            ? updater(prev[tripId]?.messages || [])
            : updater,
      },
    }));
  };

  const setItinerary = (tripId, itinerary) => {
    setTripData((prev) => ({
      ...prev,
      [tripId]: { ...prev[tripId], itinerary },
    }));
    if (tripId && itinerary) {
      saveItineraryToCache(tripId, itinerary);
      // 🔥 DUAL-PERSIST: Save to both columns on first generation
      updateTripItinerary(tripId, itinerary);
      updateAiItinerary(tripId, itinerary);
    }
  };

  const getDayNumber = (day, index) =>
    day?.dayNumber ?? day?.day ?? day?.day_index ?? day?.dayId ?? index + 1;



  // ── Fetch messages for a trip ──────────────────────────────────────────────
  const fetchMessages = async (tripId) => {
    if (!user || !tripId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Reverse to maintain chronological order in UI
      const sortedData = (data || []).reverse();

      let recoveredItinerary = null;

      const messages = sortedData.map(msg => {
        const from = msg.role === 'user' ? 'user' : 'bot';
        let text = msg.content;

        // 🔍 RECOVERY & CLEANUP LOGIC
        if (from === "bot") {
          try {
            const raw = text.match(/\[ITINERARY\]([\s\S]*?)\[\/ITINERARY\]/i)?.[1] ||
              text.match(/\{[\s\S]*"days"[\s\S]*\}/i)?.[0];

            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed.days) recoveredItinerary = parsed;
            }
          } catch (e) { }

          text = text
            .replace(/\[ITINERARY\][\s\S]*?\[\/ITINERARY\]/gi, "")
            .replace(/\[[\w\s]+Itinerary\][\s\S]*?(\{[\s\S]*\})/gi, "")
            .replace(/\{[\s\S]*"days"[\s\S]*\}/gi, "")
            .trim();
        }

        return { id: msg.id, from, text, createdAt: msg.created_at };
      });

      if (recoveredItinerary) {
        try {
          recoveredItinerary = await enhanceItineraryWithImages(recoveredItinerary);
        } catch (e) { console.error("Recovery Image Enhancement failed", e); }
      }

      setTripData((prev) => ({
        ...prev,
        [tripId]: {
          ...prev[tripId],
          messages: messages,
          itinerary: recoveredItinerary,
          messagesFetched: true,
        },
      }));

      // 🔥 SYNC TO GLOBAL CACHE
      if (recoveredItinerary) {
        saveItineraryToCache(tripId, recoveredItinerary);
      }
    } catch (err) {
      console.error("fetchMessages error:", err);
      setTripData((prev) => ({
        ...prev,
        [tripId]: { ...prev[tripId], messages: [], messagesFetched: true },
      }));
    }
  };

  // Trigger fetch (check) when trip changes
  useEffect(() => {
    if (activeTripId) {
      const current = tripData[activeTripId];
      if (!current?.messagesFetched) {
        fetchMessages(activeTripId);
      }
    }
  }, [activeTripId, loading]);

  // ── Enhance itinerary activities with Unsplash images ─────────────────────
  const enhanceItineraryWithImages = async (itineraryData) => {
    if (!itineraryData?.days) return itineraryData;

    // 🛡️ Normalized entries to avoid .map crash on objects
    const dayEntries = Array.isArray(itineraryData.days)
      ? itineraryData.days.map((d, i) => [i, d])
      : Object.entries(itineraryData.days);

    const enhancedDaysArray = await Promise.all(
      dayEntries.map(async ([dayKey, day]) => {
        // Handle both 'activities' and 'items' keys
        const activitiesToProcess = day.activities || day.items || [];

        const enhancedActivities = await Promise.all(
          activitiesToProcess.map(async (activity) => {
            if (activity.img) return activity;
            const query = `${activity.title || activity.name} ${activity.location || ""}`.trim();
            const imageUrl = await fetchPhoto(query);
            return {
              ...activity,
              img:
                imageUrl ||
                "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=600&auto=format&fit=crop",
            };
          }),
        );
        return [dayKey, { ...day, activities: enhancedActivities }];
      }),
    );

    // ── Enhance nearby places ──
    let enhancedNearby = itineraryData.nearby_places;
    if (Array.isArray(enhancedNearby)) {
      enhancedNearby = await Promise.all(
        enhancedNearby.map(async (place) => {
          // Skip if AI provided a real image somehow, but overwrite mock unsplash ones
          if (place.img && !place.img.includes("1554118811") && !place.img.includes("unsplash.com")) {
            return place;
          }
          const query = `${place.name} ${place.category || ""} ${itineraryData.destination || ""}`.trim();
          const imageUrl = await fetchPhoto(query);
          return {
            ...place,
            img: imageUrl || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=600&auto=format&fit=crop",
          };
        })
      );
    }

    // If original was an object, return an object. 
    if (!Array.isArray(itineraryData.days)) {
      return { ...itineraryData, days: Object.fromEntries(enhancedDaysArray), nearby_places: enhancedNearby };
    }

    return { ...itineraryData, days: enhancedDaysArray.map(pair => pair[1]), nearby_places: enhancedNearby };
  };

  // ── Send a message (user-typed or auto) ───────────────────────────────────
  const sendMessage = async (text, tripId = activeTripId, forcedStage = null) => {
    if (!text?.trim() || !tripId) return;

    const userMessage = { id: Date.now(), from: "user", text };

    // 🔍 Use REF to get the absolute latest state (solves closure trap)
    const currentTrip = tripDataRef.current[tripId] || {};
    let currentStage = forcedStage || currentTrip.aiStage;
    const collected = currentTrip.collected || {};

    // Auto-detect stage if it looks like a planning request
    if (text.toLowerCase().includes("plan a") && text.toLowerCase().includes("day trip")) {
      currentStage = "GENERATING";
    }

    setMessages(tripId, (prev) => [...prev, userMessage]);
    setIsSending(true);
    setIsGenerating(true);

    // 🔥 FIX: initialize stage if missing
    if (!currentStage) {
      const hasMessages = currentTrip.messages?.length > 0;

      if (hasMessages) {
        currentStage = "CHAT";
      } else {
        updateTripState(tripId, {
          aiStage: "ASK_DESTINATION",
          collected: {},
        });

        const botMessage = {
          id: Date.now() + 1,
          from: "bot",
          text: `Hey ${userName}! Where do you wanna go? 🌍`,
          options: ["Beach 🏖️", "Mountains ⛰️", "City 🏙️"],
        };

        setMessages(tripId, (prev) => [...prev, botMessage]);
        setIsSending(false);
        return;
      }
    }

    let botReply = null;
    let nextStage = currentStage;
    let updatedCollected = { ...collected };
    let finalPrompt = null;

    // 🎯 FLOW
    if (currentStage === "ASK_DESTINATION" && !collected.destination) {
      let destination = text;

      if (text.toLowerCase().includes("surprise")) {
        const randomPlaces = ["Bali", "Paris", "Tokyo", "Istanbul", "Santorini", "Kyoto", "New York", "Dubai"];
        destination =
          randomPlaces[Math.floor(Math.random() * randomPlaces.length)];
        setMessages(tripId, (prev) => [
          ...prev,
          { id: Date.now() + 0.5, from: "bot", text: `How about ${destination}? It's a vibe! ✨` }
        ]);
      }

      updatedCollected.destination = destination;
      nextStage = "ASK_DAYS";

      botReply = {
        text: `Nice choice, ${userName}! ${destination} is amazing. 🌍 How many days are you planning to stay?`,
        options: ["3", "5", "7", "10"],
      };
    } else if (currentStage === "ASK_DAYS" && !collected.days) {
      let days = text;
      if (text.toLowerCase().includes("surprise")) {
        days = ["3", "5", "7", "10"][Math.floor(Math.random() * 4)];
        setMessages(tripId, (prev) => [
          ...prev,
          { id: Date.now() + 0.5, from: "bot", text: `Let's go with ${days} days! Perfect for a solid experience. ⏳` }
        ]);
      }
      updatedCollected.days = days;
      nextStage = "ASK_BUDGET";

      botReply = {
        text: "And what's the budget looking like? 💸",
        options: ["Budget 💸", "Moderate 💳", "Luxury 💎"],
      };
    } else if (currentStage === "ASK_BUDGET" && !collected.budget) {
      let budget = text;
      if (text.toLowerCase().includes("surprise")) {
        budget = "Moderate";
        setMessages(tripId, (prev) => [
          ...prev,
          { id: Date.now() + 0.5, from: "bot", text: "Planning with a Moderate budget for a balanced experience! 💳" }
        ]);
      }
      updatedCollected.budget = budget;
      nextStage = "GENERATING"; // 🔥 FIX: Correct nextStage

      updateTripState(tripId, {
        aiStage: "GENERATING",
        collected: updatedCollected,
      });

      const { destination, days, budget: finalBudget } = updatedCollected;

      finalPrompt = `Plan a ${days} day trip to ${destination} with ${finalBudget} budget. Mention it's for ${userName}.`;

      botReply = {
        text: `Got it, ${userName}! Building your perfect ${days}-day ${destination} itinerary... ✨`,
      };
    }

    // 🚀 MVP: Skip backend message saving
    const willCallAI = !botReply || nextStage === "GENERATING" || nextStage === "CHAT";

    if (botReply && nextStage !== "GENERATING" && nextStage !== "CHAT") {
      updateTripState(tripId, {
        aiStage: nextStage,
        collected: updatedCollected,
      });

      setMessages(tripId, (prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "bot",
          text: botReply.text,
          options: botReply.options,
        },
      ]);

      // 🚀 MVP: Skip bot question saving
      setIsSending(false);
      setIsGenerating(false);
      return;

      setIsSending(false);
      setIsGenerating(false);
      return;
    }

    // 🔥 SAVE USER MESSAGE TO SUPABASE
    try {
      await supabase.from('messages').insert({
        trip_id: tripId,
        user_id: user.id,
        content: text,
        role: 'user'
      });
    } catch (e) { console.error("User message save failed", e); }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          tripId: tripId,
          content: finalPrompt || text,
          destination: currentTrip?.collected?.destination || realTrips?.find(t => t.id === tripId)?.destination || "Unknown",
          history: (currentTrip?.messages || []).map(m => ({
            role: m.from === "bot" ? "assistant" : "user",
            content: m.text
          }))
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${res.status}`);
      }

      const data = await res.json();
      const reply = data.reply || "";

      // 🔥 SAVE BOT REPLY TO SUPABASE
      try {
        await supabase.from('messages').insert({
          trip_id: tripId,
          user_id: user.id,
          content: reply,
          role: 'assistant'
        });
      } catch (e) { console.error("Bot message save failed", e); }

      let parsedItinerary = null;

      try {
        const first = reply.indexOf("{");
        const last = reply.lastIndexOf("}");
        if (first !== -1 && last !== -1) {
          const jsonString = reply.slice(first, last + 1);
          const raw = JSON.parse(jsonString);
          if (raw.days) {
            parsedItinerary = await enhanceItineraryWithImages(raw);
          }
        }
      } catch (err) {
        console.error("Itinerary parse error:", err);
      }

      // Clean reply: Remove the block AND the tags/brackets
      const cleanReply = reply
        .replace(/\[ITINERARY\][\s\S]*?\[\/ITINERARY\]/gi, "")
        .replace(/\[[\w\s]+Itinerary\][\s\S]*?(\{[\s\S]*\})/gi, "")
        .replace(/\{[\s\S]*"days"[\s\S]*\}/gi, "")
        .trim();

      if (cleanReply) {
        const newMessages = [
          {
            id: Date.now() + 2,
            from: "bot",
            text: cleanReply,
          }
        ];

        if (parsedItinerary) {
          newMessages.push({
            id: Date.now() + 3,
            from: "bot",
            text: "✨ **Your plan is ready!** I've created a copy in 'Your Plan' that you can now fully customize in the Planner. Feel free to add, remove, or move things around! 🗺️",
          });
        }

        setMessages(tripId, (prev) => [...prev, ...newMessages]);
      }

      if (parsedItinerary) {
        setItinerary(tripId, parsedItinerary);
      }

      // 🔥 FIX: STOP LOOP
      updateTripState(tripId, {
        aiStage: null,
      });
    } catch (err) {
      console.error("sendMessage error:", err);
      setMessages(tripId, (prev) => [
        ...prev,
        {
          id: Date.now() + 3,
          from: "bot",
          text: "I'm having trouble connecting to the travel engine. Please try again in a few seconds.",
        },
      ]);
    } finally {
      setIsSending(false);
      setIsGenerating(false);
    }
  };

  // ── Handle chat form submit ────────────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    const text = input;
    setInput("");
    await sendMessage(text);
  };

  // ── New trip button → open onboarding modal ────────────────────────────────
  const handleNewChat = () => {
    setShowOnboarding(true);
    setOnboardingStep(2); // Start at Destination
    setOnboardingData({
      tripName: "",
      destination: "",
      days: "",
      budget: "Moderate",
      people: "2 People",
      vibe: "Balanced",
    });
  };

  // ── Complete onboarding → create trip → auto-send planning message ─────────
  const completeOnboarding = async (skip = false) => {
    setShowOnboarding(false);

    // 💡 SHADOW COPY: Extract raw values to avoid closure staleness
    const { destination, days, budget, tripName, people, vibe } = onboardingData;

    try {
      const heroImage = await api.unsplash.fetchPhoto(destination || tripName || "Travel");
      const tripPayload = {
        title: tripName || (destination ? `${destination} Adventure` : `Surprise Trip`),
        destination: destination || "Unknown",
        start_date: new Date().toISOString().split("T")[0],
        image: heroImage
      };

      const newTrip = await createTrip(tripPayload);
      if (!newTrip || !newTrip.id) return;

      // Ensure the UI switches to the new trip IMMEDIATELY
      setActiveTripId(newTrip.id);

      // 🎯 SYNC DATA STATE
      const collected = {
        destination: destination || null,
        days: days || null,
        budget: budget || null
      };

      let aiStage = "CHAT";
      let firstQuestion = null;
      let options = null;

      // Logic: If any critical info is missing, the AI takes over from that step
      if (!collected.destination) {
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
        // Everything finalized in Modal
        aiStage = "GENERATING";
        setIsGenerating(true);
      }

      const initialMessages = firstQuestion ? [{
        id: Date.now(),
        from: "bot",
        text: firstQuestion,
        options: options
      }] : [];

      // Update state for THIS SPECIFIC TRIP
      setTripData(prev => ({
        ...prev,
        [newTrip.id]: {
          messages: initialMessages,
          messagesFetched: true,
          aiStage,
          collected
        }
      }));

      // 🚀 Trigger AI if fully ready
      if (aiStage === "GENERATING") {
        // Handle "Surprise me" for days specifically (max 10)
        let finalDays = days;
        if (days === "Surprise me") {
          finalDays = Math.floor(Math.random() * 8) + 3; // 3 to 10 days
        }

        const prompt = `Plan a ${finalDays} day trip to ${destination} for ${people} with a ${budget} budget (${vibe} vibe). Mention it's for ${userName}. Start with a friendly summary acknowledging these details.`;
        // Small timeout to let the Context update and UI switch
        setTimeout(() => sendMessage(prompt, newTrip.id), 600);
      }

      // 🎯 SAVE FIRST MESSAGE TO DB (Persistence)
      if (firstQuestion) {
        try {
          await fetch(`${API_URL}/messages/save-only`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              tripId: newTrip.id,
              role: "assistant", // It's a bot question
              content: firstQuestion,
            }),
          });
        } catch (e) { console.error("First Bot Message save failed:", e); }
      }

    } catch (err) {
      console.error("Onboarding Sync Error:", err);
    }
  };

  // ── Derived values for panels ──────────────────────────────────────────────
  const activeItinerary = getItinerary();
  const messages = getMessages();
  const tripMeta = getActiveTripMeta();

  const itineraryDays = Array.isArray(activeItinerary?.days)
    ? activeItinerary.days
    : Object.values(activeItinerary?.days || {});

  const places =
    itineraryDays.flatMap((day, dIdx) =>
      (day.activities || day.items || []).map((act) => ({
        ...act,
        dayNum: getDayNumber(day, dIdx),
      })),
    ) || [];

  const currentPlace = places[placeIndex] || {};
  const currentNearby =
    nearbyPlacesData.find((p) => p.id === activeNearbyId) || nearbyPlacesData[0];

  // ── Day tabs derived from itinerary ───────────────────────────────────────
  const dayTabs = itineraryDays.length > 0
    ? [
      "All days",
      ...itineraryDays.map((d, i) => `Day ${getDayNumber(d, i)}`),
    ]
    : ["All days"];

  // ── Authentication Guard ──────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[32px] p-8 shadow-xl text-center space-y-6"
        >
          <div className="w-20 h-20 bg-sky-50 rounded-3xl flex items-center justify-center mx-auto mb-2">
            <Sparkles className="text-sky-600 w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ready for your next story?</h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            Login with Google to start planning your perfect adventure. We'll save everything for you.
          </p>
          <button
            onClick={loginWithGoogle}
            className="w-full py-4 px-6 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-95"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>
        </motion.div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="h-full w-full bg-white flex flex-col"
    >
      <SEO 
        title="AI Travel Assistant"
        url="/chat"
        description="Chat with our AI travel expert to build persona-driven itineraries, find hidden gems, and plan your perfect trip in seconds."
        keywords="AI travel assistant, travel chat, itinerary builder, trip planning AI"
      />
      {/* ── Markdown Styles ── */}
      <style>{`
        .prose p { margin-bottom: 0.75rem; }
        .prose p:last-child { margin-bottom: 0; }
        .prose ul, .prose ol { margin-left: 1.25rem; margin-bottom: 0.75rem; list-style-type: disc; }
        .prose ol { list-style-type: decimal; }
        .prose li { margin-bottom: 0.35rem; }
        .prose strong { font-weight: 700; color: inherit; }
        .prose h1, .prose h2, .prose h3 { font-weight: 800; margin-top: 1rem; margin-bottom: 0.5rem; }
      `}</style>

      {/* ══════════ ONBOARDING MODAL ══════════ */}
      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-[420px] bg-white rounded-[32px] shadow-2xl overflow-hidden relative"
            >
              {/* Progress bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
                <motion.div
                  className="h-full bg-sky-600"
                  animate={{ width: `${((onboardingStep - 1) / 3) * 100}%` }}
                />
              </div>
              {onboardingStep > 2 && (
                <button
                  onClick={() => setOnboardingStep(onboardingStep - 1)}
                  className="absolute top-4 left-4 p-2 rounded-full hover:bg-slate-50 transition text-slate-400 hover:text-slate-600"
                >
                  <ChevronLeft size={18} />
                </button>
              )}

              <button
                onClick={() => setShowOnboarding(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-50 transition"
              >
                <X size={18} className="text-slate-400" />
              </button>

              <div className="p-8 pt-10 text-center">
                <AnimatePresence mode="wait">
                  {/* Step 1 Removed */}

                  {/* ── STEP 2: Destination ── */}
                  {onboardingStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
                        <MapPin className="text-emerald-600 w-6 h-6" />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        Where to?
                      </h2>
                      <p className="text-sm text-slate-500">
                        City, country, or just a vibe.
                      </p>
                      <input
                        autoFocus
                        value={onboardingData.destination}
                        onChange={(e) =>
                          setOnboardingData({
                            ...onboardingData,
                            destination: e.target.value,
                          })
                        }
                        placeholder="e.g. Tokyo, Japan"
                        className="w-full px-5 py-3.5 bg-slate-100/50 border-2 border-transparent focus:border-sky-600 rounded-xl outline-none text-base transition"
                      />

                      <div className="flex flex-wrap gap-2 justify-center">
                        {[
                          { label: "Beach 🏖️", val: "Beach" },
                          { label: "Mountains ⛰️", val: "Mountains" },
                          { label: "City 🏙️", val: "City" }
                        ].map((chip) => (
                          <button
                            key={chip.val}
                            onClick={() => {
                              setOnboardingData({ ...onboardingData, destination: chip.val });
                              setOnboardingStep(3);
                            }}
                            className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600 hover:border-sky-300 hover:bg-sky-50 transition"
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>
                      <div className="pt-1">
                        <button
                          onClick={() => setOnboardingStep(3)}
                          className="w-full py-3 bg-sky-600 text-white rounded-xl font-bold text-base hover:bg-sky-700 transition disabled:opacity-50"
                          disabled={!onboardingData.destination}
                        >
                          Next
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ── STEP 3: Days ── */}
                  {onboardingStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto">
                        <Clock className="text-purple-600 w-6 h-6" />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        How many days?
                      </h2>
                      <p className="text-sm text-slate-500">
                        We'll plan it day by day.
                      </p>
                      <div className="grid grid-cols-4 gap-3">
                        {["3", "5", "7", "Surprise me"].map((d) => (
                          <button
                            key={d}
                            onClick={() =>
                              setOnboardingData({ ...onboardingData, days: d })
                            }
                            className={`p-1.5 rounded-xl border-2 transition font-bold text-[10px] ${onboardingData.days === d ? "border-sky-600 bg-sky-50 text-sky-600" : "border-slate-100 hover:border-slate-200 text-slate-600"}`}
                          >
                            {d === "Surprise me" ? "" : d}
                            <div className="text-[10px] mt-0.5">{d === "Surprise me" ? "Surprise" : "Days"}</div>
                          </button>
                        ))}
                      </div>
                      <input
                        value={onboardingData.days}
                        onChange={(e) =>
                          setOnboardingData({
                            ...onboardingData,
                            days: e.target.value,
                          })
                        }
                        placeholder="Or type custom days"
                        className="w-full px-5 py-3 bg-slate-100/50 border-2 border-transparent focus:border-sky-600 rounded-xl outline-none text-sm transition"
                      />
                      <div className="pt-1">
                        <button
                          onClick={() => setOnboardingStep(4)}
                          className="w-full py-3 bg-sky-600 text-white rounded-xl font-bold text-base hover:bg-sky-700 transition"
                        >
                          Next
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ── STEP 4: Budget + People + Vibe ── */}
                  {onboardingStep === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto">
                        <Users className="text-orange-600 w-6 h-6" />
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        Final details
                      </h2>
                      <p className="text-sm text-slate-500">
                        Budget, crew & energy.
                      </p>

                      {/* Budget */}
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                          Budget
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {["Budget", "Moderate", "Luxury", "Surprise me"].map(
                            (b) => (
                              <button
                                key={b}
                                onClick={() =>
                                  setOnboardingData({
                                    ...onboardingData,
                                    budget: b,
                                  })
                                }
                                className={`p-2.5 rounded-xl border-2 transition font-bold text-[10px] ${onboardingData.budget === b ? "border-sky-600 bg-sky-50 text-sky-600" : "border-slate-100 hover:border-slate-200 text-slate-600"}`}
                              >
                                {b}

                              </button>
                            ),
                          )}
                        </div>
                      </div>

                      {/* People */}
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                          Who's going?
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            "Solo",
                            "2 People",
                            "Small Squad",
                            "Large Group",
                          ].map((p) => (
                            <button
                              key={p}
                              onClick={() =>
                                setOnboardingData({
                                  ...onboardingData,
                                  people: p,
                                })
                              }
                              className={`p-2.5 rounded-xl border-2 transition font-bold text-xs ${onboardingData.people === p ? "border-sky-600 bg-sky-50 text-sky-600" : "border-slate-100 hover:border-slate-200 text-slate-600"}`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Vibe */}
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                          Vibe
                        </p>
                        <div className="grid grid-cols-5 gap-2">
                          {["Relaxing", "Adventure", "Balanced", "Spiritual", "Not decided"].map(
                            (v) => (
                              <button
                                key={v}
                                onClick={() =>
                                  setOnboardingData({
                                    ...onboardingData,
                                    vibe: v,
                                  })
                                }
                                className={`p-2.5 rounded-xl border-2 transition font-bold text-[9px] ${onboardingData.vibe === v ? "border-sky-600 bg-sky-50 text-sky-600" : "border-slate-100 hover:border-slate-200 text-slate-600"}`}
                              >
                                {v}
                              </button>
                            ),
                          )}
                        </div>
                      </div>

                      <div className="pt-1">
                        <button
                          onClick={() => completeOnboarding(false)}
                          className="w-full py-3 bg-sky-600 text-white rounded-xl font-bold text-base hover:bg-sky-700 transition"
                        >
                          Build Itinerary 🚀
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="h-8 flex items-center" />

      <main className="flex-1 w-full px-4 sm:px-10 lg:px-20 pb-8 lg:pb-0">
        <div
          className="h-full grid grid-cols-1 lg:grid-cols-[64%_36%] gap-8"
        >
          {/* ══════════ CHAT PANEL ══════════ */}
          <section className="relative z-20 h-fit lg:h-full">
            <div className="h-[500px] lg:h-[570px] rounded-[32px] bg-white shadow-2xl border border-slate-100 flex flex-col overflow-visible relative">
              {/* Header */}
              <div className="px-8 py-6 flex items-center justify-between relative z-30">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-sky-600 text-white flex items-center justify-center">
                    <img src={CircleLogo} alt="Logo" />
                  </div>
                  <div>
                    {isEditingTitle ? (
                      <div className="flex items-center gap-2">
                        <input
                          autoFocus
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={async () => {
                            setIsEditingTitle(false);
                            if (editingTitle && editingTitle !== tripMeta?.title) {
                              // Add logic to update in trip context if needed, 
                              // for now we'll just update locally
                              tripMeta.title = editingTitle;
                            }
                          }}
                          className="bg-slate-50 border-b-2 border-sky-600 outline-none font-semibold px-1"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group">
                        <div className="font-semibold cursor-pointer hover:text-sky-600" onClick={() => {
                          setEditingTitle(tripMeta?.title || "My Trip");
                          setIsEditingTitle(true);
                        }}>
                          {"The Travstory"}
                        </div>
                        <Edit3 size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition" />
                      </div>
                    )}
                    <div className="text-[12px] text-slate-500 font-semibold">
                      Knows vibes, not visas
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Trip selector */}
                  {/* Current Trip Display */}
                  <div className="hidden sm:flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-slate-200 text-slate-800 text-sm font-semibold shadow-sm shadow-slate-100">
                    <span className="text-slate-400 font-medium mr-1">
                      Planning:
                    </span>
                    <span className="truncate max-w-[80px] sm:max-w-[120px]">
                      {tripMeta?.title || tripMeta?.name || "New Trip"}
                    </span>
                  </div>

                  {/* New trip */}
                  <button
                    onClick={handleNewChat}
                    className="text-xs sm:text-sm font-semibold border border-sky-600 text-white bg-sky-600 hover:bg-sky-700 px-3 sm:px-4 py-1.5 rounded-full transition shadow-md shadow-sky-100 whitespace-nowrap"
                  >
                    + New Trip
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 px-8 py-4 overflow-y-auto space-y-4 no-scrollbar">
                {messages.length === 0 && (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-slate-400 text-sm text-center">
                      {activeTripId
                        ? "No messages yet. Say hi! 👋"
                        : "Create or select a new trip to start chatting."}
                    </p>
                  </div>
                )}
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-[24px] px-6 py-4 text-[14px] leading-relaxed shadow-sm ${m.from === "user"
                        ? "bg-sky-600 text-white rounded-br-none"
                        : "bg-white text-slate-800 rounded-bl-none border border-slate-100 shadow-xl shadow-slate-200/50"
                        }`}
                    >
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {m.text}
                        </ReactMarkdown>
                      </div>

                      {m.options && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {m.options.map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => sendMessage(opt, activeTripId)}
                              className="px-3 py-1.5 bg-white border border-sky-300 rounded-full text-xs hover:bg-sky-100"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="bg-sky-50 border border-sky-100 rounded-2xl rounded-bl-none px-5 py-3 text-sm text-slate-400">
                      Thinking…
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="px-4 sm:px-10 pb-4 sm:pb-8">
                <div className="flex items-center gap-2 sm:gap-3 bg-sky-50 rounded-full px-4 sm:px-6 py-2.5 sm:py-3 shadow-inner">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe your vibe"
                    disabled={!activeTripId || isSending}
                    className="flex-1 min-w-0 bg-transparent outline-none text-sm disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isSending}
                    className="h-9 w-9 shrink-0 rounded-full bg-slate-900 text-white flex items-center justify-center disabled:opacity-40"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* ══════════ RIGHT PANEL ══════════ */}
          <aside className="h-fit lg:h-full">
            <div className="h-[500px] lg:h-[570px] rounded-[32px] bg-white shadow-2xl border border-slate-100 flex flex-col relative">
              {/* Tabs */}
              <div className="px-4 sm:px-11 pt-6 flex justify-between overflow-x-auto no-scrollbar">
                <div className="flex gap-2 text-xs sm:text-s font-semibold whitespace-nowrap">
                  {["itinerary", "places", "nearby"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 sm:px-5.5 py-1.5 rounded-full border transition-all duration-200 ${activeTab === tab
                        ? "bg-slate-900 text-white border-slate-800"
                        : "bg-white text-slate-600 border-sky-200 hover:bg-sky-100 hover:border-sky-400"
                        }`}
                    >
                      {tab === "itinerary"
                        ? "Live Itinerary"
                        : tab === "places"
                          ? "Places"
                          : "Explore Nearby"}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── ITINERARY TAB ── */}
              <AnimatePresence mode="wait">
                {activeTab === "itinerary" && (
                  <motion.div
                    key="itinerary-tab"
                    initial={{ opacity: 0, scale: 0.96, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -10 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="absolute top-[70px] left-1/2 -translate-x-1/2 w-[85%] z-20"
                  >
                    {/* Day filter */}
                    <div className="sticky top-[-16px] z-30 mb-4 px-2 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm flex gap-2 overflow-x-auto no-scrollbar">
                      {dayTabs.map((day) => (
                        <button
                          key={day}
                          onClick={() => setActiveDay(day)}
                          className={`px-4 py-1.5 text-xs font-semibold rounded-full border border-slate-300 whitespace-nowrap transition ${activeDay === day
                            ? "bg-sky-600 text-white border-sky-500"
                            : "bg-white text-slate-600 border-slate-300 hover:border-sky-400"
                            }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>

                    {/* Itinerary cards */}
                    <div className="rounded-3xl bg-white shadow-2xl px-6 py-6 space-y-4 max-h-[48vh] overflow-y-auto no-scrollbar mb-4">
                      {!activeItinerary ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <Sparkles className="text-sky-300 w-8 h-8 mb-3" />
                          <p className="text-slate-400 text-sm font-medium">
                            Your itinerary will appear here once the AI builds
                            it.
                          </p>
                          <p className="text-slate-300 text-xs mt-1">
                            Tell the AI your destination to get started!
                          </p>
                        </div>
                      ) : (
                        itineraryDays
                          .filter(
                            (day, idx) =>
                              activeDay === "All days" ||
                              `Day ${getDayNumber(day, idx)}` === activeDay,
                          )
                          .map((day, dayIdx) => (
                            <div
                              key={day.id || dayIdx}
                              className="space-y-4 mb-8"
                            >
                              {/* Day header */}
                              <div className="flex items-center gap-3 mb-4">
                                <div className="h-px flex-1 bg-slate-100" />
                                <div className="bg-slate-50 border border-slate-100 px-4 py-1.5 rounded-full flex items-center gap-2">
                                  {/*add the day 1 or 2 thing here...*/}
                                  <span className="text-[13px] font-bold text-sky-600">
                                    {"Day " + day.day}
                                  </span>

                                </div>
                                <div className="h-px flex-1 bg-slate-100" />
                              </div>

                              {(day.activities || day.items || []).map(
                                (activity, actIdx) => {
                                  const Icon = activity.icon || MapPin;
                                  const isLastInDay =
                                    actIdx ===
                                    (day.activities?.length || 1) - 1;
                                  const isLastDay =
                                    dayIdx ===
                                    (activeItinerary.days?.length || 1) - 1;

                                  return (
                                    <motion.div
                                      key={activity.id || actIdx}
                                      initial={{ opacity: 0, y: 12 }}
                                      whileInView={{ opacity: 1, y: 0 }}
                                      viewport={{ once: true }}
                                      transition={{
                                        duration: 0.4,
                                        ease: "easeOut",
                                      }}
                                      className="flex gap-4 items-stretch"
                                    >
                                      {/* Timeline */}
                                      <div className="flex flex-col items-center">
                                        <div className="h-5 w-5 rounded-full border-2 border-sky-600 bg-sky-50 flex items-center justify-center">
                                          {actIdx === 0 && (
                                            <Icon
                                              size={10}
                                              className="text-sky-600"
                                            />
                                          )}
                                        </div>
                                        {(!isLastInDay || !isLastDay) && (
                                          <div className="flex-1 w-px border-l-2 border-dotted border-sky-300 mt-1" />
                                        )}
                                      </div>

                                      {/* Activity card */}
                                      <motion.div
                                        whileHover={{ y: -4 }}
                                        transition={{
                                          type: "spring",
                                          stiffness: 300,
                                          damping: 20,
                                        }}
                                        className="relative flex items-center gap-4 w-full rounded-2xl bg-white px-6 py-3 shadow-xl border border-slate-100 hover:shadow-2xl transition-all"
                                      >
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 text-[13px] text-sky-600 font-bold uppercase tracking-wide">
                                            <Icon size={12} /> {activity.time} •{" "}
                                            {activity.type}
                                          </div>
                                          <div className="font-bold text-[15px] text-slate-900 mt-1">
                                            {activity.title}
                                          </div>
                                          <div className="text-[11px] text-slate-400 mt-0.5">
                                            {activity.location}
                                          </div>
                                        </div>
                                        {activity.img && (
                                          <img
                                            src={activity.img}
                                            alt={activity.title}
                                            className="h-14 w-14 rounded-xl object-cover shadow-lg ring-4 ring-white translate-y-[-2px]"
                                          />
                                        )}
                                      </motion.div>
                                    </motion.div>
                                  );
                                },
                              )}
                            </div>
                          ))
                      )}
                    </div>

                    {/* Finalize button */}
                    <motion.button
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/bookings")}
                      disabled={!activeItinerary}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-700 to-sky-500 text-white font-bold text-sm shadow-xl shadow-sky-100 flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-sky-300 transition-all duration-300 disabled:opacity-40"
                    >
                      <Sparkles size={18} />
                      Finalize & Show Bookings
                      <ChevronRight size={18} />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── PLACES TAB ── */}
              <AnimatePresence mode="wait">
                {activeTab === "places" && (
                  <motion.div
                    key="places-tab"
                    initial={{ opacity: 0, scale: 0.96, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -10 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="absolute top-[90px] left-1/2 -translate-x-1/2 w-[85%] z-20"
                  >
                    <div className="rounded-3xl bg-white shadow-2xl px-6 py-1">
                      <div className="flex justify-between mb-3">
                        <p className="text-sm font-semibold">
                          Places from this plan
                        </p>
                        <p className="text-xs text-sky-700 font-semibold">
                          As planned · Day {currentPlace.dayNum || 1}
                        </p>
                      </div>

                      <div className="relative">
                        <button
                          onClick={() => {
                            const currentDayNum = Number(currentPlace.dayNum || 1);
                            const prevDayNum = currentDayNum - 1;
                            const firstPlaceIdx = places.findIndex(p => Number(p.dayNum) === prevDayNum);
                            if (firstPlaceIdx !== -1) setPlaceIndex(firstPlaceIdx);
                          }}
                          disabled={Number(currentPlace.dayNum || 1) <= 1}
                          className="absolute left-[-50px] top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-sky-600 flex items-center justify-center shadow-md hover:bg-sky-700 disabled:opacity-40 transition z-30"
                        >
                          <ChevronLeft size={20} className="text-white" />
                        </button>
                        <button
                          onClick={() => {
                            const currentDayNum = Number(currentPlace.dayNum || 1);
                            const nextDayNum = currentDayNum + 1;
                            const firstPlaceIdx = places.findIndex(p => Number(p.dayNum) === nextDayNum);
                            if (firstPlaceIdx !== -1) setPlaceIndex(firstPlaceIdx);
                          }}
                          disabled={Number(currentPlace.dayNum || 1) >= (itineraryDays.length)}
                          className="absolute right-[-50px] top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-sky-600 flex items-center justify-center shadow-md hover:bg-sky-700 disabled:opacity-40 transition z-30"
                        >
                          <ChevronRight size={20} className="text-white" />
                        </button>

                        {!currentPlace.title && (
                          <div className="py-20 text-center text-slate-400 text-xs font-semibold italic">
                            No places found in this itinerary.
                          </div>
                        )}

                        {currentPlace.title && (
                          <>
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={placeIndex}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="relative mb-3"
                              >
                                <img
                                  src={currentPlace?.img || ""}
                                  alt={currentPlace?.title || "Place"}
                                  className="h-[160px] w-full object-cover rounded-2xl"
                                />
                                <div className="absolute bottom-0 left-0 right-0 rounded-b-2xl bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
                                  <p className="text-sm font-semibold text-white">
                                    {currentPlace?.title}
                                  </p>
                                  <p className="text-xs text-white/80">
                                    {currentPlace?.location}
                                  </p>
                                </div>
                              </motion.div>
                            </AnimatePresence>

                            <div className="mt-4 space-y-2 max-h-[240px] overflow-y-auto pr-1 no-scrollbar">
                              {places
                                .filter((p, idx) => p.dayNum === currentPlace.dayNum && idx !== placeIndex)
                                .map((p, idx) => (
                                  <motion.button
                                    key={idx}
                                    onClick={() => setPlaceIndex(places.indexOf(p))}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.96 }}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:border-sky-300 transition"
                                  >
                                    <img
                                      src={p.img}
                                      alt={p.title}
                                      className="h-12 w-12 rounded-lg object-cover"
                                    />
                                    <div className="text-left">
                                      <p className="text-xs font-semibold text-slate-800">
                                        {p.title}
                                      </p>
                                      <p className="text-[11px] text-slate-500">
                                        {p.location}
                                      </p>
                                    </div>
                                  </motion.button>
                                ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── EXPLORE NEARBY TAB ── */}
              <AnimatePresence mode="wait">
                {activeTab === "nearby" && (
                  <motion.div
                    key="nearby-tab"
                    initial={{ opacity: 0, scale: 0.96, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -10 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="absolute top-[90px] left-1/2 -translate-x-1/2 w-[85%] z-20"
                  >
                    <div className="rounded-3xl bg-white shadow-2xl px-6 py-1">
                      <div className="flex justify-between mb-3">
                        <p className="text-sm font-semibold">Explore nearby</p>
                        <p className="text-xs text-sky-700 font-semibold">
                          Optional · Day {currentPlace.dayNum || 1}
                        </p>
                      </div>

                      <div className="relative">
                        {isFetchingNearby ? (
                          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                            <div className="animate-spin h-6 w-6 border-2 border-sky-600 border-t-transparent rounded-full mb-3" />
                            <p className="text-xs font-semibold italic">Scouting nearby gems...</p>
                          </div>
                        ) : !currentNearby ? (
                          <div className="py-20 text-center text-slate-400 text-xs font-semibold italic">
                            No nearby spots found for this area.
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                const idx = nearbyPlacesData.findIndex(p => p.id === activeNearbyId);
                                if (idx > 0) setActiveNearbyId(nearbyPlacesData[idx - 1].id);
                              }}
                              disabled={nearbyPlacesData.findIndex(p => p.id === activeNearbyId) <= 0}
                              className="absolute left-[-50px] top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-sky-600 flex items-center justify-center shadow-md hover:bg-sky-700 disabled:opacity-40 transition z-30"
                            >
                              <ChevronLeft size={20} className="text-white" />
                            </button>
                            <button
                              onClick={() => {
                                const idx = nearbyPlacesData.findIndex(p => p.id === activeNearbyId);
                                if (idx < nearbyPlacesData.length - 1) setActiveNearbyId(nearbyPlacesData[idx + 1].id);
                              }}
                              disabled={nearbyPlacesData.findIndex(p => p.id === activeNearbyId) >= nearbyPlacesData.length - 1}
                              className="absolute right-[-50px] top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-sky-600 flex items-center justify-center shadow-md hover:bg-sky-700 disabled:opacity-40 transition z-30"
                            >
                              <ChevronRight size={20} className="text-white" />
                            </button>

                            <AnimatePresence mode="wait">
                              <motion.div
                                key={activeNearbyId}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="relative mb-3"
                              >
                                <img
                                  src={currentNearby?.img || ""}
                                  alt={currentNearby?.name || "Nearby"}
                                  className="h-[160px] w-full object-cover rounded-2xl"
                                />
                                <div className="absolute bottom-0 left-0 right-0 rounded-b-2xl bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <p className="text-sm font-semibold text-white">
                                        {currentNearby?.name}
                                      </p>
                                      <p className="text-xs text-white/80 line-clamp-1">
                                        {currentNearby?.desc}
                                      </p>
                                    </div>
                                    {currentNearby?.rating && (
                                      <div className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1">
                                        <Star size={10} className="text-yellow-400 fill-yellow-400" />
                                        <span className="text-[10px] font-bold text-white">{currentNearby.rating}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            </AnimatePresence>

                            <div className="mt-4 space-y-2 max-h-[240px] overflow-y-auto pr-1 no-scrollbar">
                              {nearbyPlacesData
                                .filter((p) => p.id !== currentNearby?.id)
                                .map((p) => (
                                  <motion.button
                                    key={p.id}
                                    onClick={() => setActiveNearbyId(p.id)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.96 }}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:border-sky-300 transition"
                                  >
                                    <img
                                      src={p.img}
                                      alt={p.name}
                                      className="h-12 w-12 rounded-lg object-cover"
                                    />
                                    <div className="text-left flex-1">
                                      <div className="flex justify-between items-start">
                                        <p className="text-xs font-semibold text-slate-800">
                                          {p.name}
                                        </p>
                                        {p.rating && (
                                          <div className="flex items-center gap-0.5 text-[9px] font-bold text-amber-600 bg-amber-50 px-1 rounded">
                                            <Star size={8} className="fill-amber-600" />
                                            {p.rating}
                                          </div>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-slate-500 line-clamp-1">
                                        {p.desc}
                                      </p>
                                    </div>
                                  </motion.button>
                                ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-white rounded-b-[32px]" />
            </div>
          </aside>
        </div>
      </main >
    </motion.div >
  );
}
