import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droppable } from '@hello-pangea/dnd';
import { Sparkles, Rocket, Hotel, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ActivityCard from './ActivityCard';

export default function DayScheduleList({
  isGenerating,
  planMode,
  displayDayOrder,
  visibleDays,
  displayDays,
  collapsedDays,
  toggleCollapse,
  baseCampHotel,
  logistics,
  isReadOnly,
  selectedPlace,
  setSelectedPlace,
  setHoveredMarkerId,
  editingTimeId,
  setEditingTimeId,
  updateItemTime,
  deleteItem
}) {
  const navigate = useNavigate();

  return (
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
        {planMode === 'ai' && (displayDayOrder || []).length === 0 && !isGenerating && (
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
        {planMode === 'user' && (displayDayOrder || []).length === 0 && (
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

        {(visibleDays || []).map((dayId, dayIdx) => {
          const day = (displayDays || {})[dayId];
          if (!day) return null;
          const isCollapsed = (collapsedDays || {})[dayId];

          return (
            <div key={dayId} className="relative">
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
                          className={`transition-all min-h-[10px] pb-1 w-full min-w-0 ${
                            snapshot.isDraggingOver ? "bg-slate-50/50 rounded-3xl ring-2 ring-dashed ring-slate-200" : ""
                          }`}
                        >
                          {/* ⛺ Base Camp Morning Start */}
                          {baseCampHotel && (day.items || []).length > 0 && (
                            <div className="flex gap-2.5 sm:gap-4 items-stretch opacity-75 w-full min-w-0">
                              <div className="flex flex-col items-center shrink-0">
                                <div className="h-5 w-5 rounded-full border-2 border-slate-300 bg-white flex items-center justify-center shrink-0 mt-4">
                                  <Hotel size={10} className="text-slate-400" />
                                </div>
                                <div className="flex-1 relative flex justify-center mt-1 w-full min-h-[40px]">
                                  <div className="w-px h-full border-l-2 border-dotted border-slate-200 absolute left-1/2 -translate-x-1/2" />
                                  {(logistics || {})[`basecamp-start-${dayId}_${day.items[0].id}`] && (
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

                          {(day.items || []).map((item, index) => {
                            const isLastInDay = index === ((day.items || []).length || 1) - 1;
                            const nextItem = !isLastInDay ? day.items[index + 1] : null;

                            return (
                              <ActivityCard
                                key={item.id}
                                item={item}
                                index={index}
                                isReadOnly={isReadOnly}
                                dayId={dayId}
                                displayDayOrder={displayDayOrder}
                                baseCampHotel={baseCampHotel}
                                logistics={logistics}
                                isLastInDay={isLastInDay}
                                nextItem={nextItem}
                                selectedPlace={selectedPlace}
                                setSelectedPlace={setSelectedPlace}
                                setHoveredMarkerId={setHoveredMarkerId}
                                editingTimeId={editingTimeId}
                                setEditingTimeId={setEditingTimeId}
                                updateItemTime={updateItemTime}
                                deleteItem={deleteItem}
                              />
                            );
                          })}
                          {provided.placeholder}

                          {/* ⛺ Base Camp Evening Return */}
                          {baseCampHotel && (day.items || []).length > 0 && (
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

                          {((day.items || []).length || 0) === 0 && (
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
  );
}
