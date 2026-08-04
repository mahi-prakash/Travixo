import React from "react";
import { motion } from "framer-motion";
import { Heart, MapPin } from "lucide-react";

export default function MyTripsTab({ user, handleLike }) {
  return (
    <motion.div
      key="trips"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-10 border border-slate-100 shadow-xl space-y-6"
    >
      <div className="border-b border-slate-100 pb-6">
        <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1">Past Adventures</h2>
        <p className="text-slate-500 text-sm">Relive your journey archives and saved trip records.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {user.recentMemories.map((mem) => (
          <motion.div
            whileHover={{ y: -6 }}
            key={mem.id}
            className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-md hover:shadow-xl transition-all flex flex-col group"
          >
            <div className="relative h-48 w-full overflow-hidden">
              <img src={mem.image} alt={mem.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

              <button
                onClick={() => handleLike(mem.title)}
                className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/80 backdrop-blur-md text-slate-700 hover:text-rose-500 hover:bg-white flex items-center justify-center shadow-md transition-all"
              >
                <Heart size={16} />
              </button>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-base">{mem.title}</h4>
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                  <Heart size={13} className="text-rose-500 fill-rose-500" />
                  {mem.likes}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                <MapPin size={13} className="text-sky-500" />
                <span>{mem.location}</span>
                <span>&bull;</span>
                <span>{mem.date}</span>
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
