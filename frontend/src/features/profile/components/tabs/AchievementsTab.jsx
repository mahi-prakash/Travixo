import React from "react";
import { motion } from "framer-motion";
import { Sun, Utensils, Compass } from "lucide-react";

export default function AchievementsTab({ user }) {
  return (
    <motion.div
      key="achievements"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="max-w-2xl bg-white rounded-[28px] p-6 sm:p-8 border border-slate-100 shadow-xl space-y-6"
    >
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <span>Achievements & Badges</span>
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm">Badges earned by discovering places and engaging with explorers.</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
        {user.badges.map((badge) => {
          const IconComponent = badge.name === "Early Bird" ? Sun : (badge.name === "Foodie" ? Utensils : Compass);
          const badgeColor = badge.name === "Early Bird" ? "bg-amber-50 text-amber-500 border-amber-100" : (badge.name === "Foodie" ? "bg-rose-50 text-rose-500 border-rose-100" : "bg-sky-50 text-sky-500 border-sky-100");

          return (
            <motion.div
              whileHover={{ scale: 1.04 }}
              key={badge.id}
              title={badge.name}
              className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all duration-300 text-center group cursor-pointer"
            >
              <div className={`h-12 w-12 rounded-xl ${badgeColor} flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shadow-sm`}>
                <IconComponent size={22} />
              </div>
              <span className="text-xs font-bold text-slate-800 leading-tight">{badge.name}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
