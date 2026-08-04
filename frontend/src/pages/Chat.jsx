import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useJsApiLoader } from "@react-google-maps/api";

// Contexts & Services
import { useUser } from "../context/UserContext";
import { useTrip } from "../context/TripContext";
import { GOOGLE_MAPS_API_KEY } from "../utils/googleMaps";
import SEO from "../components/common/SEO";

// Domain Modules
import useChatItinerary from "../features/chat/hooks/useChatItinerary";
import useChatMessages from "../features/chat/hooks/useChatMessages";
import useOnboardingForm from "../features/chat/hooks/useOnboardingForm";
import AuthPromptModal from "../features/chat/components/AuthPromptModal";
import OnboardingModal from "../features/chat/components/onboarding/OnboardingModal";
import ChatPanel from "../features/chat/components/ChatPanel";
import ItineraryPanel from "../features/chat/components/ItineraryPanel";
import { MARKDOWN_STYLES } from "../features/chat/utils/chatHelpers";

const googleLibraries = ["places"];

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
    isGenerating,
    setIsGenerating,
    itineraryCache,
    aiItineraryCache
  } = useTrip();

  // 🏛️ STATE MANAGEMENT
  const [tripData, setTripData] = useState(() => {
    const saved = sessionStorage.getItem("chatData");
    return saved ? JSON.parse(saved) : {};
  });
  const tripDataRef = useRef(tripData);
  const activeTripId = realActiveTripId;
  const setActiveTripId = (id) => setActiveTrip(id);

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

  // ── Google Maps Initialization ───────────────────────────────────────────
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: googleLibraries
  });

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getActiveTripMeta = () => {
    if (!realTrips || realTrips.length === 0) return null;
    return realTrips.find((t) => t.id === activeTripId) || realTrips[0];
  };

  const getMessages = () => tripData[activeTripId]?.messages || [];

  const getItinerary = () => {
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
      updateTripItinerary(tripId, itinerary);
      updateAiItinerary(tripId, itinerary);
    }
  };

  // ── Domain Hooks ───────────────────────────────────────────────────────────
  const {
    activeTab,
    setActiveTab,
    activePlanView,
    activeDay,
    setActiveDay,
    placeIndex,
    setPlaceIndex,
    activeNearbyId,
    setActiveNearbyId,
    nearbyPlacesData,
    isFetchingNearby,
    enhanceItineraryWithImages,
    activeItineraryToRender,
    itineraryDays,
    places,
    currentPlace,
    currentNearby,
    dayTabs
  } = useChatItinerary({
    activeTripId,
    getItinerary,
    aiItineraryCache,
    tripData
  });

  const {
    input,
    setInput,
    isSending,
    messagesEndRef,
    sendMessage,
    handleSend
  } = useChatMessages({
    user,
    activeTripId,
    realTrips,
    tripData,
    tripDataRef,
    setTripData,
    updateTripState,
    setMessages,
    getItinerary,
    setItinerary,
    itineraryCache,
    saveItineraryToCache,
    updateAiItinerary,
    aiItineraryCache,
    activePlanView,
    setIsGenerating,
    userName,
    enhanceItineraryWithImages,
    loading
  });

  const {
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
  } = useOnboardingForm({
    isLoaded,
    createTrip,
    setActiveTripId,
    setIsGenerating,
    userName,
    setTripData,
    sendMessage
  });

  const messages = getMessages();
  const tripMeta = getActiveTripMeta();

  // ── Authentication Guard ──────────────────────────────────────────────────
  if (authLoading || !user) {
    return <AuthPromptModal authLoading={authLoading} loginWithGoogle={loginWithGoogle} />;
  }

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
      
      <style>{MARKDOWN_STYLES}</style>

      {/* ══════════ ONBOARDING MODAL ══════════ */}
      <OnboardingModal
        showOnboarding={showOnboarding}
        setShowOnboarding={setShowOnboarding}
        onboardingStep={onboardingStep}
        setOnboardingStep={setOnboardingStep}
        onboardingData={onboardingData}
        setOnboardingData={setOnboardingData}
        completeOnboarding={completeOnboarding}
        fetchTopAttractions={fetchTopAttractions}
        searchPlacesByCategory={searchPlacesByCategory}
        searchPlacesInDestination={searchPlacesInDestination}
        topAttractions={topAttractions}
        activeCategory={activeCategory}
        placeSearchQuery={placeSearchQuery}
        setPlaceSearchQuery={setPlaceSearchQuery}
        isFetchingPlaces={isFetchingPlaces}
        placesError={placesError}
      />

      <header className="h-8 flex items-center" />

      <main className="flex-1 w-full px-4 sm:px-10 lg:px-20 pb-8 lg:pb-0">
        <div className="h-full grid grid-cols-1 lg:grid-cols-[64%_36%] gap-8">
          {/* ══════════ CHAT PANEL ══════════ */}
          <ChatPanel
            tripMeta={tripMeta}
            isEditingTitle={isEditingTitle}
            setIsEditingTitle={setIsEditingTitle}
            editingTitle={editingTitle}
            setEditingTitle={setEditingTitle}
            handleNewChat={handleNewChat}
            messages={messages}
            activeTripId={activeTripId}
            sendMessage={sendMessage}
            isSending={isSending}
            messagesEndRef={messagesEndRef}
            handleSend={handleSend}
            input={input}
            setInput={setInput}
          />

          {/* ══════════ RIGHT PANEL ══════════ */}
          <ItineraryPanel
            activeTab={activeTab}
            dayTabs={dayTabs}
            activeDay={activeDay}
            setActiveDay={setActiveDay}
            activeItineraryToRender={activeItineraryToRender}
            itineraryDays={itineraryDays}
            navigate={navigate}
            currentPlace={currentPlace}
            places={places}
            placeIndex={placeIndex}
            setPlaceIndex={setPlaceIndex}
            isFetchingNearby={isFetchingNearby}
            currentNearby={currentNearby}
            nearbyPlacesData={nearbyPlacesData}
            activeNearbyId={activeNearbyId}
            setActiveNearbyId={setActiveNearbyId}
          />
        </div>
      </main>
    </motion.div>
  );
}
