import React from "react";
import { motion } from "framer-motion";
import { BarChart3, Trophy, FileText, ListTodo, Globe } from "lucide-react";

const sidebarItems = [
  { id: "Quick Stats", label: "Quick Stats", icon: BarChart3 },
  { id: "World Explorer", label: "World Explorer", icon: Globe },
  { id: "Achievements", label: "Achievements & Badges", icon: Trophy },
  { id: "Travel Journal", label: "Travel Journal", icon: FileText },
  { id: "Bucket List", label: "Bucket List", icon: ListTodo },
];

export default function ProfileSidebar({ activeTab, setActiveTab }) {
  return (
    <div className="lg:col-span-1 lg:sticky lg:top-6 space-y-6">
      <div className="bg-white rounded-[28px] sm:rounded-[32px] p-5 border border-slate-100 shadow-xl space-y-2">
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-3.5 pb-2">
          Travel Hub & Stats
        </p>

        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isSelected = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all text-left ${
                isSelected
                  ? "bg-sky-50 text-sky-600 shadow-sm border border-sky-100/80"
                  : "text-slate-600 hover:bg-slate-50/80 hover:text-slate-900"
              }`}
            >
              <div
                className={`h-8 w-8 rounded-xl flex items-center justify-center transition-colors ${
                  isSelected ? "bg-sky-600 text-white shadow-md shadow-sky-100" : "bg-slate-100 text-slate-500"
                }`}
              >
                <Icon size={16} />
              </div>
              <span className="flex-1 truncate">{item.label}</span>
              {isSelected && (
                <motion.div
                  layoutId="sidebarActiveIndicator"
                  className="w-1.5 h-6 bg-sky-600 rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
