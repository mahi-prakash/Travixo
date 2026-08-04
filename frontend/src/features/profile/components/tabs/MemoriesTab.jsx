import React from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

export default function MemoriesTab({ user }) {
  return (
    <motion.div
      key="memories"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-10 border border-slate-100 shadow-xl space-y-6"
    >
      <div className="border-b border-slate-100 pb-6">
        <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1">Photo Gallery</h2>
        <p className="text-slate-500 text-sm">A collection of your favorite captured moments around the world.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {user.recentMemories.map((mem) => (
          <motion.div
            whileHover={{ scale: 1.02 }}
            key={mem.id}
            className="relative h-64 rounded-2xl overflow-hidden shadow-lg group cursor-pointer border border-slate-200"
          >
            <img src={mem.image} alt={mem.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

            <div className="absolute bottom-5 left-5 right-5 text-white">
              <h4 className="font-extrabold text-base leading-tight mb-1">{mem.title}</h4>
              <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <MapPin size={13} className="text-sky-400 shrink-0" />
                <span>{mem.location}</span>
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
