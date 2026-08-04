import React from "react";
import { motion } from "framer-motion";
import { Send, Check } from "lucide-react";

export default function BucketListTab({
  bucketList,
  newBucketItem,
  setNewBucketItem,
  handleAddBucketItem,
  toggleBucketList
}) {
  return (
    <motion.div
      key="bucket"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="max-w-2xl bg-white rounded-[28px] p-6 sm:p-8 border border-slate-100 shadow-xl space-y-5 flex flex-col"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Your Bucket List</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">Check off dream destinations and plan adventures.</p>
        </div>
      </div>

      <form onSubmit={handleAddBucketItem} className="flex items-center gap-2.5 pb-1">
        <input
          type="text"
          placeholder="Add a dream city or landmark..."
          value={newBucketItem}
          onChange={(e) => setNewBucketItem(e.target.value)}
          className="flex-1 p-3 px-4 rounded-xl border border-slate-200 bg-slate-50 font-medium text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all shadow-sm"
        />
        <button
          type="submit"
          className="px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-sky-100 flex items-center gap-1.5 shrink-0"
        >
          <Send size={16} />
          <span>Add</span>
        </button>
      </form>

      <ul className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 no-scrollbar pt-1">
        {bucketList.map((item) => (
          <li
            key={item.id}
            onClick={() => toggleBucketList(item.id)}
            className={`flex items-center gap-3.5 p-3.5 px-4 rounded-xl border transition-all cursor-pointer select-none ${
              item.completed
                ? "bg-slate-50 border-slate-100 text-slate-400 line-through"
                : "bg-white border-slate-200/80 hover:border-sky-300 text-slate-800 font-bold shadow-sm hover:shadow-md"
            }`}
          >
            <div
              className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                item.completed ? "bg-sky-600 text-white shadow-sm" : "border-2 border-slate-300 bg-white"
              }`}
            >
              {item.completed && <Check size={14} strokeWidth={3} />}
            </div>
            <span className="text-sm sm:text-base flex-1">{item.place}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
