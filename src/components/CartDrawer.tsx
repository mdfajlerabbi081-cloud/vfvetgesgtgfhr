import React, { useState } from 'react';
import Image from 'next/image';
import { CartItem, getUnitPrice } from '@/types/product';
import { copyTextSafe } from '@/src/assets/brandAssets';
import { useShopSettings } from '../utils/shopSettings';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Tag,
  CheckCircle2,
  Copy,
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  onQuickBkashOrder?: (trxId: string, totalAmount: number) => void;
  appliedCoupon: string | null;
  discountAmount: number;
  onApplyCoupon: (code: string) => boolean;
  onRemoveCoupon: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onQuickBkashOrder,
  appliedCoupon,
  discountAmount,
  onApplyCoupon,
  onRemoveCoupon,
}) => {
  const { settings, insideDhakaFeeNum } = useShopSettings();
  const bkashNumber = settings.bkashNumber;
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [trxId, setTrxId] = useState('');
  const [trxError, setTrxError] = useState('');
  const [copied, setCopied] = useState(false);
  const [submittedTrx, setSubmittedTrx] = useState<string | null>(null);

  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + getUnitPrice(item) * item.quantity,
    0
  );

  const freeDeliveryThreshold = 3000;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const deliveryFee =
    subtotal >= freeDeliveryThreshold || subtotal === 0 ? 0 : insideDhakaFeeNum;
  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee);
  const progressRatio = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;

    const success = onApplyCoupon(couponInput.trim().toUpperCase());
    if (success) {
      setCouponInput('');
    } else {
      setCouponError('কুপন কোডটি সঠিক নয়! ট্রাই করুন: TREND10 বা EID2026');
    }
  };

  const copyBkashNumber = () => {
    copyTextSafe(bkashNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDirectBkashSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setTrxError('আপনার কার্ট খালি রয়েছে!');
      return;
    }
    const cleanedTrx = trxId.trim().toUpperCase();
    if (!cleanedTrx) {
      setTrxError('অনুগ্রহ করে বিকাশের Transaction ID (TrxID) লিখুন');
      return;
    }
    setTrxError('');
    setSubmittedTrx(cleanedTrx);
    setTrxId('');
    if (onQuickBkashOrder) {
      onQuickBkashOrder(cleanedTrx, grandTotal);
    }
  };

  const handleDrawerClose = () => {
    setSubmittedTrx(null);
    setTrxError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed Backdrop */}
      <div
        onClick={handleDrawerClose}
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 text-slate-100 shadow-2xl flex flex-col border-l border-slate-800">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white uppercase">আপনার শপিং কার্ট</h3>
              <span className="text-xs bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md font-black font-mono tabular-nums">
                {items.reduce((acc, it) => acc + it.quantity, 0)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleDrawerClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free delivery tracker banner */}
          {subtotal > 0 && !submittedTrx && (
            <div className="bg-slate-950/80 border-b border-slate-800 p-3.5 text-xs text-slate-300">
              {remainingForFreeDelivery === 0 ? (
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>অভিনন্দন! আপনি সম্পূর্ণ ফ্রি এক্সপ্রেস ডেলিভারি পাচ্ছেন।</span>
                </div>
              ) : (
                <div>
                  <span>আর মাত্র </span>
                  <span className="font-bold text-amber-400 font-mono tabular-nums">
                    ৳{remainingForFreeDelivery.toLocaleString('bn-BD')}
                  </span>
                  <span> টাকার কেনাকাটা করলেই ফ্রি ডেলিভারি!</span>
                  <progress
                    value={progressRatio}
                    max={100}
                    className="w-full h-1.5 mt-2 rounded-full overflow-hidden accent-amber-400 bg-slate-800 [&::-webkit-progress-bar]:bg-slate-800 [&::-webkit-progress-value]:bg-amber-400 [&::-moz-progress-bar]:bg-amber-400"
                  />
                </div>
              )}
            </div>
          )}

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {submittedTrx ? (
              <div className="text-center py-8 space-y-3 bg-slate-950 p-6 rounded-2xl border border-emerald-500/30">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-lg font-bold text-white">অর্ডার সফল হয়েছে!</h4>
                <p className="text-xs text-slate-300">
                  বিকাশ TrxID:{' '}
                  <span className="font-mono text-pink-400 font-bold">{submittedTrx}</span>
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ধন্যবাদ! আমাদের প্রতিনিধি আপনার বিকাশ পেমেন্ট ভেরিফাই করে দ্রুত ডেলিভারি প্রসেস করবেন।
                </p>
                <button
                  type="button"
                  onClick={handleDrawerClose}
                  className="mt-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black cursor-pointer transition"
                >
                  আরও শপিং করুন
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl mb-3 text-amber-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-white font-bold text-base mb-1">
                  আপনার কার্ট বর্তমানে খালি!
                </h4>
                <p className="text-xs text-slate-400 mb-6 max-w-xs">
                  পছন্দের থ্রি-পিস বা পোশাক যোগ করতে আমাদের কালেকশন ঘুরে দেখুন।
                </p>
                <button
                  type="button"
                  onClick={handleDrawerClose}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  কালেকশন দেখুন
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4 divide-y divide-slate-800/80">
                  {items.map((item) => {
                    const unitPrice = getUnitPrice(item);
                    return (
                      <div key={item.id} className="pt-4 first:pt-0 flex gap-3.5 items-center">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800 flex items-center justify-center">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          ) : (
                            <ShoppingBag className="w-5 h-5 text-slate-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">
                            {item.name}
                          </h4>
                          <p className="text-xs text-amber-400 font-mono tabular-nums mt-0.5">
                            ৳{unitPrice.toLocaleString('bn-BD')}
                          </p>

                          {/* Quantity Selector */}
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center border border-slate-700 bg-slate-950 rounded-lg overflow-hidden">
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                className="px-2 py-1 text-slate-300 hover:bg-slate-800 text-xs font-bold cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2.5 py-0.5 text-xs font-mono font-semibold text-white tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                className="px-2 py-1 text-slate-300 hover:bg-slate-800 text-xs font-bold cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="text-xs font-bold text-slate-200 font-mono ml-auto tabular-nums">
                              ৳{(unitPrice * item.quantity).toLocaleString('bn-BD')}
                            </span>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="মুছে ফেলুন"
                          aria-label="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Direct bKash Instant Payment Form inside Cart Drawer */}
                <form
                  onSubmit={handleDirectBkashSubmit}
                  className="bg-slate-950 p-4 rounded-2xl border border-pink-500/30 space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs sm:text-sm font-bold text-pink-400">
                      বিকাশ (bKash) দ্রুত পেমেন্ট অপশন
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400">Send Money</span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1.5">
                    <p>
                      ১. বিকাশ থেকে <strong>Send Money</strong> করুন:{' '}
                      <strong className="text-emerald-400 font-mono tabular-nums">
                        ৳{grandTotal.toLocaleString('bn-BD')}
                      </strong>
                    </p>
                    <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="font-mono text-sm text-white font-bold tracking-wider">
                        {bkashNumber}
                      </span>
                      <button
                        type="button"
                        onClick={copyBkashNumber}
                        className="text-[11px] bg-pink-500 hover:bg-pink-400 text-white px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copied ? 'কপি হয়েছে!' : 'কপি করুন'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      বিকাশ TrxID দিন
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: 8N7A6W5X9Z"
                      value={trxId}
                      onChange={(e) => {
                        setTrxId(e.target.value.toUpperCase());
                        if (trxError) setTrxError('');
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-mono uppercase tracking-wider"
                    />
                    {trxError && (
                      <p className="text-[11px] text-rose-400 mt-1">{trxError}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer active:scale-98"
                  >
                    বিকাশে অর্ডার কনফার্ম করুন (৳{grandTotal.toLocaleString('bn-BD')})
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Footer & Full Checkout Area (Cash on Delivery / Address Form) */}
          {items.length > 0 && !submittedTrx && (
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 space-y-3">
              {/* Coupon Form */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl text-xs text-emerald-300">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        কুপন <strong className="font-mono text-white">{appliedCoupon}</strong> প্রয়োগ হয়েছে (৳{discountAmount.toLocaleString('bn-BD')} ছাড়)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={onRemoveCoupon}
                      className="text-slate-400 hover:text-rose-400 font-bold ml-2 cursor-pointer"
                    >
                      বাতিল
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCouponSubmit} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="কুপন কোড (যেমন: TREND10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-slate-900 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-amber-400 uppercase font-mono"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold cursor-pointer transition"
                    >
                      প্রয়োগ
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[11px] text-rose-400 mt-1">{couponError}</p>
                )}
              </div>

              {/* Price Calculation breakdown */}
              <div className="space-y-1 text-xs text-slate-400 pt-1">
                <div className="flex justify-between">
                  <span>সাবটোটাল</span>
                  <span className="font-mono tabular-nums text-slate-200">
                    ৳{subtotal.toLocaleString('bn-BD')}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>কুপন ডিসকাউন্ট</span>
                    <span className="font-mono tabular-nums">
                      -৳{discountAmount.toLocaleString('bn-BD')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>ডেলিভারি চার্জ</span>
                  <span className="font-mono tabular-nums">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-400 font-semibold">ফ্রি</span>
                    ) : (
                      `৳${deliveryFee.toLocaleString('bn-BD')}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-bold text-white pt-1.5 border-t border-slate-800">
                  <span>মোট টাকা</span>
                  <span className="text-amber-400 font-mono text-base tabular-nums">
                    ৳{grandTotal.toLocaleString('bn-BD')}
                  </span>
                </div>
              </div>

              {/* Full Checkout Button (COD / Delivery Address) */}
              <button
                type="button"
                onClick={onProceedToCheckout}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-400/10 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>ক্যাশ অন ডেলিভারি / পূর্ণ ঠিকানায় অর্ডার করুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
