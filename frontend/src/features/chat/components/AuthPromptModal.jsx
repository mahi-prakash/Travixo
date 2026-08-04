import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function AuthPromptModal({ authLoading, loginWithGoogle }) {
  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-[32px] p-8 shadow-xl text-center space-y-6"
      >
        <div className="w-20 h-20 bg-sky-50 rounded-3xl flex items-center justify-center mx-auto mb-2">
          <Sparkles className="text-sky-600 w-10 h-10" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ready for your next story?</h1>
        <p className="text-slate-500 text-lg leading-relaxed">
          Login with Google to start planning your perfect adventure. We'll save everything for you.
        </p>
        <button
          onClick={loginWithGoogle}
          className="w-full py-4 px-6 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-95"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>
      </motion.div>
    </div>
  );
}
