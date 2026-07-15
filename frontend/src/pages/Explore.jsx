import React, { useState, useEffect, useCallback } from "react";
import { fetchPhoto } from "../utils/unsplash";
import ParallaxHero from "../components/stories/ParallaxHero";
import MoodGrid from "../components/stories/MoodGrid";
import FeaturedNarrative from "../components/stories/FeaturedNarrative";
import TravelReels from "../components/stories/TravelReels";

import Footer from "../components/stories/Footer";
import SectionSpacer from "../components/stories/SectionSpacer";
import SEO from "../components/common/SEO";
import {
  Search, Grid, Music, BookOpen, Heart,
  MapPin, Star, Filter, ChevronRight, X, Check, ArrowLeft
} from "lucide-react";



// ─── DATA ────────────────────────────────────────────────────────────────────
const DATA = {
  categories: [
    { id: "all", label: "All Categories", icon: "grid" },
    { id: "cafe", label: "Cafes & Social", icon: "cafe" },
    { id: "culture", label: "Culture & Art", icon: "museum" },
  ],
  moods: [
    { id: "romantic", label: "Romantic Spot" },
    { id: "scenic", label: "Scenic Views" },
    { id: "budget", label: "Budget Friendly" },
  ],
  places: [
    {
      id: 1,
      title: "Bamboo Forest Path",
      city: "Kyoto",
      country: "Japan",
      category: "nature",
      mood: "scenic",
      rating: 4.9,
      reviews: 240,
      description: "A serene walk through towering stalks of green bamboo that filter the sunlight into emerald hues.",
      badge: "MUST VISIT",
      sceneGradient: "linear-gradient(135deg, #001219ff 0%, #004c43ff 100%)",
      avatars: [{ color: "#680505ff", initials: "JS" }, { color: "#203635ff", initials: "MK" }],
      reels: [{ author: "@nomad_jess", likes: "12.4k", saves: "84", caption: "Found the hidden shrine behind the bamboo forest. Literally zen. #hiddenjapan #kyoto" }]
    },
    {
      id: 2,
      title: "Shibuya Crossing",
      city: "Tokyo",
      country: "Japan",
      category: "culture",
      mood: "scenic",
      rating: 4.8,
      reviews: 1850,
      description: "The world's busiest pedestrian crossing, a neon-lit symphony of movement and urban energy.",
      badge: "ICONIC",
      sceneGradient: "linear-gradient(135deg, #2b0059ff 0%, #003591ff 100%)",
      avatars: [{ color: "#eda200ff", initials: "TW" }],
      reels: [{ author: "@city_lights", likes: "45k", saves: "1.2k", caption: "The heart of Tokyo never stops beating. 🌃 #shibuya #tokyo" }]
    },
    {
      id: 3,
      title: "Art District Loft",
      city: "Osaka",
      country: "Japan",
      category: "cafe",
      mood: "romantic",
      rating: 4.7,
      reviews: 95,
      description: "A hidden cafe in a converted warehouse serving artisanal coffee and local pastries.",
      badge: "LOCAL FAVORITE",
      sceneGradient: "linear-gradient(135deg, #800509ff 0%, #802061ff 100%)",
      avatars: [{ color: "#2e2a67ff", initials: "RL" }, { color: "#255548ff", initials: "DS" }],
      reels: [{ author: "@coffee_hunter", likes: "8.2k", saves: "450", caption: "The best latte art in Osaka, hidden in plain sight. ☕️ #osaka #cafeculture" }]
    },
    {
      id: 4,
      title: "Zen Garden Temple",
      city: "Kyoto",
      country: "Japan",
      category: "culture",
      mood: "scenic",
      rating: 4.9,
      reviews: 520,
      description: "Intricately raked gravel and perfectly placed stones designed for deep meditation.",
      badge: "TOP RATED",
      sceneGradient: "linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)",
      avatars: [{ color: "#8f260eff", initials: "OM" }],
      reels: [{ author: "@zen_traveler", likes: "15k", saves: "900", caption: "Finding peace in the patterns of silence. 🙏 #zen #kyoto" }]
    },
    {
      id: 5,
      title: "Golden Pavilion",
      city: "Kyoto",
      country: "Japan",
      category: "culture",
      mood: "scenic",
      rating: 4.9,
      reviews: 3200,
      description: "A breathtaking Zen temple whose top two floors are completely covered in gold leaf.",
      badge: "LEGENDARY",
      sceneGradient: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
      avatars: [{ color: "#86143cff", initials: "AP" }],
      reels: [{ author: "@gold_rush", likes: "32k", saves: "2.1k", caption: "Pure gold reflecting on the water. A dream. ✨ #kinkakuji #kyoto" }]
    },
    {
      id: 6,
      title: "Dotonbori Canal",
      city: "Osaka",
      country: "Japan",
      category: "culture",
      mood: "budget",
      rating: 4.6,
      reviews: 4100,
      description: "The street food capital of the world, alive with neon signs and giant crab sculptures.",
      badge: "FOODIE HEAVEN",
      sceneGradient: "linear-gradient(135deg, #ff0844 0%, #ffb199 100%)",
      avatars: [{ color: "#10504fff", initials: "TK" }],
      reels: [{ author: "@street_eats", likes: "19k", saves: "3k", caption: "Takoyaki at midnight is a spiritual experience. 🐙 #dotonbori #osaka" }]
    },
  ]
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const s = { width: size, height: size };
  const icons = {
    grid: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
    cafe: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>,
    museum: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M4 19L4 10" /><path d="M9 19L9 10" /><path d="M15 19L15 10" /><path d="M20 19L20 10" /><path d="M2 22L22 22" /><path d="M12 2L2 7L2 10L22 10L22 7L12 2Z" /></svg>,
    nature: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M12 2L19 21H5L12 2Z" /></svg>,
    search: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    reels: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="2" y="2" width="9" height="9" /><rect x="13" y="2" width="9" height="9" /><rect x="2" y="13" width="9" height="9" /><rect x="13" y="13" width="9" height="9" /></svg>,
  };
  return icons[name] || null;
};

