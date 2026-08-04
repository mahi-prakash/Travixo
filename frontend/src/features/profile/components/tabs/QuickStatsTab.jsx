import React from "react";
import { motion } from "framer-motion";
import { Plane, Bookmark, Award, Globe } from "lucide-react";

export default function QuickStatsTab({ user }) {
  return (
    <motion.div
      key="stats"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="max-w-2xl bg-white rounded-[28px] p-6 sm:p-8 border border-slate-100 shadow-xl space-y-6"
    >
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <span>Your Quick Stats</span>
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm">Summary of your travel milestones and platform interactions.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 shadow-sm shrink-0">
            <Plane size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trips Planned</p>
            <h4 className="text-2xl font-black text-slate-900">{user.stats.tripsPlanned}</h4>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm shrink-0">
            <Bookmark size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Places Saved</p>
            <h4 className="text-2xl font-black text-slate-900">{user.stats.placesSaved}</h4>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
            <Award size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Miles Traveled</p>
            <h4 className="text-2xl font-black text-slate-900">{user.stats.milesTraveled}</h4>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
            <Globe size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Countries Visited</p>
            <h4 className="text-2xl font-black text-slate-900">{user.stats.countriesVisited}</h4>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
