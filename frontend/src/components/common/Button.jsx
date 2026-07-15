// src/components/common/Button.jsx
import React from "react";
import { motion as Motion } from "framer-motion";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center rounded-full font-bold transition-all focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-50";
  const variants = {
    primary:
      "bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-900/25",
    sky:
      "bg-sky-500 text-white hover:bg-sky-400 shadow-xl shadow-sky-500/30",
    glass:
      "bg-white/80 text-slate-900 border border-slate-200 hover:bg-slate-100 shadow-sm",
    ghost:
      "bg-transparent text-slate-700 hover:bg-slate-100 border border-transparent",
  };
  const sizes = {
    md: "text-sm px-6 py-2.5",
    lg: "text-lg px-8 py-4",
    pill: "text-xs px-4 py-1.5",
  };

  return (
    <Motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.96, y: 0 }}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </Motion.button>
  );
};

export default Button;
