import React from 'react';
import { Save, SlidersHorizontal, Undo2, RotateCcw } from 'lucide-react';
import Dropdown from '../../../components/common/Dropdown';

export default function PlannerHeader({
  planMode,
  setPlanMode,
  saveChanges,
  hasUnsavedChanges,
  isSaving,
  activeTrip,
  isModified,
  history,
  undo,
  restorePlan,
  selectedDayId,
  setSelectedDayId,
  displayDayOrder,
  displayDays
}) {
  return (
    <div className="p-6 pb-2 shrink-0 bg-white/50 backdrop-blur-md z-20 rounded-[40px]">
      <div className="flex flex-col gap-4 mb-4">
        {/* Header Row 1: Dedicated Title Lane */}
        <div className="relative z-30">
          <h2 className="text-[28px] font-bold text-slate-800 tracking-tight">Itinerary</h2>
        </div>

        {/* Row 2: Plan Toggle (Left) & Action Controls (Right) */}
        <div className="flex items-center justify-between relative z-20">
          <div className="flex p-1 bg-slate-100/30 backdrop-blur-md rounded-2xl border border-slate-200/50 shadow-sm h-9 items-center">
            <button
              onClick={() => setPlanMode('ai')}
              className={`h-full px-4 text-[9.5px] font-black rounded-2xl transition-all flex items-center gap-2 ${
                planMode === 'ai'
                  ? 'bg-white shadow-sm text-slate-600 border border-slate-200/50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              AI PLAN
            </button>
            <button
              onClick={() => setPlanMode('user')}
              className={`h-full px-4 text-[9.5px] font-black rounded-2xl transition-all flex items-center gap-2 ${
                planMode === 'user'
                  ? 'bg-white shadow-sm text-slate-600 border border-slate-200/50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              YOUR PLAN
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Save Changes Button */}
            {planMode === 'user' && (
              <button
                onClick={saveChanges}
                disabled={!hasUnsavedChanges || isSaving}
                className={`px-4 h-9 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  hasUnsavedChanges
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 scale-105'
                    : 'bg-slate-100/50 text-slate-400 border border-slate-200/50 hover:bg-slate-100 cursor-not-allowed'
                }`}
              >
                <Save size={14} className={isSaving ? "animate-pulse" : ""} />
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            )}

            {/* Plan Actions Filter Button */}
            {planMode === 'user' && (
              <Dropdown
                width="w-52"
                trigger={
                  <button
                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all border outline-none relative bg-white border-slate-200 text-slate-400 hover:border-slate-300 shadow-sm`}
                    title="Plan Actions & History"
                  >
                    <SlidersHorizontal size={14} strokeWidth={2.5} />
                    {activeTrip?.isModified && (
                      <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-sky-500 rounded-full border-2 border-white shadow-sm" />
                    )}
                  </button>
                }
              >
                {({ close }) => (
                  <div className="py-3">
                    <div className="px-4 pb-2.5 border-b border-slate-50 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            isModified
                              ? 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.6)] animate-pulse'
                              : 'bg-slate-300'
                          }`}
                        />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] whitespace-nowrap">
                          {isModified ? 'Status: Modified' : 'Status: Original'}
                        </span>
                      </div>
                    </div>

                    <div className="px-2 space-y-1">
                      {isModified || activeTrip?.itinerary ? (
                        <>
                          <button
                            onClick={() => undo()}
                            disabled={history.length === 0}
                            className={`w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold rounded-xl transition-all group ${
                              history.length > 0 ? 'text-slate-600 hover:bg-slate-50' : 'text-slate-300 pointer-events-none'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Undo2
                                size={13}
                                className={history.length > 0 ? 'text-slate-400 group-hover:text-sky-600' : 'text-slate-200'}
                              />
                              <span>Undo Edit</span>
                            </div>
                            {history.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-sky-400/20" />}
                          </button>
                          <button
                            onClick={() => {
                              restorePlan();
                              close();
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all group"
                          >
                            <RotateCcw size={13} className="text-slate-600 group-hover:rotate-180 transition-transform duration-500" />
                            <span>Restore to AI</span>
                          </button>
                        </>
                      ) : (
                        <div className="px-3 py-4 text-center">
                          <p className="text-[10px] font-medium text-slate-400 leading-relaxed italic">
                            Your plan matches the AI version.<br />Make edits to see history.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Dropdown>
            )}
          </div>
        </div>

        {/* Row 3: Integrated Day Filter Container */}
        <div className="p-2 bg-slate-100/20 backdrop-blur-md rounded-2xl border border-slate-200 shadow-md relative z-10">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide items-center no-scrollbar">
            <button
              onClick={() => setSelectedDayId("all")}
              className={`flex-shrink-0 px-5 py-1.5 text-xs font-semibold rounded-full border whitespace-nowrap transition ${
                selectedDayId === "all"
                  ? "bg-sky-600 text-white border-sky-500 shadow-lg shadow-sky-100"
                  : "bg-white text-slate-600 border-slate-300 hover:border-sky-400"
              }`}
            >
              All Days
            </button>

            {displayDayOrder.map((dayId) => {
              const day = displayDays[dayId];
              if (!day) return null;
              const isActive = selectedDayId === dayId;
              return (
                <button
                  key={dayId}
                  onClick={() => setSelectedDayId(dayId)}
                  className={`flex-shrink-0 px-4 py-1.5 text-xs font-semibold rounded-full border whitespace-nowrap transition ${
                    isActive
                      ? "text-white shadow-lg shadow-sky-100"
                      : "bg-white text-slate-600 border-slate-300 hover:border-sky-400"
                  }`}
                  style={isActive ? { backgroundColor: day.color, borderColor: day.color } : {}}
                >
                  {day.date}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
