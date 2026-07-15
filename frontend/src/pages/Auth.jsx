import React, { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const Auth = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, user, profile, loading: authLoading } = useUser();

  // If already logged in, redirect to app automatically
  React.useEffect(() => {
    if (user && profile && !authLoading) {
      navigate("/chat");
    }
  }, [user, profile, authLoading, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(true);
  const [showPop, setShowPop] = useState(false);

  React.useEffect(() => {
    const hasSeenPop = localStorage.getItem("hasSeenStayLoggedInPop");
    if (!hasSeenPop) {
      const timer = setTimeout(() => {
        setShowPop(true);
        localStorage.setItem("hasSeenStayLoggedInPop", "true");
        setTimeout(() => setShowPop(false), 5000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleContinue = async (e) => {
    e.preventDefault();
    setError("Email login is currently disabled. Please use Google Login.");
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      setError("Failed to login with Google. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-sky-50 via-sky-50 to-sky-100 flex items-center justify-center px-6">
      <div className="pointer-events-none absolute -top-40 -right-20 w-[520px] h-[520px] bg-gradient-to-tr from-sky-300/55 to-sky-500/40 blur-[110px] opacity-80" />
      <div className="pointer-events-none absolute bottom-[-220px] left-[-80px] w-[520px] h-[520px] bg-gradient-to-tr from-slate-200/70 to-sky-200/50 blur-[130px]" />

      <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row items-center gap-16">
        <Motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="lg:w-1/2 space-y-6"
        >
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            It's time to fly again.
          </h1>
          <p className="text-base md:text-lg text-slate-700 max-w-md leading-relaxed">
            Keep every chaotic‑good itinerary, hidden gem, and last‑minute
            flight in one calm place. Pick up any trip on any device.
          </p>
        </Motion.div>

        <Motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="lg:w-1/2 w-full relative"
        >
          <Card className="px-8 pt-8 pb-6 rounded-[2.5rem] bg-white/95 shadow-[0_32px_80px_-40px_rgba(15,23,42,0.9)]">
            <div className="mb-6">
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-sky-600">
                The Trav Story
              </p>
              <h2 className="mt-1 text-2xl md:text-3xl font-bold text-slate-900">
                Welcome back, nomad.
              </h2>
              <p className="text-sm md:text-base text-slate-500 mt-1">
                Log in to open your next chaotic‑good escape.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleGoogleLogin()}
                  disabled={authLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-white-900 text-black border border-gray-300 rounded-[2rem] hover:bg-slate-200 transition-all font-bold text-lg shadow-lg active:scale-95"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                  {authLoading ? "Connecting..." : "Continue with Google"}
                </button>
              </div>

              {error && (
                <p className="text-sm text-red-500 font-medium text-center">{error}</p>
              )}

              <div className="relative flex items-center justify-center my-4 opacity-50">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative bg-white px-4 text-xs text-slate-400 font-semibold uppercase tracking-wider">Email coming soon</div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
              <p className="text-[11px] text-slate-400">No spam. Just trips. Built for the modern nomad.</p>
            </div>
          </Card>

          <p className="mt-6 text-[11px] md:text-xs text-center text-slate-400 max-w-sm mx-auto">
            By continuing, you agree to travel way more than your group chat.
          </p>
        </Motion.div>
      </div>
    </div>
  );
};

export default Auth;