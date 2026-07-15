// src/pages/Landing.jsx

import React, { useEffect, useRef, useState } from "react";
import { motion as Motion, useMotionValue, useMotionTemplate, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Sparkles, MapPin, ChevronDown, Rocket, ChevronLeft, ChevronRight, X, CheckCircle2, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Card from "../components/common/Card";
import WhatYouCanDoCarousel from "../components/Landing/WhatYouCanDoCarousel";
import TransitionOverlay from "../components/Landing/TransitionOverlay";
import SEO from "../components/common/SEO";


const heroPlaces = [
  [
    {
      img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=900&auto=format&fit=crop",
    },
    {
      img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=900&auto=format&fit=crop",
    },
    {
      img: "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=900&auto=format&fit=crop",
    },
    {
      img: "https://plus.unsplash.com/premium_photo-1678304639537-d347f2aebc92?fm=jpg&q=60&w=900&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGJhbGl8ZW58MHx8MHx8fDA%3D"
    },
    {
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCZ1JzWf3i9-yq0IGDFkYRPAtIp2F-UAN7Yg&s",
    },
    {
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTa4aJi17NAsUj1b8ktlrRUoIN5gP-i_ykKrA&s",
    },
  ],
  [
    {
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0ZYxLVuyD_nWQmcH9EsL0g5Yk8CQsVU795Q&s",
    },
    {
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2lyXeUz3qz9U5FIa192DQA6-7g_yM1fDxnQ&s",
    },
    {
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtOGVgK5DXm2PHmmGDz6VVoBu39iuB17-wbQ&s",
    },
    {
      img: "https://plus.unsplash.com/premium_photo-1688410049290-d7394cc7d5df?fm=jpg&q=60&w=900&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8ZXVyb3BlfGVufDB8fDB8fHww"
    },
    {
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfMjZsBLP35mUGhXsHE0cd-wwguma5sKFJpA&s"
    },
    {
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQorZoXeFEKwEEHrRyFWIXQYNSC7Kyhk2en3Q&s",
    },
  ],
  [
    {
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTucissoqdPwq7AIVkXIyvIGaGtOR7rrVgzuw&s",
    },
    {
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBg9ZTdjQu9Jo4scNm_FYqVxoAjoq3_jwG-A&s",
    },
    {
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRq5lN5bqOhiKqDyfx00uYWnWtaS2GJoqgBCg&s",
    },
    {
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJzGSGX2-4SQgmj0cagcHb6Wkx7zhGzeBGxA&s"
    },
    {
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrhPQabVeOR1K0g_xiNj8Y45LiO1DxX1kk6g&s",
    },
    {
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqtzCbFKr4LPs6Ivexzn72RodOge6MpI5rjw&s"
    },
  ],
  [
    {
      img: "https://images.unsplash.com/photo-1524230507669-5ff97982bb5e?fm=jpg&q=60&w=900&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8aW5kaWF8ZW58MHx8MHx8fDA%3"
    },
    {
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUzOf6_baQm0AZN9qc-UA3DFTZkY9_39HzMWcFnhsg-w&s",
    },
    {
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_cx2ZVR4lfVdJEbftEyRDRRXmtdbzHTbxzw&s",
    },
    {
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQmSKkmkJYFHzppg6Hy_vqpfb0_OUylrgZdQ&s",
    },
    {
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSp9_XXeIVgh2WNZrumv5a8lopze1mNcnbBdg&s",
    },
    {
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOAZ_zMC2D_7zVz6p0V3m62V2DqrPYUgDBFw&s",
    },
  ],
];

const experiences = [
  {
    city: "Kyoto, Japan",
    vibe: "Temples in the morning, neon alleys at night.",
    handle: "@nomadjess",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkiYxwGRkjEwmSfrlJMkV9SpwpjQqrOb8saA&s",
    tag: "Slow chaos weekend",
  },
  {
    city: "Paris, France",
    vibe: "Golden-hour walks, cafés, and quiet art museums.",
    handle: "@parisbyemma",
    img: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?fm=jpg&q=60&w=900&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGFyaXN8ZW58MHx8MHx8fDA%3D",
    tag: "Soft romantic escape",
  },
  {
    city: "Jaipur, India",
    vibe: "Pink streets, royal forts, and sunset bazaars.",
    handle: "@rangilijaipur",
    img: "https://plus.unsplash.com/premium_photo-1661962404003-e0ca40da40ef?fm=jpg&q=60&w=900&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8amFpcHVyfGVufDB8fDB8fHww",
    tag: "Heritage weekend",
  },
  {
    city: "Istanbul, Turkey",
    vibe: "Mosques at dawn, ferries at dusk, stories everywhere.",
    handle: "@istanbulnotes",
    img: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?fm=jpg&q=60&w=900&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aXN0YW5idWx8ZW58MHx8MHx8fDA%3D",
    tag: "Crossroads of cultures",
  },

  {
    city: "Lisbon, Portugal",
    vibe: "Miradouros, trams and pastel de nata on repeat.",
    handle: "@citychaser",
    img: "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=900&auto=format&fit=crop",
    tag: "Rooftops & sunsets",
  },
  {
    city: "Seoul, Korea",
    vibe: "Street food till 3am, cafés by day.",
    handle: "@lateflightclub",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-WuIki0MO6zuEn-xCZw2_udOPJAJMld5DGQ&s",
    tag: "Night‑owl run",
  },
  {
    city: "Bali, Indonesia",
    vibe: "Cowork, surf, repeat on a slow‑chaos month.",
    handle: "@remoterays",
    img: "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?fm=jpg&q=60&w=900&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFsaXxlbnwwfHwwfHx8MA%3D%3D",
    tag: "Soft chaos month",
  },
];

const ExperienceCarousel = () => {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedExp, setSelectedExp] = useState(null);


  // helper: scroll exactly one card
  const scrollByCard = (nextIndex) => {
    const container = containerRef.current;
    if (!container) return;
    const firstChild = container.firstChild;
    const cardWidth = firstChild ? firstChild.getBoundingClientRect().width : 0;

    container.scrollTo({
      left: nextIndex * (cardWidth + 24), // 24 = gap-6
      behavior: "smooth",
    });
  };

  // auto‑slide every 3s
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % experiences.length;
        scrollByCard(next);
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // arrow click handlers
  const handleArrow = (direction) => {
    setActiveIndex((prev) => {
      const next =
        direction === "next"
          ? (prev + 1) % experiences.length
          : (prev - 1 + experiences.length) % experiences.length;
      scrollByCard(next);
      return next;
    });
  };

  return (
    <div className="relative">
      {/* Arrows */}
      <button
        type="button"
        onClick={() => handleArrow("prev")}
        className="hidden md:flex absolute -left-10 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-600 hover:bg-slate-50"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => handleArrow("next")}
        className="hidden md:flex absolute -right-10 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-600 hover:bg-slate-50"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Scrollable cards */}
      <div
        ref={containerRef}
        className="ml-4 mr-4 flex gap-6 overflow-x-auto no-scrollbar pb-2"
      >
        {experiences.map((exp) => (
          <div
            key={exp.city}
            className="min-w-[280px] sm:min-w-[300px] max-w-[340px] bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden flex flex-col"
          >
            <div className="h-44 w-full relative">
              <img
                src={exp.img}
                alt={exp.city}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900/80 text-[11px] text-slate-100">
                {exp.tag}
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-[11px] text-slate-500 mb-1">
                  Planned with Trap · {exp.handle}
                </p>
                <h3 className="text-lg font-semibold text-slate-900">
                  {exp.city}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{exp.vibe}</p>
              </div>
              <p
                onClick={() => setSelectedExp(exp)}
                className="mt-4 text-[11px] text-sky-600 font-semibold cursor-pointer hover:text-sky-400 transition-colors"
              >
                See how this trip was structured →
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* TRIP STRUCTURE MODAL (MVP Placeholder) */}
      <AnimatePresence>
        {selectedExp && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 overflow-hidden">
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedExp(null)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />

            <Motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row pointer-events-auto"
            >
              <button
                onClick={() => setSelectedExp(null)}
                className="absolute top-6 right-6 z-20 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>

              {/* SIDE IMAGE */}
              <div className="md:w-1/3 h-[200px] md:h-auto relative">
                <img
                  src={selectedExp.img}
                  alt={selectedExp.city}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-10 h-10 text-white/50" />
                </div>
              </div>

              {/* CONTENT */}
              <div className="md:w-2/3 p-8 md:p-10">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[11px] font-bold text-sky-600 uppercase tracking-widest mb-3 italic">MVP Roadmap</h3>
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">
                      Live boards are <br />in the works.
                    </h2>
                    <p className="mt-4 text-slate-600 leading-relaxed text-sm font-medium">
                      We're currently building the infrastructure to let you clone real itineraries like this one in '{selectedExp.city}''. Soon, you'll be able to jump directly into their shared board, see their budget logs, and turn their vibe into your next trip.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-slate-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-semibold">Interactive Chronological Timelines</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-semibold">One-Click Itinerary Cloning</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => setSelectedExp(null)}
                      className="w-full py-4 bg-sky-700 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-slate-900/20"
                    >
                      Got it, keep me posted!
                    </button>
                  </div>
                </div>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Landing = () => {
  const navigate = useNavigate();
  const { user, loginWithGoogle, loading } = useUser();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // If already logged in, redirect to app automatically
  useEffect(() => {
    if (user && !loading) {
      navigate("/chat");
    }
  }, [user, loading, navigate]);

  const handleGoToAuth = async () => {
    if (user) {
      navigate("/chat");
    } else {
      navigate("/auth");
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-slate-50 to-sky-100">
      <SEO 
        url="/"
        description="The anti-boring travel planner. AI-curated vibes, hidden gems, and chaotic-good itineraries for the modern nomad."
        keywords="AI travel planner, travel itineraries, trip planning, modern nomad, hidden gems"
      />
      {/* Header */}
      <header className="px-4 sm:px-6 pt-4 sm:pt-6 flex items-center justify-between container mx-auto gap-3">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="px-2 sm:px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-600 text-[9px] sm:text-[10px] font-bold tracking-[0.25em] uppercase shadow-sm whitespace-nowrap shrink-0">
            BETA V2.0
          </span>
          <span className="text-slate-500 text-xs md:text-sm font-medium hidden sm:inline">
            The new standard.
          </span>
        </div>
        <div className="shrink-0">
          <button onClick={handleGoToAuth} className="px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium text-slate-900 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition-all duration-200 whitespace-nowrap">
            Log in or Sign up
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative z-10 min-h-[calc(100vh-72px)] py-12 lg:py-0 flex items-center overflow-hidden">
        <div className="pointer-events-none absolute -top-10 right-0 w-[360px] h-[360px] bg-gradient-to-tr from-sky-300/50 to-sky-500/40 blur-[90px] opacity-80" />

        <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">
          <Motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6 lg:w-1/2"
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 leading-[0.9]">
              TRAVEL <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">
                WITHOUT
              </span>{" "}
              <br />
              <span className="text-sky-600">LIMITS.</span>
            </h1>

            <Motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-base md:text-lg text-slate-600 max-w-xl leading-relaxed font-medium"
            >
              The anti‑boring travel planner. AI‑curated vibes, hidden gems, and
              chaotic‑good itineraries for the modern nomad.
            </Motion.p>

            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row flex-wrap gap-4 pt-4 w-full sm:w-auto"
            >
              <Motion.button
                onClick={handleGoToAuth}
                onMouseMove={handleMouseMove}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative w-full sm:w-auto px-9 py-5 bg-slate-900 text-white rounded-full font-bold text-sm md:text-lg overflow-hidden shadow-xl shadow-slate-900/20 cursor-pointer flex items-center justify-center"
              >
                <Motion.div
                  className="pointer-events-none absolute -inset-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: useMotionTemplate`
                      radial-gradient(
                        250px circle at ${mouseX}px ${mouseY}px,
                        rgba(255, 255, 255, 0.15),
                        transparent 80%
                      )
                    `,
                  }}
                />
                <span className="relative z-10 flex items-center gap-2">
                  Start Exploring
                  <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                </span>
              </Motion.button>

              <Motion.button
                onClick={() => navigate("/quiz")}
                onMouseMove={handleMouseMove}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                className="group relative w-full sm:w-auto px-8 py-4 bg-white text-slate-900 font-bold text-sm md:text-lg flex items-center justify-center gap-2 hover:bg-slate-50 border border-slate-200 shadow-sm rounded-full overflow-hidden cursor-pointer"
              >
                <Motion.div
                  className="pointer-events-none absolute -inset-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: useMotionTemplate`
                      radial-gradient(
                        250px circle at ${mouseX}px ${mouseY}px,
                        rgba(14, 165, 233, 0.15),
                        transparent 80%
                      )
                    `,
                  }}
                />
                <div className="relative z-10 flex items-center gap-2">
                  <Rocket className="w-7 h-7 text-sky-500" />
                  Get Your Vibe
                </div>
              </Motion.button>
            </Motion.div>
          </Motion.div>

          {/* Right hero visuals */}
          <Motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9 }}
            className="flex w-full lg:w-[70%] justify-center lg:justify-end mt-8 lg:mt-0"
          >
            <div 
              className="relative h-[380px] sm:h-[450px] lg:h-[650px] w-full max-w-4xl flex gap-3 md:gap-4 overflow-hidden rounded-[20px] lg:rounded-none"
              style={{ maskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)' }}
            >
              {[0, 1, 2, 3].map((colIndex) => {
                const colImages = heroPlaces[colIndex];
                const isEven = colIndex % 2 === 0;

                return (

                  <div
                    key={colIndex}
                    className={`relative flex-1 overflow-hidden ${colIndex > 1 ? 'hidden md:block' : ''}`}
                  >
                    <Motion.div
                      initial={{ y: isEven ? "-50%" : "0%" }}
                      animate={{ y: isEven ? "0%" : "-50%" }}
                      transition={{
                        duration: 40,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="flex flex-col gap-3 min-h-[200%]"
                    >
                      {[...colImages, ...colImages].map((item, idx) => {
                        const tall = idx % 3 === 0;

                        return (
                          <Card
                            key={`${colIndex}-${idx}`}
                            className={`
                                        group
                                        w-full
                                        ${tall ? "h-64" : "h-52"}
                                        bg-transparent
                                        overflow-visible

                                        transition-all duration-500 ease-out
                                        hover:scale-105
                                        hover:-translate-y-1
                                        hover:shadow-[0_40px_90px_-30px_rgba(15,23,42,0.6)]
                                        hover:z-30
                                      `}
                          >
                            {/* INNER SHELL (this keeps rounded shape) */}
                            <div
                              className="
                                          w-full h-full
                                          rounded-[10px]
                                          border border-white/60
                                          bg-white/85
                                          backdrop-blur-sm
                                          overflow-hidden
                                        "
                            >
                              <img
                                src={item.img}
                                alt=""
                                loading="lazy"
                                className="
                                            w-full h-full object-cover rounded-[10px]

                                            opacity-70
                                            brightness-95
                                            saturate-75
                                            blur-[0.3px]

                                            group-hover:blur-0
                                            transition-all duration-700 ease-out
                                            group-hover:opacity-100
                                            group-hover:brightness-100
                                            group-hover:saturate-100
                                            group-hover:scale-105
                                          "
                              />
                            </div>
                          </Card>
                        );
                      })}
                    </Motion.div>
                  </div>
                );

              })}
            </div>
          </Motion.div>
        </div>
        <button
          onClick={() =>
            document
              .getElementById("next-section")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className="
    absolute bottom-6 left-1/2 -translate-x-1/2
    w-12 h-12 rounded-full
    bg-white/80 backdrop-blur
    shadow-md
    flex items-center justify-center
    hover:scale-110 transition
  "
        >
          <ChevronDown className="w-6 h-6 text-slate-700 animate-bounce" />
        </button>
      </section>

      {/* SECTION 1 – What you can do here (cards) */}
      <section id="next-section" className="py-24 bg-sky-100/30">
        <div className="container mx-auto px-6 max-w-5xl">
          {/* Heading */}
          <div className="mb-12">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-sky-500">
              WHAT YOU CAN DO HERE
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-black text-slate-900">
              From “we should go” to “we went”.
            </h2>
          </div>

          {/* Existing slider (image left, text right, auto swipe) */}
          <WhatYouCanDoCarousel />
        </div>
      </section>

      {/* SECTION 2 – What other people experienced */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 max-w-6xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.25em] uppercase text-sky-500">
                WHAT OTHER NOMADS FELT
              </p>
              <h2 className="mt-3 text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Real trips, zero spreadsheet energy.
              </h2>
            </div>
          </div>

          <ExperienceCarousel />
        </div>
      </section>
      {/* SECTION – Ready to plan CTA */}
      <section className="py-16 bg-sky-50">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] px-6 md:px-10 py-8 md:py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-sky-600">
                READY FOR YOUR NEXT TRIP?
              </p>
              <h3 className="mt-3 text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                Spin up your next chaotic‑good itinerary in minutes.
              </h3>
              <p className="mt-2 text-sm md:text-base text-slate-600 max-w-xl">
                Jump back into Trap and turn that “we should go…” into real
                dates, real places and one clean shared board.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoToAuth}
              className="group relative w-full md:w-auto px-9 py-4 bg-slate-900 text-white rounded-full font-bold text-lg overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/20 whitespace-nowrap"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 leading-none">
                Start planning now
                <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 3 – Stay in the loop */}
      <section className="py-10 bg-gradient-to-b from-sky-50 to-slate-900 text-slate-100 pb-20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="rounded-[32px] bg-gradient-to-br from-slate-900 via-slate-900 to-sky-900/40 border border-slate-700 shadow-[0_32px_80px_-40px_rgba(15,23,42,0.9)] px-6 md:px-10 py-6 md:py-8">
            <div className="grid md:grid-cols-[1.3fr,0.7fr] gap-6 items-center">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.25em] uppercase text-sky-400">
                  STAY IN THE LOOP
                </p>
                <h3 className="mt-3 text-2xl md:text-3xl font-black tracking-tight">
                  Be first in line for new vibes.
                </h3>
                <p className="mt-3 text-sm md:text-base text-slate-300 max-w-lg">
                  Get early access, launch drops and real itineraries you can
                  duplicate into your own Trap workspace. No spam, just travel
                  brain candy.
                </p>

                <form className="mt-5 flex flex-col sm:flex-row gap-3 max-w-lg">
                  <input
                    type="email"
                    placeholder="you@travelszn.com"
                    className="flex-1 rounded-full bg-slate-800 border border-slate-600 px-4 py-2.5 text-sm md:text-base text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-300 cursor-text"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-sky-600 hover:bg-sky-400 text-sm md:text-base font-semibold text-white shadow-lg shadow-sky-500/30 transition-colors cursor-pointer"
                  >
                    Count me in
                  </button>
                </form>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    Contact
                  </p>
                  <a href="mailto:thetravstory.info@gmail.com" className="mt-1 text-slate-200 hover:text-sky-300 cursor-pointer block">thetravstory.info@gmail.com</a>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    Social
                  </p>
                  <p className="mt-1 text-slate-200">
                    Instagram · <a href="https://www.instagram.com/the_travstory/?hl=en" target="_blank" rel="noopener noreferrer" className="text-sky-300 hover:text-sky-200 cursor-pointer">@the_travstory</a>
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    Links
                  </p>
                  <p className="mt-1 text-slate-200">
                    <a href="https://linktr.ee/thetravstory?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGnK5gIG3dB3jku2H5VqxN1SWKAn3XdItanUcRv0rCYYozPulewSmr9wMl-900_aem_O67Sl_H5scMKleQoM7pbMg" target="_blank" rel="noopener noreferrer" className="hover:text-sky-300 cursor-pointer block">Linktree</a>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
              <p>© 2026 The Travstory. All rights reserved.</p>
              <div className="flex gap-4">
                <a href="/coming-soon" className="hover:text-slate-300 cursor-pointer">Privacy</a>
                <a href="/coming-soon" className="hover:text-slate-300 cursor-pointer">Terms</a>
                <a href="/coming-soon" className="hover:text-slate-300 cursor-pointer">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isTransitioning && (
        <TransitionOverlay onFinished={() => navigate("/chat")} />

      )}


    </div>
  );
};

export default Landing;
