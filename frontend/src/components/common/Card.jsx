// src/components/common/Card.jsx
import React from "react";

const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`rounded-[2rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/60 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
