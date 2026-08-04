import React from "react";
import { motion } from "framer-motion";
import { Pen, Camera, MapPin } from "lucide-react";

export default function ProfileCoverBanner({
  user,
  handleEditProfile,
  handleUpdateAvatar
}) {
  return (
    <section className="relative rounded-[28px] sm:rounded-[36px] h-[260px] sm:h-[340px] w-full overflow-hidden shadow-2xl border border-slate-100/80 group mb-8">
      <img
        src={user.coverImage}
        alt="Cover"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />

      {/* Edit Profile Button (Top Right) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleEditProfile}
        className="absolute top-6 right-6 px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md text-slate-800 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:bg-white hover:text-sky-600 transition-all z-10"
      >
        <Pen size={14} />
        <span>Edit Profile</span>
      </motion.button>

      {/* Banner Content (Avatar + Info Bottom) */}
      <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-10 right-6 flex flex-col sm:flex-row items-start sm:items-end gap-5 sm:gap-6 z-10">
        <div className="relative group/avatar shrink-0">
          <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl bg-slate-100 overflow-hidden ring-4 ring-white shadow-2xl">
            <img src={user.avatarImage} alt={user.profileName} className="h-full w-full object-cover" />
          </div>
          <button
            onClick={handleUpdateAvatar}
            aria-label="Update avatar"
            className="absolute bottom-1 right-1 h-9 w-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-lg ring-2 ring-white hover:bg-sky-500 transition-all"
          >
            <Camera size={16} />
          </button>
        </div>

        <div className="flex-1 text-white">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-none mb-2 drop-shadow-sm">
            {user.profileName}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-medium text-slate-200">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/10">
              <MapPin size={14} className="text-sky-400" />
              {user.location}
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-slate-300 font-semibold">{user.joinedDate}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
