import React from 'react';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Sparkles } from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
  onOffersClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick, onOffersClick }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-8 sm:p-12 lg:p-14 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-xs rounded-full text-xs font-semibold mb-4 text-indigo-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>TRENDVERSE কালেকশন ২০২৬</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight">
            আধুনিক জীবনের জন্য সেরা গ্যাজেট ও ফ্যাশন
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-indigo-100 text-base sm:text-lg leading-relaxed">
            সবচেয়ে নির্ভরযোগ্য দামে অরিজিনাল প্রোডাক্ট অর্ডার করুন সরাসরি আপনার ঠিকানায়।
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3.5 mt-8">
            <button
              onClick={onExploreClick}
              className="px-6 py-3 bg-white text-indigo-700 hover:bg-indigo-50 text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>পণ্যসমূহ দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOffersClick}
              className="px-6 py-3 bg-indigo-800/60 hover:bg-indigo-800/90 text-white text-sm font-semibold rounded-xl border border-indigo-400/30 transition-all cursor-pointer active:scale-95"
            >
              আজকের অফার
            </button>
          </div>

          {/* Trust points */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-10 pt-6 border-t border-indigo-500/40 text-xs">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-200 shrink-0" />
              <span>সারা দেশে হোম ডেলিভারি</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-200 shrink-0" />
              <span>১০০% অথেনটিক পণ্য</span>
            </div>
            <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
              <RotateCcw className="w-4 h-4 text-indigo-200 shrink-0" />
              <span>৭ দিনের রিটার্ন গ্যারান্টি</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
