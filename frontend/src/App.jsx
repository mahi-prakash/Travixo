// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";

// Sirf Landing aur Auth eager load hogi (pehli screen)
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";

// Baaki sab lazy load hongi
const Quiz = lazy(() => import("./pages/Quiz"));
const Home = lazy(() => import("./pages/Home"));
const Explore = lazy(() => import("./pages/Explore"));
const Chat = lazy(() => import("./pages/Chat"));
const Planner = lazy(() => import("./pages/Planner"));
const Profile = lazy(() => import("./pages/Profile"));
const Bookings = lazy(() => import("./pages/Bookings"));
const ComingSoon = lazy(() => import("./pages/ComingSoon"));
const MainLayout = lazy(() => import("./layouts/MainLayout"));

import { useUser } from "./context/UserContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUser();

  if (loading) return <div className="min-h-screen bg-white" />;
  if (!user) return <Navigate to="/" replace />;
  
  return children;
};

const App = () => {
  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/explore" element={<Explore />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/planner/:tripId?" element={<Planner />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Floating Feedback Button */}
        <a
          href="https://forms.gle/SVbaowCiUiCXWt9u9"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-[9999] bg-white backdrop-blur-md text-sky-600 border border-sky-600 px-6 py-4 rounded-full font-bold text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-sky-50 hover:scale-105 transition-all duration-300 flex items-center gap-2.5 group"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
          </span>
          Feedback
        </a>
      </Suspense>
      <Analytics />
    </>
  );
};

export default App;