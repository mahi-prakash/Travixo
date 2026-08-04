import React from "react";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, Sun, Clock } from "lucide-react";

export default function OverviewTab({ user }) {
  return (
    <motion.div
      key="overview"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-8"
    >
      {/* UPCOMING JOURNEY CARD */}
      <div className="bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Calendar className="text-sky-600 h-6 w-6" />
            <span>Upcoming Journey</span>
          </h2>
          <button className="text-xs sm:text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors">
            <span>View Itinerary</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {user.upcomingTrips.map((trip) => (
          <motion.div
            whileHover={{ y: -4 }}
            key={trip.id}
            className="relative rounded-[26px] h-64 sm:h-80 overflow-hidden shadow-2xl border border-slate-100 group cursor-pointer"
          >
            <img
              src={trip.image}
              alt={trip.destination}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent" />

            <div className="absolute top-5 right-5 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-md">
              <Sun size={14} className="text-amber-500 fill-amber-500" />
              <span>{trip.weather}</span>
            </div>

            <div className="absolute bottom-6 left-6 sm:left-8 right-6 text-white space-y-2.5">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-sky-600 text-white font-bold text-[10px] tracking-wider uppercase shadow-md">
                  {trip.status}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 bg-black/40 backdrop-blur-sm px-3.5 py-1 rounded-full border border-white/10">
                  <Clock size={12} className="text-sky-400" />
                  In {trip.daysUntil} Days
                </span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-black tracking-tight">{trip.destination}</h3>
              <p className="text-xs sm:text-sm font-medium text-slate-300 flex items-center gap-2">
                <Calendar size={14} className="text-sky-400" />
                <span>{trip.date}</span>
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
