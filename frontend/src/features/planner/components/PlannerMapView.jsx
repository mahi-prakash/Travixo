import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleMap, DirectionsRenderer, Polyline, Autocomplete } from '@react-google-maps/api';
import { Hotel, Train, Undo2, MapPin } from 'lucide-react';
import PlaceDetailsCard from './PlaceDetailsCard';
import { containerStyle, mapOptions } from '../utils/plannerHelpers';

export default function PlannerMapView({
  selectedPlace,
  setSelectedPlace,
  map,
  setMap,
  isLoaded,
  mapAuthFailed,
  loadError,
  mapMarkers,
  destinationCoords,
  directions,
  mapPolylines,
  selectedDayId,
  baseCampHotel,
  baseCampStation,
  baseCampMode,
  setBaseCampMode,
  baseCampSearch,
  setBaseCampSearch,
  handleBaseCampLoad,
  handleBaseCampPlaceChanged,
  activeTrip,
  displayDayOrder,
  displayDays
}) {
  const centerCoord = (mapMarkers && mapMarkers.length > 0 && mapMarkers[0]?.pos)
    ? { lat: Number(mapMarkers[0].pos[0]), lng: Number(mapMarkers[0].pos[1]) }
    : (destinationCoords || { lat: 19.8135, lng: 85.8312 });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white/60 backdrop-blur-2xl rounded-[40px] shadow-2xl border border-white/50 h-[500px] lg:h-full p-4 sm:p-8 flex flex-col z-0 relative group/center min-h-0"
    >
      <AnimatePresence mode="wait">
        {selectedPlace ? (
          <PlaceDetailsCard
            selectedPlace={selectedPlace}
            setSelectedPlace={setSelectedPlace}
            map={map}
          />
        ) : (
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
                    center={centerCoord}
                    zoom={13}
                    options={mapOptions}
                    onLoad={(mapInstance) => setMap(mapInstance)}
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
                    {!directions && (mapPolylines || []).map((route, idx) => (
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
                    {(mapMarkers || []).length > 1 && (
                      <Polyline
                        path={(mapMarkers || []).map(m => ({ lat: m.pos[0], lng: m.pos[1] }))}
                        options={{
                          strokeColor: '#0284c7',
                          strokeOpacity: selectedDayId === 'all' ? 0.6 : 0.1,
                          strokeWeight: 2
                        }}
                      />
                    )}
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
                    className={`px-3 py-2 rounded-xl shadow-md font-bold flex items-center gap-2 border transition-all ${
                      baseCampHotel ? 'bg-sky-600 text-white border-sky-700' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <Hotel size={16} />
                    <span className="text-xs">{baseCampHotel ? 'Hotel' : 'Add Hotel'}</span>
                  </button>
                  <button
                    onClick={() => setBaseCampMode('station')}
                    className={`px-3 py-2 rounded-xl shadow-md font-bold flex items-center gap-2 border transition-all ${
                      baseCampStation ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
                    }`}
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
                            value={baseCampSearch || ""}
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
                      <p className="text-xs text-slate-500 font-bold mt-0.5">{(displayDayOrder || []).length} Days • 14.2 km</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Stops</span>
                      <span className="text-sm font-extrabold text-slate-800">
                        {Object.values(displayDays || {}).reduce((sum, d) => sum + (d?.items?.length || 0), 0)}
                      </span>
                    </div>
                    <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Days</span>
                      <span className="text-sm font-extrabold text-slate-800">{(displayDayOrder || []).length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
