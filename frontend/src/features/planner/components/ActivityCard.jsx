import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import {
  Hotel,
  Utensils,
  Camera,
  Plane,
  Navigation,
  MapPin,
  DollarSign,
  Trash2,
  Sparkles
} from 'lucide-react';
import { getItemIcon } from '../utils/plannerHelpers';

export default function ActivityCard({
  item,
  index,
  isReadOnly,
  dayId,
  displayDayOrder,
  baseCampHotel,
  logistics,
  isLastInDay,
  nextItem,
  selectedPlace,
  setSelectedPlace,
  setHoveredMarkerId,
  editingTimeId,
  setEditingTimeId,
  updateItemTime,
  deleteItem
}) {
  const isLastDay = dayId === (displayDayOrder || [])[(displayDayOrder || []).length - 1];
  const logisticsData = nextItem ? (logistics || {})[`${item.id}_${nextItem.id}`] : null;
  const Icon = getItemIcon(item.type?.toLowerCase());

  return (
    <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={isReadOnly}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="flex gap-2 sm:gap-3.5 items-stretch w-full min-w-0"
        >
          {/* ── TIMELINE COLUMN ── */}
          <div className="flex flex-col items-center shrink-0">
            <div className="h-5 w-5 rounded-full border-2 border-sky-600 bg-sky-50 flex items-center justify-center shrink-0 mt-4">
              <Icon size={10} className="text-sky-600" />
            </div>
            {(!isLastInDay || (isLastInDay && baseCampHotel)) && (
              <div className="flex-1 relative flex justify-center mt-1 w-full min-h-[40px]">
                <div className="w-px h-full border-l-2 border-dotted border-sky-300 absolute left-1/2 -translate-x-1/2" />

                {/* Logic for connecting to next item OR the evening base camp return */}
                {(() => {
                  const badgeData = isLastInDay && baseCampHotel
                    ? (logistics || {})[`${item.id}_basecamp-end-${dayId}`]
                    : logisticsData;

                  if (!badgeData) return null;
                  return (
                    <div className="absolute top-1/2 -translate-y-1/2 bg-white border border-sky-200 text-sky-600 text-[9px] px-2 py-0.5 rounded-full flex items-center shadow-sm whitespace-nowrap z-10 font-bold tracking-tight">
                      🚙 {badgeData.duration}m ({badgeData.distance}km)
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* ── ACTIVITY CARD ── */}
          <div
            onClick={() => setSelectedPlace(item)}
            onMouseEnter={() => setHoveredMarkerId(item.id)}
            onMouseLeave={() => setHoveredMarkerId(null)}
            className={`group relative flex-1 min-w-0 flex flex-col bg-white rounded-2xl p-4 sm:px-5 sm:py-4 shadow-xl border border-sky-100 hover:shadow-2xl hover:-translate-y-1 transition-all mb-4 cursor-pointer overflow-hidden ${
              snapshot.isDragging ? "rotate-2 scale-105 z-50 shadow-2xl ring-2 ring-sky-400" : ""
            } ${selectedPlace?.id === item.id ? "ring-2 ring-sky-400 shadow-md" : ""}`}
          >
            {/* 🔹 TOP ROW: Image + Essential Info */}
            <div className="flex gap-3 min-w-0 w-full">
              {/* Image Thumbnail */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 relative shadow-sm border border-slate-100">
                <img
                  src={item.img || `https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=200&auto=format&fit=crop`}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              {/* Content Area */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-sky-600 font-bold uppercase tracking-wider mb-1 min-w-0">
                  {editingTimeId === item.id ? (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        autoFocus
                        className="w-20 px-2 py-0.5 text-[10px] font-bold text-sky-600 bg-white border border-sky-200 rounded-lg outline-none ring-2 ring-sky-50 shadow-sm"
                        defaultValue={item.time}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') updateItemTime(dayId, item.id, e.target.value);
                          if (e.key === 'Escape') setEditingTimeId(null);
                        }}
                        onBlur={(e) => updateItemTime(dayId, item.id, e.target.value)}
                      />
                    </div>
                  ) : (
                    <span
                      onClick={(e) => {
                        if (!isReadOnly) {
                          e.stopPropagation();
                          setEditingTimeId(item.id);
                        }
                      }}
                      className="hover:text-sky-400 transition-colors shrink-0"
                    >
                      {item.time || "No Time"}
                    </span>
                  )}
                  <span>•</span>
                  <div className="flex items-center gap-1 min-w-0">
                    {(item.type === 'Hotel' || item.type === 'HOTEL') && <Hotel size={10} className="text-amber-500 shrink-0" />}
                    {(item.type === 'Food' || item.type === 'FOOD') && <Utensils size={10} className="text-emerald-500 shrink-0" />}
                    {(item.type === 'Sightseeing' || item.type === 'SIGHTSEEING' || item.type === 'ACTIVITY') && (
                      <Camera size={10} className="text-sky-500 shrink-0" />
                    )}
                    {(item.type === 'FLIGHT' || item.type === 'DEPARTURE' || item.type === 'ARRIVAL') && (
                      <Plane size={10} className="text-blue-500 shrink-0" />
                    )}
                    {item.type === 'TRANSPORT' && <Navigation size={10} className="text-slate-500 shrink-0" />}
                    <span className="capitalize truncate min-w-0">{item.type?.toLowerCase() || "Activity"}</span>
                  </div>
                </div>

                <h4 className="font-bold text-slate-800 text-[14px] leading-tight group-hover:text-sky-700 transition-colors break-words min-w-0">
                  {item.title}
                </h4>

                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-medium min-w-0">
                  <MapPin size={10} className="text-slate-300 shrink-0" />
                  <span className="truncate min-w-0 flex-1">{item.location}</span>
                </div>

                {item.price_range && (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 mt-1 min-w-0">
                    <DollarSign size={10} className="text-slate-400 shrink-0" />
                    <span className="truncate min-w-0">{item.price_range}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {!isReadOnly && (
                <button
                  className="opacity-40 group-hover:opacity-100 p-2 sm:p-2.5 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all shrink-0 self-start"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteItem(dayId, item.id);
                  }}
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>

            {/* 🔥 BOTTOM ROW: Full-width Booking Hint Strip */}
            {item.booking_hint && (
              <div className="mt-3 p-3 rounded-xl bg-sky-50 border border-sky-100/50 flex items-start gap-2 shadow-sm group-hover:bg-sky-100/30 transition-colors min-w-0 w-full">
                <Sparkles size={14} className="text-sky-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-sky-800 leading-relaxed font-semibold italic min-w-0 flex-1 break-words">
                  {item.booking_hint}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
