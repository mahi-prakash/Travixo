import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Navigation,
  DollarSign,
  Clock,
  Calendar,
  Tag
} from 'lucide-react';

export default function PlaceDetailsCard({ selectedPlace, setSelectedPlace, map }) {
  if (!selectedPlace) return null;

  return (
    <motion.div
      key="details"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full flex flex-col bg-slate-100/50 rounded-[32px] overflow-hidden p-3"
    >
      <div className="w-full h-full flex flex-col bg-white rounded-[24px] overflow-hidden shadow-sm ring-1 ring-black/5">
        {/* 1. VISUAL HEADER (Fixed Top) */}
        <div className="h-[40%] shrink-0 relative group/image">
          <img
            src={selectedPlace.img || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=600&auto=format&fit=crop"}
            alt={selectedPlace.title || selectedPlace.name || "Place"}
            className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

          {/* Back Button */}
          <div className="absolute top-6 left-6 z-50">
            <button
              onClick={() => setSelectedPlace(null)}
              className="bg-white/90 backdrop-blur-md hover:bg-white text-slate-800 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-lg border border-white/50 flex items-center gap-2 group/btn"
            >
              <ArrowLeft size={16} className="group-hover/btn:-translate-x-1 transition-transform" /> Back
            </button>
          </div>

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider shadow-sm">
                {selectedPlace.category || "Place"}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-none mb-2 drop-shadow-md">
              {selectedPlace.title || selectedPlace.name}
            </h1>
            <p className="text-white/90 text-sm font-medium flex items-center gap-2 drop-shadow-sm">
              <MapPin size={14} className="text-sky-400 fill-sky-400" /> {selectedPlace.location || selectedPlace.desc || "Destination"}
            </p>
          </div>
        </div>

        {/* 2. SCROLLABLE CONTENT (Cards Layout) */}
        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
          <div className="space-y-4 pb-16">
            {/* Description Card */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-[11px] font-extrabold text-sky-600 uppercase tracking-widest">Overview</h3>
                <button
                  onClick={() => {
                    const pos = selectedPlace.pos || selectedPlace.coords;
                    if (pos && map) {
                      map.panTo({ lat: Number(pos[0]), lng: Number(pos[1]) });
                      map.setZoom(16);
                      window.open(`https://www.google.com/maps/dir/?api=1&destination=${pos[0]},${pos[1]}`, '_blank');
                      setSelectedPlace(null);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-bold shadow-md hover:bg-slate-800 transition-all group/nav"
                >
                  <Navigation size={10} className="group-hover/nav:-translate-y-0.5 transition-transform" /> Get Directions
                </button>
              </div>
              <div className="bg-white p-4 rounded-[24px] shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50">
                <p className="text-slate-600 text-[15px] leading-relaxed font-medium">
                  {selectedPlace.desc || selectedPlace.description || "Experience the unique atmosphere of this location. Perfect for travelers looking to immerse themselves in local culture and history. A true gem in the heart of the city."}
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Cost */}
              <div className="bg-white p-4 rounded-[24px] shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center shrink-0 border border-sky-100">
                  <DollarSign size={20} />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Cost</h4>
                  <p className="text-base font-bold text-slate-800">{selectedPlace.cost || "Free"}</p>
                </div>
              </div>

              {/* Duration */}
              <div className="bg-white p-4 rounded-[24px] shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0 border border-purple-100">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Duration</h4>
                  <p className="text-base font-bold text-slate-800">{selectedPlace.duration || "1-2h"}</p>
                </div>
              </div>

              {/* Best Time */}
              <div className="bg-white p-4 rounded-[24px] shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 border border-amber-100">
                  <Calendar size={20} />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Best Time</h4>
                  <p className="text-base font-bold text-slate-800">{selectedPlace.bestTime || "Anytime"}</p>
                </div>
              </div>

              {/* Type */}
              <div className="bg-white p-4 rounded-[24px] shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] border border-slate-100/50 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Tag size={20} />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Type</h4>
                  <p className="text-base font-bold text-slate-800">{selectedPlace.category || "General"}</p>
                </div>
              </div>
            </div>

            <div className="pt-2"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
