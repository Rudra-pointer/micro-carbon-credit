import React from 'react';

export default function GlassCard({ children, className = '' }) {
  return (
    <div className={`bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20 shadow-lg ${className}`}>
      {children}
    </div>
  );
}
