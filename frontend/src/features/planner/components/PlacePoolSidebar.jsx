import React from 'react';
import { motion } from 'framer-motion';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Search, Star, MapPin, Bookmark, Check, Plus } from 'lucide-react';

export default function PlacePoolSidebar({
  isReadOnly,
  handlePlaceSearch,
  searchQuery,
  setSearchQuery,
  activeTrip,
  activeTab,
  setActiveTab,
  isSearchingPlaces,
  displayedExplorationPlaces,
  safeSavedPlaces,
  safeAiNearbyPlaces,
  safeLivePopularPlaces,
  isLoadingPopular,
  setSelectedPlace,
  placePool,
  setPlacePool,
  pushToHistory,
  days,
  addFeedback,
  setAddingPlace,
  displayDayOrder
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl flex flex-col overflow-hidden h-[500px] lg:h-full z-10 transition-all min-h-0 ${
        isReadOnly ? 'grayscale-[0.5] opacity-60 pointer-events-none' : ''
      }`}
    >
      {/* Header & Tabs */}
      <div className="p-6 pb-2 shrink-0 bg-white/50 backdrop-blur-md z-20">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Add to Itinerary</h2>

        <form onSubmit={handlePlaceSearch} className="relative group mb-4">
          <button
            type="submit"
            onClick={handlePlaceSearch}
            title="Search Places"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-sky-600 transition-colors cursor-pointer rounded-lg hover:bg-slate-100/80 z-10"
          >
            <Search size={18} />
          </button>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search places in ${activeTrip?.name?.split(' ')[0] || 'your destination'}...`}
            className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-medium outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 transition-all shadow-sm"
          />
        </form>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          {['drafts', 'popular'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all duration-300 ${
                activeTab === tab ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
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
              className={`space-y-4 pt-2 min-h-[180px] rounded-3xl transition-all ${
                snapshot.isDraggingOver ? 'bg-amber-50/60 p-2 border-2 border-dashed border-amber-400' : ''
              }`}
            >
              {searchQuery.trim() && (
                <div className="px-1 mb-2">
                  <p className="text-[11px] font-bold text-slate-400">
                    Results for <span className="text-sky-600">“{searchQuery}”</span>
                  </p>
                </div>
              )}

              {/* LOADING STATE FOR SEARCH */}
              {searchQuery.trim() && isSearchingPlaces && (
                <div className="flex flex-col items-center justify-center py-10 px-6 text-center bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-100/80 my-2">
                  <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin mb-3" />
                  <p className="text-xs font-bold text-slate-700">Searching places for "{searchQuery}"...</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">Fetching verified spots from Google Places 🗺️</p>
                </div>
              )}

              {/* EMPTY STATE FOR SEARCH */}
              {!isSearchingPlaces && searchQuery.trim() && (displayedExplorationPlaces || []).length === 0 && (
                <div className="flex flex-col items-center justify-center mt-4 py-8 px-6 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="text-sm font-extrabold text-slate-700 mb-1">No places found for "{searchQuery}"</h3>
                  <p className="text-xs text-slate-400">Try a different keyword or check spelling.</p>
                </div>
              )}

              {/* EMPTY STATE FOR SAVED & DRAFTS */}
              {!searchQuery.trim() && (activeTab === 'drafts' || activeTab === 'saved') && (safeSavedPlaces || []).length === 0 && (
                <div className="flex flex-col items-center justify-center mt-6 py-8 px-6 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <h3 className="text-base font-extrabold text-slate-800 mb-2">Your drafts pocket is empty!</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mb-5 max-w-[230px]">
                    Drag activities here from your timeline on the left to unschedule them, or discover new places to stage them before adding to a day!
                  </p>
                </div>
              )}

              {/* LOADING STATE FOR POPULAR SPOTS */}
              {!searchQuery.trim() && (activeTab === 'popular' || activeTab === 'nearby') && isLoadingPopular && (
                <div className="flex flex-col items-center justify-center py-10 px-6 text-center bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-100/80 my-2">
                  <div className="w-8 h-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin mb-3" />
                  <p className="text-xs font-bold text-slate-700">Curating top attractions & dining...</p>
                </div>
              )}

              {/* EMPTY STATE FOR POPULAR SPOTS */}
              {!isLoadingPopular &&
                (activeTab === 'popular' || activeTab === 'nearby') &&
                (safeAiNearbyPlaces || []).length === 0 &&
                (safeLivePopularPlaces || []).length === 0 &&
                !searchQuery.trim() && (
                  <div className="flex flex-col items-center justify-center mt-4 py-8 px-6 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-extrabold text-slate-700 mb-1">No spots found nearby</h3>
                    <p className="text-xs text-slate-400">Try zooming out on the map to expand your exploration radius.</p>
                  </div>
                )}

              {(displayedExplorationPlaces || []).map((place, idx) => (
                <Draggable
                  key={place.id || `place-${idx}`}
                  draggableId={String(place.id || `place-${idx}`)}
                  index={idx}
                  isDragDisabled={activeTab !== 'drafts' && activeTab !== 'saved'}
                >
                  {(dragProvided, dragSnapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      onClick={() => setSelectedPlace(place)}
                      className={`group bg-white rounded-[24px] p-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-slate-100 cursor-pointer ${
                        dragSnapshot.isDragging ? 'opacity-95 scale-[1.03] z-50 shadow-2xl border-sky-400' : ''
                      }`}
                    >
                      {/* Image or Activity Banner */}
                      {place.img ? (
                        <div className="relative h-32 w-full rounded-2xl overflow-hidden mb-3 group-hover:shadow-md transition-shadow">
                          <img
                            src={place.img}
                            alt={place.name || place.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
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
                            <span className="text-xs font-extrabold text-sky-900 uppercase tracking-wider">
                              {place.type || 'Activity'}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold bg-white/80 px-2 py-1 rounded-md text-slate-600 shadow-2xs">
                            Staged Draft
                          </span>
                        </div>
                      )}

                      <div className="px-1">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex flex-col">
                            <h4 className="font-bold text-slate-800 text-sm group-hover:text-sky-600 transition-colors">
                              {place.name || place.title || 'Activity'}
                            </h4>
                            {place.aiMatchScore && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                                <span className="text-[9px] font-black italic text-emerald-600 tracking-tighter uppercase">
                                  {place.aiMatchScore}% Match
                                </span>
                              </div>
                            )}
                          </div>
                          {/* Add Action */}
                          <div className="relative flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {(activeTab === 'popular' || activeTab === 'nearby' || Boolean(searchQuery.trim())) &&
                              !(placePool || []).some((p) => p.id === place.id || p.name === (place.name || place.title)) && (
                                <button
                                  onClick={() => {
                                    if (pushToHistory) pushToHistory();
                                    setPlacePool((prev) => [{ ...place, id: place.id || `draft-${Date.now()}` }, ...prev]);
                                  }}
                                  title="Save to Drafts & Saved Pocket"
                                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white border border-amber-100/60"
                                >
                                  <Bookmark size={14} strokeWidth={2.5} />
                                </button>
                              )}
                            {Object.values(days || {}).some((d) =>
                              (d.items || []).some((it) => it.placeId === place.id || it.id === place.id)
                            ) ? (
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
                              <button
                                onClick={() =>
                                  setAddingPlace({
                                    place,
                                    dayId: (displayDayOrder || [])[0],
                                    time: '10:00 AM',
                                  })
                                }
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm group/btn bg-sky-50 text-sky-600 hover:bg-sky-600 hover:text-white"
                              >
                                <Plus size={16} />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                          {place.desc || place.description || 'No details available.'}
                        </p>

                        <div className="flex justify-end mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPlace(place);
                            }}
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
  );
}
