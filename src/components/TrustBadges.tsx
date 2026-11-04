import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  const features = [
    {
      icon: Truck,
      title: 'সুপার ফাস্ট ডেলিভারি',
      desc: 'ঢাকা সিটিতে ২৪-৪৮ ঘণ্টায় এবং সারা বাংলাদেশে ২-৩ কার্যদিবসের মধ্যে হোম ডেলিভারি।',
    },
    {
      icon: ShieldCheck,
      title: '১০০% প্রিমিয়াম ফেব্রিক',
      desc: 'প্রতিটি পোশাকে ব্যবহার করা হয়েছে এক্সপোর্ট কোয়ালিটি কম্বড কটন ও কালার গ্যারান্টি ওয়াশ।',
    },
    {
      icon: RefreshCw,
      title: '৭ দিনের সহজ এক্সচেঞ্জ',
      desc: 'সাইজ বা ফিটিংয়ে কোনো অমিল হলে ৭ দিনের মধ্যে ঝামেলাহীন এক্সচেঞ্জ সুবিধা।',
    },
    {
      icon: Headphones,
      title: '২৪/৭ ডেডিকেটেড সাপোর্ট',
      desc: 'অর্ডার বা সাইজ পরামর্শের জন্য আমাদের হেল্পলাইন ও হোয়াটসঅ্যাপ টিম সবসময় প্রস্তুত।',
    },
  ];

  return (
    <section id="about" className="py-16 bg-slate-950 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-2">
            TRENDVERSE প্রতিশ্রুতি
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            মান ও আভিজাত্যে কোনো আপস নয়
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            আধুনিক কাট, প্রিমিয়াম স্টিচিং এবং বিশ্বস্ত ডেলিভারি—আপনার স্টাইলকে আরও আত্মবিশ্বাসী করতে।
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