const StarRating = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span style={{ color: "#f5a623", fontSize: 12 }}>
      {"★".repeat(full)}{half ? "½" : ""}
    </span>
  );
};

// ─── UNSPLASH IMAGE ──────────────────────────────────────────────────────────
const UnsplashImage = ({ query, alt, style }) => {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (query) {
      fetchPhoto(query).then(u => {
        setUrl(u);
      });
    }
  }, [query]);

  if (!url) return null;
  return <img src={url} alt={alt} style={{ ...style, objectFit: "cover" }} />;
};

// ─── CARD SCENE ──────────────────────────────────────────────────────────────
const CardScene = ({ gradient, height = 150, query, title }) => (
  <div style={{ background: gradient, width: "100%", height, position: "relative", overflow: "hidden" }}>
    <UnsplashImage query={query || title} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0, zIndex: 1 }} />
  </div>
);

// ─── PLACE CARD ───────────────────────────────────────────────────────────────
const PlaceCard = ({ place, liked, onLike, onOpen }) => (
  <div
    onClick={() => onOpen(place.id)}
    style={{
      borderRadius: 14, overflow: "hidden", border: "1px solid #ebebeb",
      background: "#fff", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(0,0,0,0.1)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
  >
    <div style={{ position: "relative", overflow: "hidden" }}>
      <CardScene gradient={place.sceneGradient} query={place.city + " " + place.country} title={place.title} />
      <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(4px)", padding: "5px 12px", borderRadius: 20, fontSize: 10, fontWeight: 800, letterSpacing: "0.5px", color: "#0f172a", border: "1px solid rgba(255,255,255,0.5)", zIndex: 5, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        {place.badge}
      </div>
      <div
        onClick={e => { e.stopPropagation(); onLike(place.id); }}
        style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(4px)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, cursor: "pointer", color: liked ? "#f43f5e" : "#64748b", transition: "all 0.2s", zIndex: 10, border: "1px solid rgba(255,255,255,0.5)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.background = "#fff"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = "rgba(255,255,255,0.92)"; }}
      >
        <Heart size={16} fill={liked ? "#f43f5e" : "none"} />
      </div>
    </div>
    <div style={{ padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <StarRating rating={place.rating} />
        <span style={{ fontSize: 11, color: "#999" }}>{place.rating} ({place.reviews} reviews)</span>
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 800, color: "#1a1a1a", margin: "6px 0 5px", lineHeight: 1.25 }}>{place.title}</h3>
      <p style={{ fontSize: 12, color: "#888", lineHeight: 1.5, marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{place.description}</p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex" }}>
          {place.avatars.map((av, i) => (
            <div key={i} style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid #fff", marginLeft: i === 0 ? 0 : -5, background: av.color, fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              {av.initials}
            </div>
          ))}
        </div>
        <button
          onClick={e => { e.stopPropagation(); onOpen(place.id); }}
          style={{ fontSize: 11, fontWeight: 700, color: "#1a9be6", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.4px" }}
        >
          VIEW DETAILS
        </button>
      </div>
    </div>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Explore() {
  const [activeTab, setActiveTab] = useState("discovery"); // discovery, reels, stories
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState(["all"]);
  const [selectedMoods, setSelectedMoods] = useState(["all"]);

  const [likedCards, setLikedCards] = useState(new Set());
  const [activeReel, setActiveReel] = useState(null);

  const toggleLike = (id) => {
    setLikedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = DATA.places.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase());

    const matchesCat = selectedCategories.includes("all") || selectedCategories.includes(p.category);
    const matchesMood = selectedMoods.includes("all") || selectedMoods.includes(p.mood);

    return matchesSearch && matchesCat && matchesMood;
  });

  const toggleCategory = (id) => {
    setSelectedCategories(prev => {
      if (id === "all") return ["all"];
      const withoutAll = prev.filter(x => x !== "all");
      if (withoutAll.includes(id)) {
        const next = withoutAll.filter(x => x !== id);
        return next.length === 0 ? ["all"] : next;
      }
      return [...withoutAll, id];
    });
  };

  const toggleMood = (id) => {
    setSelectedMoods(prev => {
      if (id === "all") return ["all"];
      const withoutAll = prev.filter(x => x !== "all");
      if (withoutAll.includes(id)) {
        const next = withoutAll.filter(x => x !== id);
        return next.length === 0 ? ["all"] : next;
      }
      return [...withoutAll, id];
    });
  };


  const openReel = (id) => {
    setActiveReel(DATA.places.find(p => p.id === id));
    setActiveTab("reels");
  };

  const railItemStyle = (active) => ({
    display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", width: "100%", textAlign: "left",
    borderRadius: 12, fontSize: 13, cursor: "pointer", transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    background: active ? "rgba(26, 155, 230, 0.05)" : "transparent",
    border: active ? "1.5px solid #1a9be6" : "1.5px solid transparent",
    color: active ? "#1a9be6" : "#64748b",
    boxShadow: active ? "0 4px 12px rgba(26, 155, 230, 0.12)" : "none",
  });

  const tabStyle = (active) => ({
    flex: 1, padding: "12px 0", borderRadius: 12,
    border: `1.5px solid ${active ? "#1a9be6" : "#e2e8f0"}`,
    background: active ? "rgba(26, 155, 230, 0.05)" : "#fff",
    fontSize: 11, fontWeight: 800, letterSpacing: "0.8px",
    color: active ? "#1a9be6" : "#94a3b8",
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    transition: "all 0.2s ease",
    boxShadow: active ? "0 4px 12px rgba(26, 155, 230, 0.08)" : "none",
  });

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f0eff0", minHeight: "100vh", color: "#1a1a1a", overflowX: "hidden" }}>
      <SEO 
        title="Explore Destinations"
        url="/explore"
        description="Discover romantic sunset spots, hidden museums, and the best cafes around the world. Browse travel reels and stories from global explorers."
        keywords="explore travel, travel destinations, travel reels, travel stories, vacation ideas"
      />
      {/* PAGE */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 px-2 sm:px-4 lg:px-[5%] py-4 lg:py-8 min-h-[calc(100vh-58px)] items-start max-w-[1800px] mx-auto overflow-hidden">
        {/* SIDEBAR */}
        <aside className="bg-white rounded-2xl p-6 w-full lg:w-[240px] flex-shrink-0 flex flex-col gap-5 h-fit lg:sticky lg:top-4">
          <h1 style={{ fontSize: 20, fontWeight: 900, letterSpacing: "-0.5px", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#0f172a", margin: 0 }}>
            EXPLORE
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "1px solid #f1f5f9" }}>
              <Icon name="grid" size={14} color="#64748b" />
            </div>
          </h1>

          <div>
            <div style={{ fontSize: 10, fontWeight: 900, color: "#94a3b8", letterSpacing: "1.5px", marginBottom: 14 }}>CATEGORY</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {DATA.categories.map(c => {
                const isActive = selectedCategories.includes(c.id);
                return (
                  <div key={c.id} onClick={() => toggleCategory(c.id)} style={railItemStyle(isActive)}>
                    <div style={{
                      width: 16, height: 16, borderRadius: 4,
                      border: `1.5px solid ${isActive ? "#1a9be6" : "#cbd5e1"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: isActive ? "#1a9be6" : "transparent"
                    }}>
                      {isActive && <Check size={10} color="#fff" strokeWidth={4} />}
                    </div>
                    <span style={{ fontWeight: isActive ? 700 : 500, fontSize: 13, color: isActive ? "#1a9be6" : "#64748b" }}>{c.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#bbb", letterSpacing: "1px", marginBottom: 6 }}>MOOD</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div onClick={() => toggleMood("all")} style={railItemStyle(selectedMoods.includes("all"))}>
                <div style={{
                  width: 16, height: 16, borderRadius: 4,
                  border: `1.5px solid ${selectedMoods.includes("all") ? "#1a9be6" : "#cbd5e1"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: selectedMoods.includes("all") ? "#1a9be6" : "transparent"
                }}>
                  {selectedMoods.includes("all") && <Check size={10} color="#fff" strokeWidth={4} />}
                </div>
                <span style={{ fontWeight: selectedMoods.includes("all") ? 700 : 500, fontSize: 13, color: selectedMoods.includes("all") ? "#1a9be6" : "#64748b" }}>All Moods</span>
              </div>
              {DATA.moods.map(m => {
                const isActive = selectedMoods.includes(m.id);
                return (
                  <div key={m.id} onClick={() => toggleMood(m.id)} style={railItemStyle(isActive)}>
                    <div style={{
                      width: 16, height: 16, borderRadius: 4,
                      border: `1.5px solid ${isActive ? "#1a9be6" : "#cbd5e1"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: isActive ? "#1a9be6" : "transparent"
                    }}>
                      {isActive && <Check size={10} color="#fff" strokeWidth={4} />}
                    </div>
                    <span style={{ fontWeight: isActive ? 700 : 500, fontSize: 13, color: isActive ? "#1a9be6" : "#64748b" }}>{m.label}</span>
                  </div>
                );
              })}
            </div>
          </div>


          <div className="mt-5 grid grid-cols-3 lg:grid-cols-1 gap-2">
            <div onClick={() => setActiveTab("discovery")} style={tabStyle(activeTab === "discovery")}>
              <MapPin size={14} /> DISCOVERY
            </div>
            <div onClick={() => setActiveTab("reels")} style={tabStyle(activeTab === "reels")}>
              <Icon name="reels" size={14} color={activeTab === "reels" ? "#1a9be6" : "#031125ff"} /> REELS
            </div>
            <div onClick={() => setActiveTab("stories")} style={tabStyle(activeTab === "stories")}>
              <BookOpen size={14} /> BLOGS
            </div>
          </div>
        </aside>

        {/* MAIN SECTION */}
        <main style={{ flex: 1, minWidth: 0 }} className="h-auto lg:h-[calc(100vh-120px)] w-full max-w-full overflow-hidden">
          {activeTab === "discovery" && (
            <div className="bg-white/60 backdrop-blur-xl rounded-[20px] sm:rounded-[40px] border border-white shadow-xl h-full flex flex-col overflow-hidden">
              <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                {/* FIXED SEARCH BAR */}
                <div className="p-6 sm:p-8 pb-5 bg-white/40 border-b border-slate-100/50 z-50">
                  <div className="bg-white p-3.5 px-6 rounded-2xl flex items-center gap-3.5 shadow-sm border border-slate-100">
                    <Icon name="search" size={20} color="#94a3b8" />
                    <input
                      type="text"
                      placeholder="Search romantic sunset spots, museum near Day 2..."
                      className="border-none outline-none flex-1 text-sm sm:text-base font-semibold text-slate-700 bg-transparent"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                    <button className="hidden sm:flex bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-extrabold items-center gap-2 transition-all hover:bg-slate-800 active:scale-95 shadow-md shadow-slate-200">
                      <Filter size={16} /> Refine
                    </button>
                  </div>
                </div>

                {/* INTERNAL SCROLLABLE CONTENT */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-8 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {filtered.map(place => (
                      <PlaceCard
                        key={place.id}
                        place={place}
                        liked={likedCards.has(place.id)}
                        onLike={toggleLike}
                        onOpen={openReel}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}


          {activeTab === "stories" && (
            <div className="bg-white/80 backdrop-blur-xl rounded-[20px] sm:rounded-[40px] overflow-hidden shadow-2xl border border-white/50 w-full max-w-full h-full">
              <div className="h-full overflow-y-auto overflow-x-hidden no-scrollbar">
                <ParallaxHero isEmbedded={true} />
                <div className="overflow-x-hidden">
                  <MoodGrid />
                  <SectionSpacer />
                  <FeaturedNarrative />
                  <SectionSpacer />
                  <TravelReels />
                  <SectionSpacer />
                  <Footer />
                </div>
              </div>
            </div>
          )}

          {activeTab === "reels" && (
            <div className="relative flex flex-col items-center justify-center py-12 sm:py-20 px-4 sm:px-8 text-center bg-white/60 backdrop-blur-xl rounded-[20px] sm:rounded-[40px] border border-white shadow-xl min-h-[400px] sm:min-h-[600px]">
              {/* Back Arrow */}
              <button
                onClick={() => setActiveTab("discovery")}
                className="absolute top-8 left-8 p-3 bg-white border border-slate-100 text-slate-400 rounded-full shadow-sm hover:text-sky-500 hover:border-sky-100 transition-all active:scale-95"
                title="Back to Discovery"
              >
                <ArrowLeft size={18} />
              </button>

              <div className="w-24 h-24 bg-sky-50 rounded-full flex items-center justify-center mb-8 animate-pulse">
                <Search size={40} className="text-sky-500" />
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4 uppercase">
                Coming <span className="text-sky-600">Soon</span>
              </h2>
              <p className="max-w-md text-slate-500 font-medium leading-relaxed text-lg">
                We're crafting an immersive way for you to discover the world.
                Soon, you'll be able to browse through curated <span className="text-slate-900 font-bold">Travel Reels</span>
                and stunning posts from explorers globally.
              </p>
              <div className="mt-10 flex gap-3">
                <div className="px-8 py-3 bg-slate-800 text-white rounded-full text-xs font-black tracking-widest uppercase shadow-lg"> Stay Tuned </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
