import React, { useState, useEffect } from "react";
import { Outlet, useLocation, NavLink, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { LogOut, ChevronDown, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import plane from "../layouts/plane.png";
import vcurve from "../layouts/VCurve.png";
import Dropdown from "../components/common/Dropdown";

const MainLayout = () => {
  const location = useLocation();
  const isFullWidthPage = location.pathname === "/chat" || location.pathname.startsWith("/planner") || location.pathname === "/profile" || location.pathname === "/bookings" || location.pathname === "/explore";
  const { user, logout } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Automatically close the menu when the route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { to: "/chat", label: "Chat" },
    { to: "/planner", label: "Planner" },
    { to: "/bookings", label: "Bookings" },
    { to: "/explore", label: "Explore" },
    { to: "/profile", label: "Profile" },
  ];

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* HEADER (SINGLE SOURCE OF TRUTH) */}
      <header className="border-b border-slate-100 bg-white">
        <div className="w-full px-8 py-3 flex items-center">

          {/* LEFT — BRAND */}
          <NavLink to="/" className="flex items-center shrink-0 cursor-pointer group mr-auto lg:mr-0">
            <div className="flex flex-col leading-none">
              {/* THE */}
              <span className="text-[10px] font-bold text-slate-400 tracking-[0.3em] mb-[-2px] ml-0.5 transition-colors group-hover:text-sky-600">
                THE
              </span>

              {/* MAIN BRAND: TRAV STORY */}
              <div className="flex items-center">
                <span className="text-2xl sm:text-3xl font-black tracking-tighter text-sky-600">
                  TRA
                </span>

                {/* CONSTRUCTED V (LEFT CURVE + PLANE RIGHT) */}
                <div className="relative flex items-center justify-center w-10 sm:w-14 h-8 sm:h-10.5 -mx-3 sm:-mx-4 translate-y-0.5 group-hover:scale-105 transition-transform duration-300">
                  {/* LEFT CURVE (VCurve.png) - MATCHING SKY BLUE */}
                  <img
                    src={vcurve}
                    alt="V-left"
                    className="absolute inset-0 w-full h-full object-contain -translate-x-1"
                  />
                  {/* PLANE (RIGHT CURVE) (plane.png) */}
                  <img
                    src={plane}
                    alt="V-right"
                    className="absolute inset-0 w-full h-full object-contain translate-x-1.5 scale-110"
                  />
                </div>

                <span className="text-2xl sm:text-3xl font-black tracking-tighter text-slate-900 ml-0">
                  STORY
                </span>
              </div>
            </div>
          </NavLink>

          {/* CENTER — NAVIGATION (Desktop) */}
          <nav className="hidden lg:flex flex-1 justify-center">
            <ul className="flex items-center gap-10 text-m font-semibold">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `pb-1 transition ${isActive
                        ? "text-sky-600 border-b-2 border-sky-600"
                        : "text-slate-600 hover:text-sky-700"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* RIGHT — PROFILE & MOBILE MENU TOGGLE */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition-all border border-slate-100 shadow-sm"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* PROFILE HOVER MENU */}
            <div className="relative group pt-2 pb-2">
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="hidden xl:block text-right">
                  <p className="text-sm font-bold text-slate-900 leading-tight group-hover:text-sky-600 transition-colors">
                    {user?.user_metadata?.full_name || "Guest Traveler"}
                  </p>
                </div>
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-slate-100 overflow-hidden ring-2 ring-white shadow-sm group-hover:ring-sky-100 transition-all">
                  <img
                    src="https://plus.unsplash.com/premium_vector-1728560971513-32c0ac5e2c30?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0"
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
                <ChevronDown size={14} className="text-slate-400 group-hover:text-sky-600 transition-colors" />
              </div>

              {/* DROPDOWN MENU (Shows on hover) */}
              <div className="absolute top-full right-0 mt-0 w-48 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 z-[110]">
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 overflow-hidden">
                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-sky-600 rounded-xl transition-colors"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-red-50 rounded-xl transition-colors mt-1"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE SHELF (MENU) */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm lg:hidden"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 bottom-0 w-[280px] z-[101] bg-white shadow-2xl lg:hidden flex flex-col p-6"
              >
                <div className="flex items-center justify-between mb-10">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Menu</span>
                  <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                    <X size={24} />
                  </button>
                </div>

                <nav>
                  <ul className="space-y-4">
                    {navItems.map((item) => (
                      <li key={item.to}>
                        <button
                          onClick={() => {
                            navigate(item.to);
                          }}
                          className={`w-full flex items-center gap-4 p-4 rounded-2xl text-base font-bold transition-all ${location.pathname === item.to
                            ? "bg-sky-50 text-sky-600 shadow-sm border border-sky-100"
                            : "text-slate-600 hover:bg-slate-50"
                            }`}
                        >
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-100 space-y-4">
                  <button
                    onClick={() => {
                      navigate('/profile');
                    }}
                    className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-xl bg-slate-100 overflow-hidden ring-2 ring-white shadow-sm shrink-0">
                      <img
                        src="https://plus.unsplash.com/premium_vector-1728560971513-32c0ac5e2c30?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0"
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-slate-900 leading-tight">
                        {user?.user_metadata?.full_name || "Guest Traveler"}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Signed in</p>
                    </div>
                  </button>

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors"
                  >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      {/* MAIN CONTENT */}
      <main
        className={
          isFullWidthPage
            ? "flex-1 w-full px-0 pb-0 pt-0 overflow-y-auto no-scrollbar"
            : "flex-1 container mx-auto max-w-5xl px-6 pt-6"
        }
      >
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
