import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fetchPhoto } from "../../utils/unsplash";

const REELS = [
  {
    id: "kyoto",
    country: "Japan",
    city: "Kyoto",
    caption: "Kimono walks through centuries-old streets",
    videoUrl: "https://www.pexels.com/download/video/31385024/",
  },
  {
    id: "vietnam",
    country: "Southeast Asia",
    city: "Vietnam",
    caption: "Emerald karsts of Ha Long Bay",
    videoUrl: "https://www.pexels.com/download/video/30391321/",
  },
  {
    id: "neom",
    country: "Saudi Arabia",
    city: "Neom",
    caption: "Desert horizons & the city of tomorrow",
    videoUrl: "https://www.pexels.com/download/video/19348567/",
  },
  {
    id: "basilicata",
    country: "Italy",
    city: "Basilicata",
    caption: "Cave-cut Matera at twilight",
    videoUrl: "https://www.pexels.com/download/video/27562816/",
  },
];

function ReelCard({ reel }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [posterUrl, setPosterUrl] = useState(null);

  useEffect(() => {
    fetchPhoto(reel.city + " travel").then(setPosterUrl);
  }, [reel.city]);

  const handleMouseEnter = () => {
    if (!videoRef.current) return;
    setIsPlaying(true);
    videoRef.current.play().catch(() => {});
  };

  const handleMouseLeave = () => {
    if (!videoRef.current) return;
    setIsPlaying(false);
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
  };

  return (
    <div
      className="group relative w-[200px] sm:w-[260px] md:w-[280px] aspect-[9/16] shrink-0 rounded-[24px] sm:rounded-[32px] overflow-hidden bg-white shadow-xl shadow-slate-200/80 snap-start cursor-pointer border border-slate-200 p-1.5 sm:p-2 transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-sky-500/20"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full h-full rounded-[24px] overflow-hidden bg-slate-900">
        <img
          src={posterUrl}
          alt={`${reel.city}, ${reel.country}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}
          loading="lazy"
        />
        {!failed && (
          <video
            ref={videoRef}
            src={reel.videoUrl}
            poster={posterUrl}
            muted={false} // We manage volume softly via JS if needed, or keep unmuted on hover
            loop
            playsInline
            preload="metadata"
            onError={() => setFailed(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-slate-900/40 pointer-events-none transition-opacity duration-500 group-hover:opacity-70" />

        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          <span className="px-3 py-1 bg-white/90 text-sky-600 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full backdrop-blur-sm shadow-sm transform transition-transform duration-500 group-hover:-translate-y-1">
            {reel.country}
          </span>
          <span
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 shadow-sm ${
              isPlaying ? "bg-white text-slate-900 scale-110" : "bg-black/40 text-white/90 backdrop-blur-md border border-white/20"
            }`}
            aria-hidden="true"
          >
            {isPlaying ? "🔊" : "▶"}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 text-white transform transition-transform duration-500 group-hover:-translate-y-2">
          <h3 className="text-2xl font-black tracking-tight leading-tight mb-2 drop-shadow-md">
            {reel.city}
          </h3>
          <p className="text-xs md:text-sm font-medium text-white/90 line-clamp-2 drop-shadow transition-opacity duration-500 opacity-80 group-hover:opacity-100">
            {reel.caption}
          </p>
        </div>
      </div>
    </div>
  );
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
  },
};

export default function TravelReels() {
  return (
    <section
      className="py-8 sm:py-16 px-4 sm:px-6 lg:px-10 bg-slate-50/50"
      id="reels"
      aria-label="2026 Travel Reels"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-2"
        >
          <p className="text-[11px] font-bold tracking-[0.25em] uppercase text-sky-500 drop-shadow-sm">
            IN MOTION
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Reels From the Road
          </h2>
          <p className="text-sm md:text-base text-slate-600 max-w-xl mt-2 font-medium">
            Short clips from our top 2026 destinations. Hover over a card to play and unmute — scroll for more.
          </p>
        </motion.div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="flex gap-6 overflow-x-auto pb-12 pt-4 snap-x snap-mandatory px-4 -mx-4
                   [&::-webkit-scrollbar]:h-[6px]
                   [&::-webkit-scrollbar-thumb]:bg-slate-300
                   [&::-webkit-scrollbar-thumb]:rounded-full"
      >
        {REELS.map((reel) => (
          <motion.div variants={cardVariants} key={reel.id}>
            <ReelCard reel={reel} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
