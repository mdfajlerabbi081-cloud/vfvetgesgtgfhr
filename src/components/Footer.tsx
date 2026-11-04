import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-900">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-3">
            <span className="text-xl font-black text-white tracking-widest uppercase block">
              TREND<span className="text-amber-400">VERSE</span>
            </span>
            <p className="text-slate-400 max-w-sm leading-relaxed">
              আধুনিক ও প্রিমিয়াম ফ্যাশন কালেকশন। ১০০% অরিজিনাল ফেব্রিক, নিখুঁত টেলারিং এবং সারা বাংলাদেশে দ্রুত হোম ডেলিভারি।
            </p>
            <div className="text-[11px] text-slate-500">
              অফিস ও শপ: দক্ষিণ মনিপুর, মিরপুর-২, ঢাকা-১২১৬ | ঢাকা, বাংলাদেশ
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              দ্রুত নেভিগেশন
            </h5>
            <ul className="space-y-1.5">
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">হোম</a>
              </li>
              <li>
                <a href="#products" className="hover:text-amber-400 transition-colors">নতুন কালেকশন ২০২৬</a>
              </li>
              <li>
                <a href="#about" className="hover:text-amber-400 transition-colors">আমাদের সম্পর্কে</a>
              </li>
              <li>
                <a href="#location" className="hover:text-amber-400 transition-colors">শপ লোকেশন</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-amber-400 transition-colors">যোগাযোগ ও হেল্পলাইন</a>
              </li>
            </ul>
          </div>

          {/* Col 3: Payment Partners */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              নিরাপদ পেমেন্ট মেথড
            </h5>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2.5 py-1 bg-slate-900 text-slate-300 rounded-md border border-slate-800 font-mono text-[10px]">
                ক্যাশ অন ডেলিভারি
              </span>
              <span className="px-2.5 py-1 bg-pink-950/50 text-pink-300 rounded-md border border-pink-900/50 font-semibold text-[10px]">
                বিকাশ (bKash)
              </span>
              <span className="px-2.5 py-1 bg-amber-950/50 text-amber-300 rounded-md border border-amber-900/50 font-semibold text-[10px]">
                নগদ (Nagad)
              </span>
              <span className="px-2.5 py-1 bg-slate-900 text-slate-300 rounded-md border border-slate-800 text-[10px]">
                Visa / MasterCard
              </span>
            </div>
            <p className="text-[11px] text-slate-500 pt-2">
              সারাদেশে যেকোনো অর্ডারে ১০০% নিরাপদ ডেলিভারি ভেরিফিকেশন।
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>সর্বস্বত্ব সংরক্ষিত © ২০২৬ TRENDVERSE</p>
          <div className="flex gap-4">
            <a href="#contact" className="hover:text-amber-400 transition-colors">গোপনীয়তা নীতি</a>
            <span aria-hidden="true">·</span>
            <a href="#contact" className="hover:text-amber-400 transition-colors">ব্যবহারের শর্তাবলী</a>
            <span aria-hidden="true">·</span>
            <a href="#contact" className="hover:text-amber-400 transition-colors">এক্সচেঞ্জ পলিসি</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
