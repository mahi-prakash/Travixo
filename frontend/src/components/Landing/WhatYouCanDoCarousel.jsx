import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";


const WhatYouCanDoCarousel = () => {
  const containerRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);


  const items = [
    {
      img: "/dragdrop2.jpg",
      tag: "EDIT LIKE A PLAYLIST",
      title: "Drag-and-drop day editing",
      body: "Rearrange days and plans with drag-and-drop while TRAP keeps routes sane.",
      detailedBody: "Planning a trip shouldn't feel like a chore. With Trap, you can visually map out your journey. Drag your favorite spots into different days, and let our engine recalculate the best routes in real-time. No more manual rescheduling – just pure exploration.",
      features: ["Real-time route optimization", "Intelligent day re-balancing", "Visual timeline mapping"]
    },

    {
      img: "https://www.allianztravelinsurance.com/v_1628868550325/media/travel/planning/diversity-in-travel.jpg",
      tag: "GROUP-FRIENDLY",
      title: "One link for the group",
      body: "Share a single live link instead of screenshots and endless “who booked what?”.",
      detailedBody: "Stop the 'wait, where are we staying?' texts. Share one living link with your travel crew. Everyone sees the same board, updates are instant, and you can even cast votes on potential activities right within the app.",
      features: ["Instant group syncing", "Collaborative voting", "Shared budget tracking"]
    },
    {
      img: "/saveshare.jpg",
      tag: "TRIP STORIES",
      title: "Save & share trip cards",
      body: "Turn finished trips into cards you can revisit, clone and share with friends.",
      detailedBody: "Your best memories deserve a better home than a buried photo album. Convert your completed itineraries into interactive 'Trip Cards'. Share them with the community, allow friends to clone your route, or keep them as a private digital scrapbook of your adventures.",
      features: ["Interactive Trip Cards", "Community cloning", "Private digital archives"]
    },
    {
      img: "/ai.jpg",
      tag: "INSTANT PLANS",
      title: "Auto AI itineraries",
      body: "Get a day-by-day draft with flights, stays and ideas in seconds.",
      detailedBody: "Stuck on where to start? Our AI travel engine drafts a full, vibe-matched itinerary in under 60 seconds. It intelligently suggests flights, stays, and hidden gems based on your preferences, giving you a perfect foundation to customize.",
      features: ["60-second drafting", "Smart location pairing", "Customizable AI foundations"]
    },
    {
      img: "https://images.unsplash.com/photo-1690733546551-1007bc0a3414?fm=jpg&q=60&w=900&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fG1vb2Rib2FyZHxlbnwwfHwwfHx8MA%3D%3D",
      tag: "ONE CLEAN BOARD",
      title: "Single board for the whole trip",
      body: "See flights, stays and activities in one calm, editable timeline.",
      detailedBody: "Centralize the chaos. Forget switching between airline apps, booking confirmations, and Google Maps. Every flight ticket, hotel reservation, and lunch reservation lives on one clean, chronological board that updates as you go.",
      features: ["Unified chronological view", "Booking sync integration", "Mobile-ready timeline"]
    },
    {
      img: "/vibebased2.jpg",
      tag: "VIBE-BASED QUIZ",
      title: "Vibe-based trip quiz",
      body: "Answer a few fun questions and TRAP learns how you actually like to travel.",
      detailedBody: "Travel is personal. Our unique vibe quiz goes beyond 'beach or mountains'. We analyze your aesthetic preferences, pace of travel, and hidden interests to suggest destinations that actually resonate with your soul.",
      features: ["Aesthetic matching", "Pace optimization", "Hidden interest discovery"]
    },
  ];

  // auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [items.length]);

  // scroll to active slide
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTo({
      left: index * containerRef.current.clientWidth,
      behavior: "smooth",
    });
  }, [index]);

  const goPrev = () =>
    setIndex((prev) => (prev - 1 + items.length) % items.length);

  const goNext = () => setIndex((prev) => (prev + 1) % items.length);

  return (
    <>
      <div className="relative">

        {/* arrows */}
        <button
          onClick={goPrev}
          className="hidden md:flex absolute -left-10 top-1/2 -translate-y-1/2
                   h-9 w-9 rounded-full bg-white
                   items-center justify-center text-slate-600"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={goNext}
          className="hidden md:flex absolute -right-10 top-1/2 -translate-y-1/2
                   h-9 w-9 rounded-full bg-white
                   items-center justify-center text-slate-600"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* slider */}
        <div
          ref={containerRef}
          className="flex overflow-hidden rounded-xl bg-white shadow-lg"
        >
          {items.map((item, i) => (
            <div
              key={i}
              className="min-w-full flex flex-col md:flex-row h-[260px]"
            >
              {/* LEFT IMAGE */}
              <div className="md:w-1/2 h-[260px]">
                <img
                  src={item.img}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* RIGHT CONTENT */}
              <div className="md:w-1/2 p-8 flex flex-col justify-center gap-3">
                <p className="text-xs font-semibold tracking-widest uppercase text-sky-600">
                  {item.tag}
                </p>

                <h3 className="text-2xl font-semibold text-slate-900">
                  {item.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.body}
                </p>

                <span
                  onClick={() => setSelectedItem(item)}
                  className="mt-2 text-sm font-medium text-sky-600 cursor-pointer hover:text-sky-400 transition-colors"
                >
                  Read more →
                </span>

              </div>
            </div>
          ))}
        </div>

      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] pointer-events-auto"
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="cursor-pointer absolute top-6 right-6 z-20 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>

              {/* LEFT SIDE (Image) */}
              <div className="md:w-1/2 h-[240px] md:h-auto relative">
                <img
                  src={selectedItem.img}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-sky-300 text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
                    {selectedItem.tag}
                  </p>
                  <h4 className="text-white text-xl font-black">
                    {selectedItem.title}
                  </h4>
                </div>
              </div>

              {/* RIGHT SIDE (Content) */}
              <div className="md:w-1/2 p-8 md:p-10 overflow-y-auto bg-white">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[11px] font-bold text-sky-600 uppercase tracking-widest mb-3">Feature Insight</h3>
                    <p className="text-slate-600 leading-relaxed text-base font-medium">
                      {selectedItem.detailedBody}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-3">What's included</h3>
                    <div className="grid gap-2">
                      {selectedItem.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                          <span className="text-sm font-semibold">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>



                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>

  );
};

export default WhatYouCanDoCarousel;
