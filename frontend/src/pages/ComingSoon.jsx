import React from 'react';
import { useNavigate } from 'react-router-dom';

const ComingSoon = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center">
      <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">Coming Soon</h1>
      <p className="text-slate-600 mb-8 text-lg font-medium">This page is currently under construction.</p>
      <button 
        onClick={() => navigate('/')}
        className="px-8 py-3 rounded-full bg-sky-600 hover:bg-sky-400 text-base font-semibold text-white shadow-lg transition-colors cursor-pointer"
      >
        Go Back Home
      </button>
    </div>
  );
};

export default ComingSoon;
