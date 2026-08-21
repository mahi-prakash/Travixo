import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DragDropContext } from '@hello-pangea/dnd';
import { useJsApiLoader } from '@react-google-maps/api';
import { useTrip } from '../context/TripContext';
import { useUser } from '../context/UserContext';
import SEO from '../components/common/SEO';
import { FloatingChat } from '../features/chat/components/FloatingChat';
import { MapIcon, UserPlus, MessageSquare } from 'lucide-react';

// Bounded Domain Modules & Hooks
import { LIBRARIES } from '../features/planner/utils/plannerHelpers';
import { GOOGLE_MAPS_API_KEY } from '../utils/googleMaps';
import { usePlannerLogistics } from '../features/planner/hooks/usePlannerLogistics';
import { usePlannerItinerary } from '../features/planner/hooks/usePlannerItinerary';
import { useNearbyPlaces } from '../features/planner/hooks/useNearbyPlaces';
import { useDragAndDrop } from '../features/planner/hooks/useDragAndDrop';

// Modular UI Components
import PlannerHeader from '../features/planner/components/PlannerHeader';
import DayScheduleList from '../features/planner/components/DayScheduleList';
import PlannerMapView from '../features/planner/components/PlannerMapView';
import PlacePoolSidebar from '../features/planner/components/PlacePoolSidebar';
import AddPlaceModal from '../features/planner/components/AddPlaceModal';

