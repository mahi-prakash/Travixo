// src/components/common/BottomNav.jsx
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home as HomeIcon,
  Compass,
  MessageCircle,
  CalendarRange,
  User,
} from "lucide-react";
import { motion as Motion } from "framer-motion";

const tabs = [
  { key: "home", label: "Home", icon: HomeIcon, path: "/home" },
  { key: "explore", label: "Explore", icon: Compass, path: "/explore" },
  { key: "chat", label: "Chat", icon: MessageCircle, path: "/chat" },
  { key: "planner", label: "Planner", icon: CalendarRange, path: "/planner/1" },
  { key: "profile", label: "Profile", icon: User, path: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 pb-6">
      <div className="container mx-auto max-w-5xl px-6 flex justify-center">
        <Motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between w-full max-w-xl px-4 py-3 rounded-full bg-white/95 border border-slate-200 shadow-2xl shadow-slate-900/20 backdrop-blur-md"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const base = tab.path.split("/:")[0];
            const active = location.pathname.startsWith(base);

            return (
              <button
                key={tab.key}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center gap-1 text-[10px] font-medium"
              >
                <div
                  className={`flex items-center justify-center h-9 w-9 rounded-full transition-colors ${active
                      ? "bg-sky-500/10 text-sky-600"
                      : "text-slate-400 hover:text-slate-700"
                    }`}
                >
                  <Icon size={18} strokeWidth={active ? 2.4 : 2} />
                </div>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </Motion.div>
      </div>
    </div>
  );
};

export default BottomNav;
