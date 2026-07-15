import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import dubaiImg from "../../dubai_tourism.jpg";
import explorerImg from "../../explorer_story.png";
import hawaMahalImg from "../../hawa_mahal_story.png";

export default function ParallaxHero({ isEmbedded = false }) {
  const { scrollY } = useScroll();

  const textY = useTransform(scrollY, [0, 500], [0, -50]);
  const HIDE_START = 1400; 
  const HIDE_END = 1500;   
  const textOpacity = useTransform(scrollY, [HIDE_START, HIDE_END], [1, 0]);
  const textVisibility = useTransform(scrollY, (value) => value > HIDE_END ? "hidden" : "visible");

  const scrollToContent = () => {
    document.getElementById("discover-mood")?.scrollIntoView({ behavior: "smooth" });
  };

  if (isEmbedded) {
    return (
      <div className="relative w-full py-10 sm:py-20 bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm">
        <div className="text-center max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-sky-500 mb-2">
            The New Standard
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4">
            THE TRAVSTORY
          </h2>
          <span className="px-4 py-1.5 bg-sky-500/10 border border-sky-500/20 text-sky-600 rounded-full text-[9px] font-bold tracking-widest uppercase">
            2026 EDITION
          </span>
        </div>
        
        <div className="mt-6 sm:mt-12 grid grid-cols-2 gap-2 sm:gap-4 px-3 sm:px-6 max-w-5xl mx-auto">
          <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-slate-100 shadow-lg">
            <img src={dubaiImg} alt="Dubai" className="w-full h-28 sm:h-48 object-cover" />
          </div>
          <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-slate-100 shadow-lg">
            <img src={explorerImg} alt="Explorer" className="w-full h-28 sm:h-48 object-cover" />
          </div>
        </div>

        <div className="mt-4 sm:mt-8 px-3 sm:px-6 max-w-5xl mx-auto">
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-slate-100">
            <img src={hawaMahalImg} alt="Hawa Mahal" className="w-full h-36 sm:h-64 object-cover" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        style={{ y: textY, opacity: textOpacity, visibility: textVisibility }}
        className="fixed inset-0 flex items-center justify-center z-30 pointer-events-none"
      >
        <div className="text-center max-w-7xl px-6 relative w-full h-full flex flex-col items-center justify-center">
          <div className="text-[11px] lg:text-xs font-bold tracking-[0.25em] uppercase text-sky-500 mb-4 drop-shadow-sm">
            The New Standard
          </div>

          <div className="relative px-6 py-3 lg:px-16 lg:py-6 flex flex-col items-center">
            <div className="flex items-center gap-6 mb-[-15px] lg:mb-[-35px]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: 60 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-[1.5px] bg-sky-500/40 hidden sm:block" 
              />
              <span className="text-xl sm:text-2xl lg:text-5xl font-black tracking-[0.6em] text-sky-500 drop-shadow-sm">THE</span>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: 60 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-[1.5px] bg-sky-500/40 hidden sm:block" 
              />
            </div>
            <div className="text-5xl sm:text-7xl lg:text-[13rem] leading-none tracking-tighter font-black text-slate-900 drop-shadow-2xl">
              TRAVSTORY
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <span className="px-5 py-2 bg-sky-500/10 border border-sky-500/30 text-sky-600 rounded-full text-[10px] font-bold tracking-[0.25em] uppercase shadow-sm">
              2026 EDITION
            </span>
          </div>

          {/* Animated Scroll Down Button */}
          <button
            onClick={scrollToContent}
            className="absolute bottom-12 pointer-events-auto flex items-center justify-center w-12 h-12 rounded-full bg-white/80 backdrop-blur-md shadow-md border border-slate-200/50 hover:scale-110 hover:bg-white transition-all group"
            aria-label="Scroll down"
          >
            <ChevronDown className="w-6 h-6 text-sky-600 animate-bounce group-hover:text-sky-500" />
          </button>
        </div>
      </motion.div>

      <div>
        <div className="h-screen" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-12 -translate-y-60 translate-x-30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-start">
            <div className="max-w-[420px] lg:max-w-[460px] group bg-transparent overflow-visible transition-all duration-500 hover:scale-105 hover:-translate-y-1 hover:shadow-[0_40px_90px_-30px_rgba(15,23,42,0.6)] hover:z-30">
              <div className="w-full rounded-[24px] lg:rounded-[32px] border border-white/60 bg-white/85 backdrop-blur-sm overflow-hidden shadow-xl shadow-slate-200/60 rotate-[-2deg] p-3">
                <img src={dubaiImg} alt="Dubai" className="w-full h-auto object-cover rounded-[16px] lg:rounded-[20px]" loading="lazy" />
              </div>
            </div>
            <div className="max-w-[420px] lg:max-w-[460px] group bg-transparent overflow-visible transition-all duration-500 hover:scale-105 hover:-translate-y-1 hover:shadow-[0_40px_90px_-30px_rgba(15,23,42,0.6)] hover:z-30">
              <div className="w-full rounded-[24px] lg:rounded-[32px] border border-white/60 bg-white/85 backdrop-blur-sm overflow-hidden shadow-xl shadow-slate-200/60 rotate-[2deg] p-3">
                <img src={explorerImg} alt="Explorer" className="w-full h-auto object-cover rounded-[16px] lg:rounded-[20px]" loading="lazy" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative w-full max-w-[1440px] mx-auto px-6 lg:px-12 py-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full rounded-[48px] overflow-hidden shadow-[0_50px_100px_-30px_rgba(15,23,42,0.4)] border border-white/40"
          >
            <img 
              src={hawaMahalImg} 
              alt="Hawa Mahal Jaipur" 
              className="w-full h-auto object-cover" 
              style={{ zIndex: 40 }} 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />
          </motion.div>
        </div>
      </div>
    </>
  );
}
