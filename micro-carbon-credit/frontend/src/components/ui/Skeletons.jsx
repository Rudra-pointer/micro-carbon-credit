import React from 'react';

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
          <div className="h-3 w-24 bg-white/10 rounded mb-4" />
          <div className="h-8 w-20 bg-white/10 rounded mb-2" />
          <div className="h-2 w-32 bg-white/5 rounded" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-pulse">
      <div className="p-6 border-b border-white/10"><div className="h-5 w-40 bg-white/10 rounded" /></div>
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="flex-1 h-4 bg-white/5 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-6 animate-pulse">
      <div className="h-5 w-48 bg-white/10 rounded mb-6" />
      <div className="h-[300px] bg-white/[0.03] rounded-xl flex items-end gap-2 px-4 pb-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex-1 bg-white/5 rounded-t" style={{ height: `${30 + Math.random() * 60}%` }} />
        ))}
      </div>
    </div>
  );
}