export default function Planner() {
  const {
    activeTrip,
    activeTripId,
    itineraryCache,
    aiItineraryCache,
    saveItineraryToCache,
    loading,
    updateTripItinerary,
    joinTrip
  } = useTrip();

  const { tripId: urlTripId } = useParams();

  useEffect(() => {
    if (urlTripId && urlTripId !== activeTripId) {
      joinTrip(urlTripId);
    }
  }, [urlTripId, activeTripId, joinTrip]);

  const { user } = useUser();

  // Google Maps Load
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES
  });

  const [activeCenterView, setActiveCenterView] = useState('map'); // 'map' or 'chat'

  const [mapAuthFailed, setMapAuthFailed] = useState(false);
  useEffect(() => {
    window.gm_authFailure = () => setMapAuthFailed(true);
    return () => { window.gm_authFailure = null; };
  }, []);

  // 1. Itinerary state & actions
  const itinerary = usePlannerItinerary({
    isLoaded,
    activeTrip,
    activeTripId,
    itineraryCache,
    aiItineraryCache,
    saveItineraryToCache,
    loading,
    updateTripItinerary
  });

  // 2. Logistics & Geo Routing
  const logisticsState = usePlannerLogistics({
    isLoaded,
    displayDayOrder: itinerary.displayDayOrder,
    displayDays: itinerary.displayDays,
    mapMarkers: itinerary.mapMarkers,
    selectedDayId: itinerary.selectedDayId,
    activeTrip,
    activeItinerary: itinerary.activeItinerary,
    aiSourceForCheck: itinerary.aiSourceForCheck
  });

  // 3. Discovery & Google Places search
  const discoveryState = useNearbyPlaces({
    map: logisticsState.map,
    mapMarkers: itinerary.mapMarkers,
    destinationCoords: logisticsState.destinationCoords,
    baseCampHotel: logisticsState.baseCampHotel,
    activeTrip,
    activeItinerary: itinerary.activeItinerary,
    aiSourceForCheck: itinerary.aiSourceForCheck,
    activeTripId,
    placePool: itinerary.placePool
  });

  // 4. Drag & Drop Reordering
  const { onDragEnd } = useDragAndDrop({
    isReadOnly: itinerary.isReadOnly,
    days: itinerary.days,
    setDays: itinerary.setDays,
    placePool: itinerary.placePool,
    setPlacePool: itinerary.setPlacePool,
    pushToHistory: itinerary.pushToHistory,
    setHasUnsavedChanges: itinerary.setHasUnsavedChanges,
    unsavedRef: itinerary.unsavedRef,
    activeTripId,
    saveItineraryToCache
  });

  const isGenerating = activeTrip?.ai_status === "IN_PROGRESS" || activeTrip?.ai_status === "PENDING";

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
          <PlannerHeader
            planMode={itinerary.planMode}
            setPlanMode={itinerary.setPlanMode}
            saveChanges={itinerary.saveChanges}
            hasUnsavedChanges={itinerary.hasUnsavedChanges}
            isSaving={itinerary.isSaving}
            activeTrip={activeTrip}
            isModified={itinerary.isModified}
            history={itinerary.history}
            undo={itinerary.undo}
            restorePlan={itinerary.restorePlan}
            selectedDayId={itinerary.selectedDayId}
            setSelectedDayId={itinerary.setSelectedDayId}
            displayDayOrder={itinerary.displayDayOrder}
            displayDays={itinerary.displayDays}
          />
          <DayScheduleList
            isGenerating={isGenerating}
            planMode={itinerary.planMode}
            displayDayOrder={itinerary.displayDayOrder}
            visibleDays={itinerary.visibleDays}
            displayDays={itinerary.displayDays}
            collapsedDays={itinerary.collapsedDays}
            toggleCollapse={itinerary.toggleCollapse}
            baseCampHotel={logisticsState.baseCampHotel}
            logistics={logisticsState.logistics}
            isReadOnly={itinerary.isReadOnly}
            selectedPlace={itinerary.selectedPlace}
            setSelectedPlace={itinerary.setSelectedPlace}
            setHoveredMarkerId={itinerary.setHoveredMarkerId}
            editingTimeId={itinerary.editingTimeId}
            setEditingTimeId={itinerary.setEditingTimeId}
            updateItemTime={itinerary.updateItemTime}
            deleteItem={itinerary.deleteItem}
          />
        </motion.div>

        {/* --- CENTER CARD: DYNAMIC EXPERIENCE VIEW --- */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col h-[500px] lg:h-full relative z-10 border border-slate-200/50 overflow-hidden">
          {/* Top Navigation Bar */}
          <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/80 backdrop-blur">
            <div className="flex bg-slate-200/50 p-1 rounded-xl">
              <button
                onClick={() => setActiveCenterView('map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeCenterView === 'map' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <MapIcon size={16} /> Map
              </button>
              <button
                onClick={() => setActiveCenterView('chat')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeCenterView === 'chat' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <MessageSquare size={16} /> Chat
              </button>
            </div>

            <button
              onClick={() => {
                const url = `${window.location.origin}/planner/${activeTripId || ''}`;
                navigator.clipboard.writeText(url);
                alert("Invite link copied to clipboard!");
              }}
              className="flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 rounded-lg text-sm font-bold hover:bg-sky-200 transition-colors"
            >
              <UserPlus size={16} /> Invite Friends
            </button>
          </div>

          {/* Dynamic Content Area */}
          <div className="flex-1 relative min-h-0">
            {activeCenterView === 'map' ? (
              <PlannerMapView
                selectedPlace={itinerary.selectedPlace}
                setSelectedPlace={itinerary.setSelectedPlace}
                map={logisticsState.map}
                setMap={logisticsState.setMap}
                isLoaded={isLoaded}
                mapAuthFailed={mapAuthFailed}
                loadError={loadError}
                mapMarkers={itinerary.mapMarkers}
                destinationCoords={logisticsState.destinationCoords}
                directions={logisticsState.directions}
                mapPolylines={itinerary.mapPolylines}
                selectedDayId={itinerary.selectedDayId}
                baseCampHotel={logisticsState.baseCampHotel}
                baseCampStation={logisticsState.baseCampStation}
                baseCampMode={logisticsState.baseCampMode}
                setBaseCampMode={logisticsState.setBaseCampMode}
                baseCampSearch={logisticsState.baseCampSearch}
                setBaseCampSearch={logisticsState.setBaseCampSearch}
                handleBaseCampLoad={logisticsState.handleBaseCampLoad}
                handleBaseCampPlaceChanged={logisticsState.handleBaseCampPlaceChanged}
                activeTrip={activeTrip}
                displayDayOrder={itinerary.displayDayOrder}
                displayDays={itinerary.displayDays}
              />
            ) : (
              <FloatingChat 
                tripId={activeTripId || "default_trip"} 
                currentUser={user?.email || "Guest"} 
                isEmbedded={true}
              />
            )}
          </div>
        </div>

        {/* --- RIGHT CARD: EXPLORE & DRAFTS POCKET --- */}
        <PlacePoolSidebar
          isReadOnly={itinerary.isReadOnly}
          handlePlaceSearch={discoveryState.handlePlaceSearch}
          searchQuery={discoveryState.searchQuery}
          setSearchQuery={discoveryState.setSearchQuery}
          activeTrip={activeTrip}
          activeTab={discoveryState.activeTab}
          setActiveTab={discoveryState.setActiveTab}
          isSearchingPlaces={discoveryState.isSearchingPlaces}
          displayedExplorationPlaces={discoveryState.displayedExplorationPlaces}
          safeSavedPlaces={itinerary.placePool}
          safeAiNearbyPlaces={discoveryState.displayedExplorationPlaces}
          safeLivePopularPlaces={discoveryState.livePopularPlaces}
          isLoadingPopular={discoveryState.isLoadingPopular}
          setSelectedPlace={itinerary.setSelectedPlace}
          placePool={itinerary.placePool}
          setPlacePool={itinerary.setPlacePool}
          pushToHistory={itinerary.pushToHistory}
          days={itinerary.days}
          addFeedback={itinerary.addFeedback}
          setAddingPlace={itinerary.setAddingPlace}
          displayDayOrder={itinerary.displayDayOrder}
        />
      </DragDropContext>



      <AddPlaceModal
        addingPlace={itinerary.addingPlace}
        setAddingPlace={itinerary.setAddingPlace}
        displayDayOrder={itinerary.displayDayOrder}
        days={itinerary.days}
        addToDay={itinerary.addToDay}
      />
    </div>
  );
}

