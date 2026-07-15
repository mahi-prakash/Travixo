import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

export default function FeaturedNarrative() {
  return (
    <section className="bg-sky-100/30 lg:py-32 overflow-hidden" id="stories" aria-label="Featured narrative">
      <div className="mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 lg:gap-14 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="order-2 md:order-1 mb-16 md:mb-0"
        >
          <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-sky-500 mb-4 block drop-shadow-sm">
            THE WEEKLY FEATURE
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-slate-900 leading-[1.1] mb-5 sm:mb-8 tracking-tighter">
            The Silence of the Cyclades
          </h2>
          <p className="text-base md:text-lg text-slate-600 max-w-lg leading-relaxed font-medium mb-10">
            Beyond the neon crowds of Santorini lies a quiet archipelago where time is measured in the rhythmic pulse of the Aegean. Discover the hidden coves and white-washed secrets of Greece&apos;s most meditative islands.
          </p>
          <Link
            to="#"
            className="group relative inline-flex items-center gap-2 px-6 sm:px-9 py-3 sm:py-4.5 bg-slate-900 text-white rounded-full font-bold text-sm sm:text-lg overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-slate-900/20"
            id="read-story-btn"
          >
            <span className="relative z-10 flex items-center gap-2">
              Read the Story
              <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            </span>
          </Link>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, x: 50 }}
          whileInView={{ opacity: 1, scale: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="order-1 md:order-2"
        >
          <div className="relative w-full group">
            {/* Soft decorative blur behind image */}
            <div className="absolute inset-0 bg-sky-300/30 blur-[60px] rounded-full scale-90 group-hover:bg-sky-400/40 transition-colors duration-700" />
            
            <img
              className="relative z-10 w-full rounded-2xl sm:rounded-3xl shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] object-cover transition-transform duration-700 hover:-translate-y-2"
              alt="iconic white-washed buildings with bright blue domes overlooking the deep azure Aegean Sea in Oia, Greece"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkNRaimRYHAyrDA2C0174ArqoSehVk1WDjwJ3AlCq3v_lcOFyAup4cCMbAykxiZ4PDC3zHdXFCnv7ovLdYFBvAARTxus5Fgy3Q6ixnLaeFa_a2FlwbdG3ggVk0OzTgKSIYi_ZjR-FQ-e6u7B0qs1V4Qsy8UNzh6PHfxcQN8zn_HxLo7hapK_hwg8EFAzZ3z0nMQemUzJIOVt3jjcrR8Pp-zJYNSd4Tz0CVpPi1D6koxJDGksjcFGUwgMSkCLn6XrpZYKudN_CpcTQ"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
