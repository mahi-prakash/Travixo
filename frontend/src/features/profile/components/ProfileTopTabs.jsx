import React from "react";
import { motion } from "framer-motion";

export default function ProfileTopTabs({ topTabs, activeTab, setActiveTab }) {
  return (
    <div className="flex items-center justify-center gap-6 sm:gap-10 border-b border-slate-200 w-full mb-8 overflow-x-auto no-scrollbar">
      {topTabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`relative pb-3 text-sm sm:text-base font-bold transition-colors duration-300 whitespace-nowrap px-2 ${
            activeTab === tab ? "text-sky-600" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {tab}
          {activeTab === tab && (
            <motion.div
              layoutId="profileTabIndicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-t-full"
              initial={false}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
