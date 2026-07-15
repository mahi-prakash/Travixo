import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function StoriesHeader() {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between"
    >
      <div className="absolute inset-0 bg-white/40 backdrop-blur-md border-b border-white/20 shadow-sm pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-[1440px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 hover:bg-white border border-slate-200/50 shadow-sm text-sm font-bold text-slate-700 hover:text-slate-900 transition-all"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to App
          </Link>
          <a
            href="/index-explore.html"
            className="px-4 py-2 rounded-full bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sm font-bold text-sky-600 transition-all"
          >
            Explore
          </a>
        </div>

        <div className="flex flex-col items-center leading-none">
          <span className="text-[9px] font-bold tracking-[0.3em] text-sky-500 mb-0.5 ml-1">THE</span>
          <span className="text-xl font-black text-slate-900 tracking-tighter">TRAVSTORY</span>
        </div>

        <div className="w-[120px] hidden md:block" /> {/* Spacer for centering */}
      </div>
    </motion.header>
  );
}
