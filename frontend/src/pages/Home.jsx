// src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { useUser } from "../context/UserContext";
import { mockFeed } from "../data/mockFeed";
import { PlaneTakeoff, Users } from "lucide-react";
import { motion } from "framer-motion";

const Home = () => {
  const { user } = useUser();
  const firstName = user.name.split(" ")[0] || "Nomad";
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* Greeting block */}
      <div className="space-y-1">
        <p className="text-[11px] text-slate-500">
          Good Evening, {firstName}.
        </p>
        <h1 className="text-xl font-semibold text-slate-900">
          Tell your dates, budget, and energy.
        </h1>
        <p className="text-[11px] text-sky-600 font-medium">
          {user.personalityTag}
        </p>
      </div>

      {/* Quick actions + next flight */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] text-slate-500">Next flight</p>
          <span className="text-[11px] text-emerald-500 font-medium">
            GA‑881 · On time
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/chat")}
            className="rounded-[22px] bg-gradient-to-tr from-sky-500 to-sky-400 text-white px-3 py-3 flex flex-col gap-1 shadow-[0_18px_40px_-24px_rgba(56,189,248,0.9)]"
          >
            <PlaneTakeoff size={20} />
            <span className="text-sm font-semibold">Plan solo trip</span>
            <span className="text-[11px] text-sky-50/80">
              Full AI‑guided chaos.
            </span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/chat")}
            className="rounded-[22px] bg-slate-50 border border-slate-100 px-3 py-3 flex flex-col gap-1"
          >
            <Users size={20} className="text-sky-500" />
            <span className="text-sm font-semibold text-slate-900">
              Plan with friends
            </span>
            <span className="text-[11px] text-slate-500">
              Share a link, argue later.
            </span>
          </motion.button>
        </div>
        <button className="mt-3 w-full text-left rounded-[18px] bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
          I just want ideas for later
        </button>
      </Card>

      {/* Trending for your vibe */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] text-slate-500">Trending for your vibe</p>
          <button className="text-[11px] text-sky-500">All</button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {mockFeed.trendingForVibe.map((item) => (
            <div
              key={item.id}
              className="min-w-[150px] rounded-[22px] bg-slate-50 border border-slate-100 p-3 flex flex-col gap-1"
            >
              <div
                className={`h-16 w-full rounded-[18px] ${item.thumbnailColor}`}
              />
              <p className="text-[11px] text-slate-500 mt-1">{item.city}</p>
              <p className="text-sm font-medium text-slate-900 leading-snug">
                {item.title}
              </p>
              <p className="text-[11px] text-sky-600">{item.tag}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* From the feed */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] text-slate-500">From the feed</p>
          <button
            className="text-[11px] text-sky-500"
            onClick={() => navigate("/explore")}
          >
            Open in Explore
          </button>
        </div>
        <div className="space-y-2">
          {mockFeed.fromFeed.map((post) => (
            <div
              key={post.id}
              className="rounded-[18px] bg-slate-50 border border-slate-100 px-3 py-2"
            >
              <p className="text-[11px] text-slate-500 mb-0.5">
                {post.location}
              </p>
              <p className="text-sm font-medium text-slate-900">
                {post.title}
              </p>
              <p className="text-[11px] text-slate-500">{post.snippet}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Home;
