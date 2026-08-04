import React from "react";
import { motion } from "framer-motion";
import { Pen, BookOpen } from "lucide-react";

export default function TravelJournalTab({
  isWritingJournal,
  setIsWritingJournal,
  journalEntry,
  setJournalEntry,
  savedJournal,
  handleSaveJournal
}) {
  return (
    <motion.div
      key="journal"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="max-w-2xl bg-white rounded-[28px] p-6 sm:p-8 border border-slate-100 shadow-xl space-y-5 flex flex-col"
    >
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <span>Travel Journal</span>
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm">Keep track of your feelings, goals, and notes for upcoming trips.</p>
      </div>

      {isWritingJournal ? (
        <div className="space-y-4 flex flex-col flex-1">
          <textarea
            autoFocus
            rows={5}
            placeholder="What are your thoughts or packing reminders for your next trip?"
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
            className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all resize-none"
          />
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              onClick={() => setIsWritingJournal(false)}
              className="py-2.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveJournal}
              className="py-2.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-100 transition-all"
            >
              Save Entry
            </button>
          </div>
        </div>
      ) : savedJournal ? (
        <div className="space-y-5 flex flex-col flex-1">
          <div className="p-6 rounded-2xl bg-sky-50/50 border border-sky-100 text-slate-700 italic text-sm leading-relaxed shadow-sm">
            "{savedJournal}"
          </div>
          <button
            onClick={() => setIsWritingJournal(true)}
            className="w-full py-3 rounded-xl bg-slate-50 hover:bg-sky-50 hover:text-sky-600 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 hover:border-sky-200 transition-all mt-auto"
          >
            <Pen size={14} />
            <span>Edit Journal Entry</span>
          </button>
        </div>
      ) : (
        <div className="space-y-5 flex flex-col items-center justify-center text-center py-8">
          <div className="h-14 w-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-sm">
            <BookOpen size={28} />
          </div>
          <div className="max-w-sm space-y-1.5">
            <h4 className="text-base font-bold text-slate-900">No Journal Entries Yet</h4>
            <p className="text-xs font-medium text-slate-500 leading-relaxed">
              Start recording packing lists and travel aspirations for your next trip!
            </p>
          </div>
          <button
            onClick={() => setIsWritingJournal(true)}
            className="py-3 px-6 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-100 flex items-center justify-center gap-2 transition-all"
          >
            <Pen size={14} />
            <span>Write Your First Entry</span>
          </button>
        </div>
      )}
    </motion.div>
  );
}
