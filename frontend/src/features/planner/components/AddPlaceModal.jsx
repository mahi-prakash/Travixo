import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';

export default function AddPlaceModal({
  addingPlace,
  setAddingPlace,
  displayDayOrder,
  days,
  addToDay
}) {
  if (!addingPlace) return null;

  return (
    <AnimatePresence>
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
                <p className="text-xs text-slate-400 font-bold uppercase tracking-tight truncate w-48">
                  {addingPlace.place?.name || addingPlace.place?.title || "Activity"}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 space-y-5 py-2">
            {/* Day Selection */}
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Select Day</p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {(displayDayOrder || []).map((id) => (
                  <button
                    key={id}
                    onClick={() => setAddingPlace({ ...addingPlace, dayId: id })}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-[11px] font-black transition-all border ${
                      addingPlace.dayId === id
                        ? "bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-100"
                        : "bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300"
                    }`}
                  >
                    {(days || {})[id]?.title?.split(':')[0] || "Day"}
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
                  value={addingPlace.time || ""}
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
    </AnimatePresence>
  );
}
