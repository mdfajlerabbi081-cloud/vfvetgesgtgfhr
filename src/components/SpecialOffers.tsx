import React from 'react';
import { Tag, Sparkles, Copy, Check } from 'lucide-react';
import { Product } from '@/types/product';
import { BRAND_IMAGES, copyTextSafe } from '@/src/assets/brandAssets';

interface SpecialOffersProps {
  onQuickAddToCart: (product: Product) => void;
  featuredProduct?: Product;
}

export const SpecialOffers: React.FC<SpecialOffersProps> = ({
  onQuickAddToCart,
  featuredProduct,
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyCoupon = (code: string) => {
    copyTextSafe(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section id="offers" className="py-12 bg-rose-50/60 border-y border-rose-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Coupon Highlight Box */}
          <div className="bg-gradient-to-br from-rose-600 to-rose-700 text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-md">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-semibold mb-4">
                <Tag className="w-3.5 h-3.5 text-white" />
                <span>স্পেশাল প্রোমো কোড</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-2">
                ১০% ফ্ল্যাট ডিসকাউন্ট পান!
              </h3>
              <p className="text-xs text-rose-100 leading-relaxed mb-6">
                আপনার প্রথম কেনাকাটায় কুপন কোড ব্যবহার করে অতিরিক্ত ১০% সাশ্রয় করুন। সীমিত সময়ের জন্য প্রযোজ্য।
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/20 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-rose-200 block">কুপন কোড:</span>
                <span className="font-mono text-lg font-bold tracking-widest text-white">
                  AMAR10
                </span>
              </div>
              <button
                onClick={() => copyCoupon('AMAR10')}
                className="px-3 py-1.5 bg-white text-rose-700 hover:bg-rose-50 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>কপি হয়েছে</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>কপি করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Flash Combo Showcase */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex-1 space-y-3">
              <div className="inline-flex items-center gap-1.5 text-xs text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>মেগা বান্ডেল ধামাকা</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
                স্মার্টওয়াচ Pro + প্রিমিয়াম হেডফোন কম্বো
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                দুটি টপ গ্যাজেট একসাথে কিনলে পাচ্ছেন অতিরিক্ত ৳৭০০ টাকা বিশেষ ক্যাশব্যাক এবং ফ্রি এক্সপ্রেস হোম ডেলিভারি!
              </p>

              <div className="flex items-center gap-3 pt-2">
                <span className="text-2xl font-bold text-rose-600 font-mono">
                  ৳৩,৬০০
                </span>
                <span className="text-sm text-stone-400 line-through font-mono">
                  ৳৪,৩০০
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  ১৬% সেভ
                </span>
              </div>

              {featuredProduct && (
                <button
                  onClick={() => onQuickAddToCart(featuredProduct)}
                  className="mt-3 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer active:scale-95 shadow-xs"
                >
                  কম্বো অফারটি লুফে নিন
                </button>
              )}
            </div>

            <div className="w-full md:w-56 shrink-0 aspect-4/3 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
              <img
                src={BRAND_IMAGES.chronoWatch}
                alt="স্মার্ট কম্বো অফার"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
