import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, Sparkles, Clock, MapPin, Send, Users } from "lucide-react";
import DateTimeSplitInput from "./DateTimeSplitInput";
import StationSearchInput from "./StationSearchInput";
import HotelBookedSearch from "./HotelBookedSearch";
import HotelRecommendationEngine from "./HotelRecommendationEngine";

export default function OnboardingModal({
  showOnboarding,
  setShowOnboarding,
  onboardingStep,
  setOnboardingStep,
  onboardingData,
  setOnboardingData,
  completeOnboarding,
  fetchTopAttractions,
  searchPlacesByCategory,
  searchPlacesInDestination,
  topAttractions,
  activeCategory,
  placeSearchQuery,
  setPlaceSearchQuery,
  isFetchingPlaces,
  placesError
}) {
  return (
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
                {/* ── STEP 1: Mode Selection ── */}
                {onboardingStep === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                    <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto">
                      <Sparkles className="text-sky-600 w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">What's the vibe?</h2>
                    <p className="text-sm text-slate-500">Do you want to plan a specific trip, or just explore a destination?</p>
                    <div className="flex flex-col gap-3 pt-2">
                      <button onClick={() => setOnboardingStep(2)} className="w-full py-4 bg-sky-600 text-white rounded-xl font-bold text-base hover:bg-sky-700 transition shadow-lg flex items-center justify-center gap-2">
                        <Clock size={18} /> I have dates & want to plan
                      </button>
                      <button onClick={() => { setOnboardingData({ ...onboardingData, isExploring: true }); setOnboardingStep(2); }} className="w-full py-4 bg-slate-100 text-slate-700 rounded-xl font-bold text-base hover:bg-slate-200 transition flex items-center justify-center gap-2">
                        <MapPin size={18} /> Just explore a place (Skip)
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 2: The Basics (Origin, Dest, Days) ── */}
                {onboardingStep === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                      <MapPin className="text-emerald-600 w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">The Basics</h2>

                    <div className="space-y-3 text-left">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Destination</label>
                        <input autoFocus value={onboardingData.destination} onChange={(e) => setOnboardingData({ ...onboardingData, destination: e.target.value })} placeholder="e.g. Puri, Odisha" className="w-full mt-1 px-4 py-2.5 bg-slate-100/50 border-2 border-transparent focus:border-sky-600 rounded-xl outline-none text-sm transition" />
                      </div>

                      {onboardingData.destination && onboardingData.destination.length > 2 && (
                        <div className="mt-2 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Must-Visit Places (Optional)</label>
                            <button type="button" onClick={() => fetchTopAttractions(onboardingData.destination)} className="text-[10px] text-sky-600 font-bold bg-sky-100 px-2.5 py-1 rounded-md hover:bg-sky-200 transition">Fetch Top</button>
                          </div>

                          <div className="flex gap-1 mb-2 overflow-x-auto pb-0.5">
                            <button
                              type="button"
                              onClick={() => searchPlacesByCategory('sights', onboardingData.destination)}
                              className={`px-2 py-1 rounded-lg font-bold text-[10px] transition whitespace-nowrap border ${activeCategory === 'sights' && topAttractions.length > 0 ? 'bg-sky-600 text-white border-sky-600 shadow-xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                            >
                              Sights
                            </button>
                            <button
                              type="button"
                              onClick={() => searchPlacesByCategory('dining', onboardingData.destination)}
                              className={`px-2 py-1 rounded-lg font-bold text-[10px] transition whitespace-nowrap border ${activeCategory === 'dining' ? 'bg-sky-600 text-white border-sky-500 shadow-xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                            >
                              Iconic Dining
                            </button>
                            <button
                              type="button"
                              onClick={() => searchPlacesByCategory('markets', onboardingData.destination)}
                              className={`px-2 py-1 rounded-lg font-bold text-[10px] transition whitespace-nowrap border ${activeCategory === 'markets' ? 'bg-sky-600 text-white border-sky-600 shadow-xs' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                            >
                              Famous Markets
                            </button>
                          </div>

                          <div className="flex gap-1.5 mb-2">
                            <input
                              type="text"
                              value={placeSearchQuery}
                              onChange={(e) => setPlaceSearchQuery(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (placeSearchQuery.trim()) searchPlacesInDestination(placeSearchQuery, onboardingData.destination);
                                }
                              }}
                              placeholder={`Search cafes, monuments, beaches in ${onboardingData.destination}...`}
                              className="flex-1 px-3 py-1.5 bg-white border border-slate-200 focus:border-sky-500 rounded-lg text-xs outline-none text-slate-700 transition font-medium placeholder:font-normal"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (placeSearchQuery.trim()) searchPlacesInDestination(placeSearchQuery, onboardingData.destination);
                              }}
                              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                            >
                              Search
                            </button>
                          </div>

                          {isFetchingPlaces && <p className="text-xs text-slate-500 italic py-1">Searching Google Maps...</p>}
                          {placesError && <p className="text-xs text-red-500 py-1">{placesError}</p>}

                          {(() => {
                            const mustVisit = onboardingData.mustVisitPlaces || [];
                            // Keep selected tags pinned at the top so successive searches never hide what the user already checked
                            const combinedPlaces = [
                              ...mustVisit.map(name => ({ name, place_id: `selected-${name}` })),
                              ...topAttractions.filter(p => !mustVisit.includes(p.name))
                            ];

                            return !isFetchingPlaces && combinedPlaces.length > 0 ? (
                              <div className="flex flex-col gap-1 mt-2 max-h-24 overflow-y-auto pr-1 border border-slate-200 bg-white rounded-lg p-1.5 shadow-inner">
                                {combinedPlaces.map((place) => {
                                  const isSelected = mustVisit.includes(place.name);
                                  return (
                                    <button
                                      key={place.place_id}
                                      type="button"
                                      onClick={() => {
                                        const newPlaces = isSelected
                                          ? mustVisit.filter(p => p !== place.name)
                                          : [...mustVisit, place.name];
                                        setOnboardingData({ ...onboardingData, mustVisitPlaces: newPlaces });
                                        try { sessionStorage.setItem('STEP_ONE_MUST_VISIT', JSON.stringify(newPlaces)); } catch (e) { }
                                      }}
                                      className={`w-full text-left text-[12px] px-2.5 py-1.5 rounded-md transition-all flex items-center justify-between ${isSelected ? 'bg-sky-50 text-sky-700 font-semibold border border-sky-200' : 'text-slate-700 hover:bg-slate-50 border border-transparent'}`}
                                    >
                                      <span className="truncate pr-2">{place.name}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            ) : null;
                          })()}
                        </div>
                      )}

                      {!onboardingData.isExploring && (
                        <>
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Starting From / Origin (Optional)</label>
                            <input value={onboardingData.origin} onChange={(e) => setOnboardingData({ ...onboardingData, origin: e.target.value })} placeholder="e.g. Bhubaneswar" className="w-full mt-1 px-4 py-2.5 bg-slate-100/50 border-2 border-transparent focus:border-sky-600 rounded-xl outline-none text-sm transition" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Number of Days</label>
                            <input type="number" min="1" max="30" value={onboardingData.days} onChange={(e) => setOnboardingData({ ...onboardingData, days: e.target.value })} placeholder="e.g. 4" className="w-full mt-1 px-4 py-2.5 bg-slate-100/50 border-2 border-transparent focus:border-sky-600 rounded-xl outline-none text-sm transition" />
                          </div>
                        </>
                      )}
                    </div>

                    <div className="pt-2">
                      <button onClick={() => onboardingData.isExploring ? setOnboardingStep(5) : setOnboardingStep(3)} disabled={!onboardingData.destination || (!onboardingData.isExploring && !onboardingData.days)} className="w-full py-3 bg-sky-600 text-white rounded-xl font-bold text-base hover:bg-sky-700 transition disabled:opacity-50">
                        Next
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 3: Transport ── */}
                {onboardingStep === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                    <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto">
                      <Send className="text-purple-600 w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Travel Logistics</h2>
                    <p className="text-sm text-slate-500">Have you booked your flight or train to {onboardingData.destination} yet?</p>

                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setOnboardingData({ ...onboardingData, transportBooked: 'yes' })} className={`py-3 rounded-xl border-2 transition font-bold text-sm ${onboardingData.transportBooked === 'yes' ? "border-sky-600 bg-sky-50 text-sky-600" : "border-slate-100 text-slate-600"}`}>Yes, Booked!</button>
                      <button onClick={() => setOnboardingData({ ...onboardingData, transportBooked: 'no' })} className={`py-3 rounded-xl border-2 transition font-bold text-sm ${onboardingData.transportBooked === 'no' ? "border-sky-600 bg-sky-50 text-sky-600" : "border-slate-100 text-slate-600"}`}>Not Yet</button>
                    </div>

                    {onboardingData.transportBooked === 'yes' && (
                      <div className="text-left animate-fade-in space-y-3">
                        <StationSearchInput
                          label="Arrival Station / Airport"
                          value={onboardingData.arrivalStation}
                          onChange={(val) => setOnboardingData({ ...onboardingData, arrivalStation: val })}
                          placeholder="e.g. Puri Railway Station"
                          destination={onboardingData.destination}
                        />
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Approximate Arrival Date & Time</label>
                          <DateTimeSplitInput value={onboardingData.arrivalTime} onChange={(val) => setOnboardingData({ ...onboardingData, arrivalTime: val })} />
                        </div>
                      </div>
                    )}

                    {onboardingData.transportBooked === 'no' && (
                      <div className="text-left animate-fade-in space-y-3">
                        <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 mb-2">
                          <p className="text-xs text-orange-800 font-medium">No worries! Let us know your expected arrival so we can plan day 1.</p>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Expected Arrival Date & Time</label>
                          <DateTimeSplitInput value={onboardingData.arrivalTime} onChange={(val) => setOnboardingData({ ...onboardingData, arrivalTime: val })} />
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <button onClick={() => setOnboardingStep(4)} disabled={(onboardingData.transportBooked === 'yes' && !onboardingData.arrivalStation) || (onboardingData.transportBooked === 'no' && !onboardingData.arrivalTime)} className="w-full py-3 bg-sky-600 text-white rounded-xl font-bold text-base hover:bg-sky-700 transition disabled:opacity-50">Next</button>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 4: Hotels ── */}
                {onboardingStep === 4 && (
                  <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto">
                      <MapPin className="text-blue-600 w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Accommodation</h2>
                    <p className="text-sm text-slate-500">Where are you staying in {onboardingData.destination}?</p>

                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setOnboardingData({ ...onboardingData, hotelBooked: 'yes' })} className={`py-3 rounded-xl border-2 transition font-bold text-sm ${onboardingData.hotelBooked === 'yes' ? "border-sky-600 bg-sky-50 text-sky-600" : "border-slate-100 text-slate-600"}`}>Yes, Booked!</button>
                      <button onClick={() => setOnboardingData({ ...onboardingData, hotelBooked: 'no' })} className={`py-3 rounded-xl border-2 transition font-bold text-sm ${onboardingData.hotelBooked === 'no' ? "border-sky-600 bg-sky-50 text-sky-600" : "border-slate-100 text-slate-600"}`}>Not Yet</button>
                    </div>

                    {onboardingData.hotelBooked === 'yes' && (
                      <div className="text-left animate-fade-in">
                        <HotelBookedSearch
                          value={onboardingData.hotelAddress}
                          onChange={(val) => setOnboardingData({ ...onboardingData, hotelAddress: val })}
                          placeholder="e.g. Mayfair Heritage, Puri"
                          destination={onboardingData.destination}
                        />
                      </div>
                    )}

                    {onboardingData.hotelBooked === 'no' && (
                      <div className="text-left animate-fade-in space-y-2">
                        <p className="text-xs text-sky-800 font-medium bg-sky-50 p-2.5 rounded-xl border border-sky-100">
                          No problem! We will schedule your itinerary around your Must-Visit attractions. You can pick your ideal hotel on the interactive map in the Planner page later!
                        </p>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Preferred Area / Vibe (Optional)</label>
                          <input value={onboardingData.hotelAddress || ""} onChange={(e) => setOnboardingData({ ...onboardingData, hotelAddress: e.target.value })} placeholder="e.g. Near Sea Beach or Downtown" className="w-full mt-1 px-4 py-2 bg-slate-100/50 border-2 focus:bg-white focus:border-sky-600 rounded-xl outline-none text-sm transition" />
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <button onClick={() => setOnboardingStep(5)} disabled={onboardingData.hotelBooked === 'yes' && !onboardingData.hotelAddress} className="w-full py-3 bg-sky-600 text-white rounded-xl font-bold text-base hover:bg-sky-700 transition disabled:opacity-50">Next</button>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 5: Return Transport ── */}
                {onboardingStep === 5 && (
                  <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto">
                      <Send className="text-rose-600 w-6 h-6 rotate-180" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Return Trip</h2>
                    <p className="text-sm text-slate-500">Have you booked your return ticket back home?</p>

                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setOnboardingData({ ...onboardingData, returnTransportBooked: 'yes' })} className={`py-3 rounded-xl border-2 transition font-bold text-sm ${onboardingData.returnTransportBooked === 'yes' ? "border-sky-600 bg-sky-50 text-sky-600" : "border-slate-100 text-slate-600"}`}>Yes, Booked!</button>
                      <button onClick={() => setOnboardingData({ ...onboardingData, returnTransportBooked: 'no' })} className={`py-3 rounded-xl border-2 transition font-bold text-sm ${onboardingData.returnTransportBooked === 'no' ? "border-sky-600 bg-sky-50 text-sky-600" : "border-slate-100 text-slate-600"}`}>Not Yet</button>
                    </div>

                    {onboardingData.returnTransportBooked === 'yes' && (
                      <div className="text-left animate-fade-in space-y-3">
                        <StationSearchInput
                          label="Departure Station / Airport"
                          value={onboardingData.departureStation}
                          onChange={(val) => setOnboardingData({ ...onboardingData, departureStation: val })}
                          placeholder="e.g. Puri Railway Station"
                          destination={onboardingData.destination}
                        />
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Approximate Departure Date & Time</label>
                          <DateTimeSplitInput value={onboardingData.departureTime} onChange={(val) => setOnboardingData({ ...onboardingData, departureTime: val })} />
                        </div>
                      </div>
                    )}

                    {onboardingData.returnTransportBooked === 'no' && (
                      <div className="text-left animate-fade-in space-y-3">
                        <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 mb-2">
                          <p className="text-xs text-orange-800 font-medium">No worries! Let us know your expected departure time so we can perfectly plan your final day activities.</p>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Expected Departure Date & Time</label>
                          <DateTimeSplitInput value={onboardingData.departureTime} onChange={(val) => setOnboardingData({ ...onboardingData, departureTime: val })} />
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <button onClick={() => setOnboardingStep(6)} disabled={(onboardingData.returnTransportBooked === 'yes' && (!onboardingData.departureStation || !onboardingData.departureTime)) || (onboardingData.returnTransportBooked === 'no' && !onboardingData.departureTime)} className="w-full py-3 bg-sky-600 text-white rounded-xl font-bold text-base hover:bg-sky-700 transition disabled:opacity-50">Next</button>
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 6: Budget + People + Vibe ── */}
                {onboardingStep === 6 && (
                  <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                      <Users className="text-orange-600 w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Final details</h2>
                    <p className="text-sm text-slate-500 mb-4">Budget, crew & energy.</p>

                    <div className="space-y-4 text-left">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Budget</p>
                        <div className="grid grid-cols-4 gap-1.5">
                          {["Budget", "Moderate", "Luxury", "Surprise"].map((b) => (
                            <button key={b} onClick={() => setOnboardingData({ ...onboardingData, budget: b })} className={`py-1.5 rounded-lg border-2 transition font-bold text-[10px] ${onboardingData.budget === b ? "border-sky-600 bg-sky-50 text-sky-600" : "border-slate-100 text-slate-600"}`}>{b}</button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Who's going?</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {["Solo", "2 People", "Small Squad", "Large Group"].map((p) => (
                            <button key={p} onClick={() => setOnboardingData({ ...onboardingData, people: p })} className={`py-1.5 rounded-lg border-2 transition font-bold text-[10px] ${onboardingData.people === p ? "border-sky-600 bg-sky-50 text-sky-600" : "border-slate-100 text-slate-600"}`}>{p}</button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Vibe</p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {["Relaxing", "Adventure", "Balanced", "Spiritual", "Party", "Surprise"].map((v) => (
                            <button key={v} onClick={() => setOnboardingData({ ...onboardingData, vibe: v })} className={`py-1.5 rounded-lg border-2 transition font-bold text-[10px] ${onboardingData.vibe === v ? "border-sky-600 bg-sky-50 text-sky-600" : "border-slate-100 text-slate-600"}`}>{v}</button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3">
                      <button onClick={() => completeOnboarding(false)} className="w-full py-3 bg-sky-600 text-white rounded-xl font-bold text-base hover:bg-sky-700 transition shadow-lg">
                        Build Itinerary
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
  );
}
