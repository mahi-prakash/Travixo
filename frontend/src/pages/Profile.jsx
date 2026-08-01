import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane, Bookmark, Award, Globe, Pen, Camera, MapPin, Calendar,
  ClipboardList, Heart, Settings, ShieldCheck, ChevronRight, BookOpen,
  Sun, Utensils, Compass, Send, Clock, Check, Mail, Sparkles, ArrowRight, Map,
  BarChart3, Trophy, FileText, ListTodo
} from "lucide-react";
import { useUser } from "../context/UserContext";
import SEO from "../components/common/SEO";

const ProfileDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const topTabs = ['Overview', 'My Trips', 'Memories', 'Settings'];

  // Bucket list state for interactivity
  const [bucketList, setBucketList] = useState(user.bucketList);
  const [newBucketItem, setNewBucketItem] = useState('');

  // Journal State
  const [isWritingJournal, setIsWritingJournal] = useState(false);
  const [journalEntry, setJournalEntry] = useState('');
  const [savedJournal, setSavedJournal] = useState(null);

  const toggleBucketList = (id) => {
    setBucketList(bucketList.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleAddBucketItem = (e) => {
    e.preventDefault();
    if (!newBucketItem.trim()) return;
    setBucketList([...bucketList, { id: Date.now(), place: newBucketItem, completed: false }]);
    setNewBucketItem('');
  };

  const handleSaveJournal = () => {
    if (journalEntry.trim()) {
      setSavedJournal(journalEntry);
    } else {
      setSavedJournal(null);
    }
    setIsWritingJournal(false);
  };

  const handleEditProfile = () => alert("Edit Profile Clicked");
  const handleUpdateAvatar = () => alert("Update Avatar Clicked");
  const handlePrivacySettings = () => alert("Privacy & Security Clicked");
  const handleLike = (title) => alert(`Liked ${title}!`);

  const sidebarItems = [
    { id: 'Quick Stats', label: 'Quick Stats', icon: BarChart3 },
    { id: 'Achievements', label: 'Achievements & Badges', icon: Trophy },
    { id: 'Travel Journal', label: 'Travel Journal', icon: FileText },
    { id: 'Bucket List', label: 'Bucket List', icon: ListTodo },
  ];

  return (
    <div className="bg-slate-50/50 w-full min-h-full flex flex-col pb-20">
      <SEO
        title="Travel Dashboard"
        url="/profile"
        description="View your travel stats, upcoming trips, bucket list, and digital memories. Your personal command center for all things travel."
        keywords="travel dashboard, user profile, travel stats, bucket list, travel memories"
      />

      {/* Top Container */}
      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-10 lg:px-20 pt-6">

        {/* Cover Banner Section */}
        <section className="relative rounded-[28px] sm:rounded-[36px] h-[260px] sm:h-[340px] w-full overflow-hidden shadow-2xl border border-slate-100/80 group mb-8">
          <img
            src={user.coverImage}
            alt="Cover"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/30 to-transparent" />

          {/* Edit Profile Button (Top Right) */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEditProfile}
            className="absolute top-6 right-6 px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-md text-slate-800 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:bg-white hover:text-sky-600 transition-all z-10"
          >
            <Pen size={14} />
            <span>Edit Profile</span>
          </motion.button>

          {/* Banner Content (Avatar + Info Bottom) */}
          <div className="absolute bottom-6 sm:bottom-8 left-6 sm:left-10 right-6 flex flex-col sm:flex-row items-start sm:items-end gap-5 sm:gap-6 z-10">
            <div className="relative group/avatar shrink-0">
              <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl bg-slate-100 overflow-hidden ring-4 ring-white shadow-2xl">
                <img src={user.avatarImage} alt={user.profileName} className="h-full w-full object-cover" />
              </div>
              <button
                onClick={handleUpdateAvatar}
                aria-label="Update avatar"
                className="absolute bottom-1 right-1 h-9 w-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-lg ring-2 ring-white hover:bg-sky-500 transition-all"
              >
                <Camera size={16} />
              </button>
            </div>

            <div className="flex-1 text-white">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-none mb-2 drop-shadow-sm">
                {user.profileName}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-medium text-slate-200">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/10">
                  <MapPin size={14} className="text-sky-400" />
                  {user.location}
                </span>
                <span className="text-slate-300">&bull;</span>
                <span className="text-slate-300 font-semibold">{user.joinedDate}</span>
              </div>
            </div>
          </div>
        </section>

        {/* TOP HORIZONTAL TABS UI (Overview, My Trips, Memories, Settings) */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 border-b border-slate-200 w-full mb-8 overflow-x-auto no-scrollbar">
          {topTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative pb-3 text-sm sm:text-base font-bold transition-colors duration-300 whitespace-nowrap px-2 ${activeTab === tab ? "text-sky-600" : "text-slate-500 hover:text-slate-800"
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

        {/* Dashboard Grid (1 Col Left Fixed Sidebar + 3 Col Right Content Cell) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

          {/* LEFT FIXED SIDEBAR NAVIGATION (Quick Stats, Achievements, Journal, Bucket List) */}
          <div className="lg:col-span-1 lg:sticky lg:top-6 space-y-6">
            <div className="bg-white rounded-[28px] sm:rounded-[32px] p-5 border border-slate-100 shadow-xl space-y-2">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-3.5 pb-2">
                Travel Hub & Stats
              </p>

              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all text-left ${isSelected
                      ? "bg-sky-50 text-sky-600 shadow-sm border border-sky-100/80"
                      : "text-slate-600 hover:bg-slate-50/80 hover:text-slate-900"
                      }`}
                  >
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-colors ${isSelected ? "bg-sky-600 text-white shadow-md shadow-sky-100" : "bg-slate-100 text-slate-500"
                      }`}>
                      <Icon size={16} />
                    </div>
                    <span className="flex-1 truncate">{item.label}</span>
                    {isSelected && (
                      <motion.div
                        layoutId="sidebarActiveIndicator"
                        className="w-1.5 h-6 bg-sky-600 rounded-full"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT CELL (CHANGES DYNAMICALLY WHEN CLICKING TOP TABS OR SIDEBAR ITEMS) */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">

              {/* OVERVIEW TAB */}
              {activeTab === 'Overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  {/* UPCOMING JOURNEY CARD */}
                  <div className="bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-xl space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Calendar className="text-sky-600 h-6 w-6" />
                        <span>Upcoming Journey</span>
                      </h2>
                      <button className="text-xs sm:text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 transition-colors">
                        <span>View Itinerary</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>

                    {user.upcomingTrips.map(trip => (
                      <motion.div
                        whileHover={{ y: -4 }}
                        key={trip.id}
                        className="relative rounded-[26px] h-64 sm:h-80 overflow-hidden shadow-2xl border border-slate-100 group cursor-pointer"
                      >
                        <img
                          src={trip.image}
                          alt={trip.destination}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent" />

                        <div className="absolute top-5 right-5 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-md">
                          <Sun size={14} className="text-amber-500 fill-amber-500" />
                          <span>{trip.weather}</span>
                        </div>

                        <div className="absolute bottom-6 left-6 sm:left-8 right-6 text-white space-y-2.5">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full bg-sky-600 text-white font-bold text-[10px] tracking-wider uppercase shadow-md">
                              {trip.status}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 bg-black/40 backdrop-blur-sm px-3.5 py-1 rounded-full border border-white/10">
                              <Clock size={12} className="text-sky-400" />
                              In {trip.daysUntil} Days
                            </span>
                          </div>
                          <h3 className="text-3xl sm:text-4xl font-black tracking-tight">{trip.destination}</h3>
                          <p className="text-xs sm:text-sm font-medium text-slate-300 flex items-center gap-2">
                            <Calendar size={14} className="text-sky-400" />
                            <span>{trip.date}</span>
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* WORLD EXPLORER MAP */}
                  <div className="bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-xl space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                        <Map className="text-indigo-600 h-6 w-6" />
                        <span>World Explorer</span>
                      </h3>
                      <Globe size={20} className="text-slate-400" />
                    </div>

                    <div className="relative h-64 sm:h-72 w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/60 group shadow-md">
                      <img
                        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?fm=jpg&q=60&w=3000&auto=format&fit=crop"
                        alt="World Map"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-extrabold text-slate-900">{user.stats.countriesVisited} Countries Visited</span>
                        <span className="font-bold text-slate-400">Goal: 50 Countries</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full"
                          style={{ width: `${(user.stats.countriesVisited / 50) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* MY TRIPS TAB */}
              {activeTab === 'My Trips' && (
                <motion.div
                  key="trips"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-10 border border-slate-100 shadow-xl space-y-6"
                >
                  <div className="border-b border-slate-100 pb-6">
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1">Past Adventures</h2>
                    <p className="text-slate-500 text-sm">Relive your journey archives and saved trip records.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {user.recentMemories.map(mem => (
                      <motion.div
                        whileHover={{ y: -6 }}
                        key={mem.id}
                        className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-md hover:shadow-xl transition-all flex flex-col group"
                      >
                        <div className="relative h-48 w-full overflow-hidden">
                          <img src={mem.image} alt={mem.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />

                          <button
                            onClick={() => handleLike(mem.title)}
                            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/80 backdrop-blur-md text-slate-700 hover:text-rose-500 hover:bg-white flex items-center justify-center shadow-md transition-all"
                          >
                            <Heart size={16} />
                          </button>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-900 text-base">{mem.title}</h4>
                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                              <Heart size={13} className="text-rose-500 fill-rose-500" />
                              {mem.likes}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                            <MapPin size={13} className="text-sky-500" />
                            <span>{mem.location}</span>
                            <span>&bull;</span>
                            <span>{mem.date}</span>
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* MEMORIES TAB */}
              {activeTab === 'Memories' && (
                <motion.div
                  key="memories"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-10 border border-slate-100 shadow-xl space-y-6"
                >
                  <div className="border-b border-slate-100 pb-6">
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1">Photo Gallery</h2>
                    <p className="text-slate-500 text-sm">A collection of your favorite captured moments around the world.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {user.recentMemories.map(mem => (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        key={mem.id}
                        className="relative h-64 rounded-2xl overflow-hidden shadow-lg group cursor-pointer border border-slate-200"
                      >
                        <img src={mem.image} alt={mem.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

                        <div className="absolute bottom-5 left-5 right-5 text-white">
                          <h4 className="font-extrabold text-base leading-tight mb-1">{mem.title}</h4>
                          <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                            <MapPin size={13} className="text-sky-400 shrink-0" />
                            <span>{mem.location}</span>
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* SETTINGS TAB */}
              {activeTab === 'Settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-10 border border-slate-100 shadow-xl space-y-8"
                >
                  <div className="border-b border-slate-100 pb-6">
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1 flex items-center gap-3">
                      <Settings className="text-sky-600 h-7 w-7" />
                      <span>Account Settings</span>
                    </h2>
                    <p className="text-slate-500 text-sm">Manage your travel profile preferences and account credentials.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm">
                        <Mail size={18} className="text-slate-400 shrink-0" />
                        <input type="email" value={user.email} readOnly className="bg-transparent focus:outline-none w-full truncate" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Traveler Vibe</label>
                      <div className="flex items-center gap-3 p-4 rounded-2xl bg-sky-50/70 border border-sky-100 text-sky-700 font-bold text-sm">
                        <Globe size={18} className="text-sky-600 shrink-0" />
                        <span>{user.vibe}</span>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={handlePrivacySettings}
                    className="flex items-center justify-between p-5 rounded-2xl bg-slate-50/50 hover:bg-sky-50/40 border border-slate-200/80 hover:border-sky-200 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-slate-100 group-hover:bg-white flex items-center justify-center text-slate-600 group-hover:text-sky-600 transition-colors shadow-sm">
                        <ShieldCheck size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base group-hover:text-sky-600 transition-colors">Privacy & Security</h4>
                        <p className="text-xs font-medium text-slate-500">Manage password, tokens, and data privacy</p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
              )}

              {/* QUICK STATS TAB (COMPACT & SLEEK SIZE) */}
              {activeTab === 'Quick Stats' && (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-2xl bg-white rounded-[28px] p-6 sm:p-8 border border-slate-100 shadow-xl space-y-6"
                >
                  <div className="border-b border-slate-100 pb-5">
                    <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">

                      <span>Your Quick Stats</span>
                    </h2>
                    <p className="text-slate-500 text-xs sm:text-sm">Summary of your travel milestones and platform interactions.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600 shadow-sm shrink-0">
                        <Plane size={24} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Trips Planned</p>
                        <h4 className="text-2xl font-black text-slate-900">{user.stats.tripsPlanned}</h4>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                        <Bookmark size={24} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Places Saved</p>
                        <h4 className="text-2xl font-black text-slate-900">{user.stats.placesSaved}</h4>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
                        <Award size={24} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Miles Traveled</p>
                        <h4 className="text-2xl font-black text-slate-900">{user.stats.milesTraveled}</h4>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                        <Globe size={24} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Countries Visited</p>
                        <h4 className="text-2xl font-black text-slate-900">{user.stats.countriesVisited}</h4>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ACHIEVEMENTS TAB (COMPACT & PROPORTIONED) */}
              {activeTab === 'Achievements' && (
                <motion.div
                  key="achievements"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-2xl bg-white rounded-[28px] p-6 sm:p-8 border border-slate-100 shadow-xl space-y-6"
                >
                  <div className="border-b border-slate-100 pb-5">
                    <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">

                      <span>Achievements & Badges</span>
                    </h2>
                    <p className="text-slate-500 text-xs sm:text-sm">Badges earned by discovering places and engaging with explorers.</p>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {user.badges.map(badge => {
                      const IconComponent = badge.name === "Early Bird" ? Sun : (badge.name === "Foodie" ? Utensils : Compass);
                      const badgeColor = badge.name === "Early Bird" ? "bg-amber-50 text-amber-500 border-amber-100" : (badge.name === "Foodie" ? "bg-rose-50 text-rose-500 border-rose-100" : "bg-sky-50 text-sky-500 border-sky-100");

                      return (
                        <motion.div
                          whileHover={{ scale: 1.04 }}
                          key={badge.id}
                          title={badge.name}
                          className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all duration-300 text-center group cursor-pointer"
                        >
                          <div className={`h-12 w-12 rounded-xl ${badgeColor} flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shadow-sm`}>
                            <IconComponent size={22} />
                          </div>
                          <span className="text-xs font-bold text-slate-800 leading-tight">{badge.name}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* TRAVEL JOURNAL TAB (COMPACT NOTEBOOK UI) */}
              {activeTab === 'Travel Journal' && (
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
              )}

              {/* BUCKET LIST TAB (COMPACT SNAPPY CHECKLIST) */}
              {activeTab === 'Bucket List' && (
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
                    {bucketList.map(item => (
                      <li
                        key={item.id}
                        onClick={() => toggleBucketList(item.id)}
                        className={`flex items-center gap-3.5 p-3.5 px-4 rounded-xl border transition-all cursor-pointer select-none ${item.completed
                          ? 'bg-slate-50 border-slate-100 text-slate-400 line-through'
                          : 'bg-white border-slate-200/80 hover:border-sky-300 text-slate-800 font-bold shadow-sm hover:shadow-md'
                          }`}
                      >
                        <div className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${item.completed ? 'bg-sky-600 text-white shadow-sm' : 'border-2 border-slate-300 bg-white'
                          }`}>
                          {item.completed && <Check size={14} strokeWidth={3} />}
                        </div>
                        <span className="text-sm sm:text-base flex-1">{item.place}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
};

const ProfileWrapper = () => {
  const { user, profile } = useUser();
  const userAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (user?.email || "adventurer");

  const mockUser = {
    navName: user?.user_metadata?.full_name || "Guest Explorer",
    navAvatar: userAvatar,
    coverImage: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=1200&auto=format&fit=crop",
    avatarImage: userAvatar,
    profileName: user?.user_metadata?.full_name || "Guest Explorer",
    location: "Global Nomad",
    joinedDate: "Joined April 2026",
    email: user?.email || "guest@example.com",
    vibe: "Modern Nomad",
    stats: {
      tripsPlanned: 12,
      placesSaved: 48,
      milesTraveled: "14.2k",
      countriesVisited: 8
    },
    badges: [
      { id: 1, name: "Early Bird" },
      { id: 2, name: "Foodie" },
      { id: 3, name: "Explorer" }
    ],
    bucketList: [
      { id: 1, place: "See Northern Lights in Iceland", completed: true },
      { id: 2, place: "Hike Mount Fuji, Japan", completed: false },
      { id: 3, place: "Eat pizza in Naples, Italy", completed: false }
    ],
    upcomingTrips: [
      { id: 1, destination: "Tokyo, Japan", date: "Nov 12 - Nov 20, 2026", image: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?fm=jpg&q=60&w=3000&auto=format&fit=crop", status: "READY", daysUntil: 45, weather: "18°C" }
    ],
    visitedPins: [
      { id: 1, name: "Paris", lat: 48.8566, lng: 2.3522 },
      { id: 2, name: "New York", lat: 40.7128, lng: -74.0060 },
      { id: 3, name: "Tokyo", lat: 35.6762, lng: 139.6503 }
    ],
    recentMemories: [
      { id: 1, title: "Sunset at Eiffel", location: "Paris, France", date: "Oct 2025", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600", likes: 124 },
      { id: 2, title: "Central Park Stroll", location: "NYC, USA", date: "Dec 2025", image: "https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?q=80&w=600", likes: 89 },
      { id: 3, title: "Sushi Night", location: "Tokyo, Japan", date: "Mar 2026", image: "https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=600", likes: 210 }
    ]
  };

  return <ProfileDashboard user={mockUser} />;
};

export default ProfileWrapper;
