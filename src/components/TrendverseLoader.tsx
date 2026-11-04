'use client';

import React from 'react';
import Image from 'next/image';

export default function TrendverseLoader() {
  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-center gap-4">
      <div className="relative w-24 h-24">
        {/* Glowing Outer Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin"></div>
        {/* Centered Logo */}
        <div className="absolute inset-2 rounded-full overflow-hidden border border-slate-800">
          <Image src="/logo.png" alt="TRENDVERSE" fill className="object-cover" />
        </div>
      </div>
      <span className="text-xs font-mono tracking-widest text-amber-400 uppercase animate-pulse">
        TRENDVERSE Loading...
      </span>
    </div>
  );
}
