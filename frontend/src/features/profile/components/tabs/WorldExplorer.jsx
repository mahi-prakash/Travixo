import React from "react";
import { motion } from "framer-motion";
import { Map, Globe } from "lucide-react";

export default function WorldExplorer({ user }) {
  return (
    <motion.div
      key="explorer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-xl space-y-6 max-w-2xl"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Map className="text-indigo-600 h-6 w-6" />
            <span>World Explorer</span>
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm">Track your international adventures and milestones.</p>
        </div>
        <Globe size={24} className="text-indigo-500 shrink-0" />
      </div>

      <div className="relative h-64 sm:h-80 w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/60 group shadow-md">
        <img
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?fm=jpg&q=60&w=3000&auto=format&fit=crop"
          alt="World Map"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
      </div>

      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-extrabold text-slate-900">{user.stats.countriesVisited} Countries Visited</span>
          <span className="font-bold text-slate-400">Goal: 50 Countries</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full"
            style={{ width: `${Math.min(100, (user.stats.countriesVisited / 50) * 100)}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}