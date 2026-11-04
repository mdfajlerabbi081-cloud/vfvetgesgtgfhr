import React, { useState } from 'react';
import Image from 'next/image';
import { Product, getUnitPrice } from '@/types/product';
import { X, Star, ShoppingBag, ShieldCheck, Check, MessageCircle } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

const APPAREL_CATEGORIES = ['T-Shirts', 'Jackets', 'Hoodies', 'Pants'];

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('L');
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const unitPrice = getUnitPrice(product);
  const isApparel = APPAREL_CATEGORIES.includes(product.category);
  const sizes = product.category === 'Pants' ? ['30', '32', '34', '36'] : ['M', 'L', 'XL', 'XXL'];

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    `হ্যালো TRENDVERSE, আমি '${product.name}' (মূল্য: ৳${unitPrice}${isApparel ? `, সাইজ: ${selectedSize}` : ''}) অর্ডার করতে চাই।`
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="relative bg-slate-900 text-slate-100 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-800"
        role="dialog"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-950/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer"
          aria-label="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Product Studio Image */}
          <div className="relative min-h-[280px] md:min-h-[420px] bg-slate-950 flex items-center justify-center overflow-hidden">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-slate-600 p-8 text-center">
                <ShoppingBag className="w-12 h-12 text-slate-700" />
                <span className="text-xs font-mono uppercase tracking-widest text-slate-500">
                  {product.sku || 'TRENDVERSE'}
                </span>
              </div>
            )}
          </div>

          {/* Right: Contiguous Purchase Module */}
          <div className="p-6 md:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold uppercase tracking-wider text-amber-400">
                  {product.category}
                </span>
                {product.rating !== undefined && (
                  <div className="flex items-center gap-1 text-amber-400 font-medium">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-semibold text-white">{product.rating}</span>
                    {product.reviewsCount !== undefined && (
                      <span className="text-slate-400">({product.reviewsCount} রিভিউ)</span>
                    )}
                  </div>
                )}
              </div>

              {/* Title */}
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                {product.name}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-black text-amber-400 font-mono tabular-nums">
                  ৳{unitPrice.toLocaleString('bn-BD')}
                </span>
                {product.originalPrice && product.originalPrice > unitPrice && (
                  <>
                    <span className="text-sm text-slate-500 line-through font-mono">
                      ৳{product.originalPrice.toLocaleString('bn-BD')}
                    </span>
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold px-2 py-0.5 rounded-md">
                      ৳{(product.originalPrice - unitPrice).toLocaleString('bn-BD')} সাশ্রয়
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-xs sm:text-sm text-slate-300 mb-5 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Size Selector for Apparel */}
              {isApparel && (
                <div className="mb-5">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                    সাইজ নির্বাচন করুন:
                  </span>
                  <div className="flex gap-2">
                    {sizes.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition cursor-pointer ${
                          selectedSize === sz
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-amber-500/40'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Features */}
              {product.features && product.features.length > 0 && (
                <div className="mb-5">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                    প্রধান বৈশিষ্ট্যসমূহ:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-400">
                    {product.features.map((feat, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold mt-0.5">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Specifications */}
              {product.specs && product.specs.length > 0 && (
                <div className="mb-5">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {product.specs.map((s, idx) => (
                      <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-500 block text-[11px]">{s.label}</span>
                        <span className="font-semibold text-slate-200">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assurance badge */}
              <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800 mb-5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{product.warranty || '৭ দিনের সহজ সাইজ এক্সচেঞ্জ সুবিধা'} | ১০০% অরিজিনাল কোয়ালিটি</span>
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-2.5 text-slate-300 hover:bg-slate-800 font-bold text-sm cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-sm font-semibold font-mono min-w-8 text-center text-white">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3.5 py-2.5 text-slate-300 hover:bg-slate-800 font-bold text-sm cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAdd}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isAdded
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/10 active:scale-98'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{quantity} টি কার্টে যোগ হয়েছে</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>কার্টে যোগ করুন</span>
                    </>
                  )}
                </button>
              </div>

              {/* Direct WhatsApp button */}
              <a
                href={`https://wa.me/8801930045168?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>হোয়াটসঅ্যাপে সরাসরি অর্ডার করুন</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
