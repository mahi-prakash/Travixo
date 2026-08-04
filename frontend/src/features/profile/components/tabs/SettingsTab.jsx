import React from "react";
import { motion } from "framer-motion";
import { Settings, Mail, Globe, ShieldCheck, ChevronRight } from "lucide-react";

export default function SettingsTab({ user, handlePrivacySettings }) {
  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-10 border border-slate-100 shadow-xl space-y-8"
    >
      <div className="border-b border-slate-100 pb-6">
        <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1 flex items-center gap-3">
          <Settings className="text-sky-600 h-7 w-7" />
          <span>Account Settings</span>
        </h2>
        <p className="text-slate-500 text-sm">Manage your travel profile preferences and account credentials.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm">
            <Mail size={18} className="text-slate-400 shrink-0" />
            <input type="email" value={user.email} readOnly className="bg-transparent focus:outline-none w-full truncate" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Traveler Vibe</label>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-sky-50/70 border border-sky-100 text-sky-700 font-bold text-sm">
            <Globe size={18} className="text-sky-600 shrink-0" />
            <span>{user.vibe}</span>
          </div>
        </div>
      </div>

      <div
        onClick={handlePrivacySettings}
        className="flex items-center justify-between p-5 rounded-2xl bg-slate-50/50 hover:bg-sky-50/40 border border-slate-200/80 hover:border-sky-200 cursor-pointer transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 group-hover:bg-white flex items-center justify-center text-slate-600 group-hover:text-sky-600 transition-colors shadow-sm">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-base group-hover:text-sky-600 transition-colors">Privacy & Security</h4>
            <p className="text-xs font-medium text-slate-500">Manage password, tokens, and data privacy</p>
          </div>
        </div>
        <ChevronRight size={20} className="text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
      </div>
    </motion.div>
  );
}
