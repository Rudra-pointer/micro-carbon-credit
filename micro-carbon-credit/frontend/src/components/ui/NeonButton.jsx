import React from 'react';

export default function NeonButton({ children, onClick, className = '' }) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2 bg-transparent text-green-400 font-semibold rounded border border-green-400 hover:bg-green-400 hover:text-white transition-all shadow-[0_0_10px_rgba(74,222,128,0.5)] hover:shadow-[0_0_20px_rgba(74,222,128,0.8)] ${className}`}
    >
      {children}
    </button>
  );
}
