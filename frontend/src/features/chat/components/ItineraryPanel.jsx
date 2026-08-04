import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MapPin, ChevronRight, ChevronLeft, Star } from "lucide-react";
import { getDayNumber } from "../utils/chatHelpers";

export default function ItineraryPanel({
  activeTab,
  dayTabs,
  activeDay,
  setActiveDay,
  activeItineraryToRender,
  itineraryDays,
  navigate,
  currentPlace,
  places,
  placeIndex,
  setPlaceIndex,
  isFetchingNearby,
  currentNearby,
  nearbyPlacesData,
  activeNearbyId,
  setActiveNearbyId
}) {
  return (
    <aside className="h-fit lg:h-full">
      <div className="h-[500px] lg:h-[570px] rounded-[32px] bg-white shadow-2xl border border-slate-100 flex flex-col relative">
        {/* HEADER TITLE */}
        <div className="pt-1.5 pb-0 text-center shrink-0">
          <h2 className="text-[30px] font-bold text-slate-800 tracking-tight">Itinerary</h2>
        </div>

        {/* ── ITINERARY DISPLAY ── */}
        <AnimatePresence mode="wait">
          {activeTab === "itinerary" && (
            <motion.div
              key="itinerary-tab"
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute top-[64px] left-1/2 -translate-x-1/2 w-[85%] z-20"
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
                {!activeItineraryToRender || itineraryDays.length === 0 ? (
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
                            <span className="text-[13px] font-bold text-sky-600">
                              {"Day " + day.day}
                            </span>
                          </div>
                          <div className="h-px flex-1 bg-slate-100" />
                        </div>

                        {(day.items || day.activities || []).map(
                          (activity, actIdx) => {
                            const Icon = activity.icon || MapPin;
                            const isLastInDay =
                              actIdx ===
                              (day.items?.length || day.activities?.length || 1) - 1;
                            const isLastDay =
                              dayIdx ===
                              (activeItineraryToRender.days?.length || 1) - 1;

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
                                      <Icon size={12} /> {activity.time || "10:00 AM"} •{" "}
                                      {activity.type || "SIGHTSEEING"}
                                    </div>
                                    <div className="font-bold text-[15px] text-slate-900 mt-1">
                                      {activity.title || activity.name || "Must-See Place"}
                                    </div>
                                    <div className="text-[11px] text-slate-400 mt-0.5">
                                      {activity.location || activity.desc || "Destination Area"}
                                    </div>
                                  </div>
                                  {activity.img && (
                                    <img
                                      src={activity.img}
                                      alt={activity.title || activity.name}
                                      className="h-14 w-14 rounded-xl object-cover shadow-lg ring-4 ring-white translate-y-[-2px]"
                                    />
                                  )}
                                </motion.div>
                              </motion.div>
                            );
                          }
                        )}
                      </div>
                    ))
                )}
              </div>

              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/planner")}
                disabled={!activeItineraryToRender}
                className="w-full py-4 rounded-2xl bg-sky-600 text-white font-bold text-sm shadow-xl shadow-sky-100 flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-sky-300 transition-all duration-300 disabled:opacity-40"
              >
                Open & Customize in Planner
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
                    As planned · Day {currentPlace?.dayNum || 1}
                  </p>
                </div>

                <div className="relative">
                  <button
                    onClick={() => {
                      const currentDayNum = Number(currentPlace?.dayNum || 1);
                      const prevDayNum = currentDayNum - 1;
                      const firstPlaceIdx = places.findIndex(p => Number(p.dayNum) === prevDayNum);
                      if (firstPlaceIdx !== -1) setPlaceIndex(firstPlaceIdx);
                    }}
                    disabled={Number(currentPlace?.dayNum || 1) <= 1}
                    className="absolute left-[-50px] top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-sky-600 flex items-center justify-center shadow-md hover:bg-sky-700 disabled:opacity-40 transition z-30"
                  >
                    <ChevronLeft size={20} className="text-white" />
                  </button>
                  <button
                    onClick={() => {
                      const currentDayNum = Number(currentPlace?.dayNum || 1);
                      const nextDayNum = currentDayNum + 1;
                      const firstPlaceIdx = places.findIndex(p => Number(p.dayNum) === nextDayNum);
                      if (firstPlaceIdx !== -1) setPlaceIndex(firstPlaceIdx);
                    }}
                    disabled={Number(currentPlace?.dayNum || 1) >= (itineraryDays.length)}
                    className="absolute right-[-50px] top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-sky-600 flex items-center justify-center shadow-md hover:bg-sky-700 disabled:opacity-40 transition z-30"
                  >
                    <ChevronRight size={20} className="text-white" />
                  </button>

                  {!currentPlace?.title && (
                    <div className="py-20 text-center text-slate-400 text-xs font-semibold italic">
                      No places found in this itinerary.
                    </div>
                  )}

                  {currentPlace?.title && (
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
                          .filter((p, idx) => p.dayNum === currentPlace?.dayNum && idx !== placeIndex)
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
                    Optional · Day {currentPlace?.dayNum || 1}
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
  );
}
