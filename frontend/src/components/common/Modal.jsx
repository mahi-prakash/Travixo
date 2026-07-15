// src/components/common/Modal.jsx
import React from "react";
import { X } from "lucide-react";
import { motion as Motion } from "framer-motion";

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-md flex items-center justify-center">
      <Motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[2rem] p-5 shadow-2xl shadow-slate-900/30 border border-slate-100"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </Motion.div>
    </div>
  );
};

export default Modal;
