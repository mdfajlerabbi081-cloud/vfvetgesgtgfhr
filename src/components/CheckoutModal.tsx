import React, { useState } from 'react';
import { CartItem, CustomerInfo, Order, getUnitPrice } from '@/types/product';
import { BANGLADESH_DIVISIONS } from '../data/products';
import { copyTextSafe } from '@/src/assets/brandAssets';
import { useShopSettings } from '../utils/shopSettings';
import { X, ShieldCheck, Check, Truck, CreditCard, Banknote, Copy } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  discountAmount: number;
  onOrderComplete: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  discountAmount,
  onOrderComplete,
}) => {
  const [formData, setFormData] = useState<CustomerInfo>({
    fullName: '',
    phone: '',
    division: BANGLADESH_DIVISIONS[0],
    address: '',
    notes: '',
  });

  const { settings, insideDhakaFeeNum, outsideDhakaFeeNum } = useShopSettings();
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'card'>('cod');
  const [bkashTrxId, setBkashTrxId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + getUnitPrice(item) * item.quantity,
    0
  );

  const isDhaka = formData.division.includes('ঢাকা');
  const deliveryFee = subtotal >= 3000 ? 0 : isDhaka ? insideDhakaFeeNum : outsideDhakaFeeNum;
  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) {
      errs.fullName = 'আপনার পূর্ণ নাম লিখুন';
    }
    const bdPhoneRegex = /^(?:\+8801|01)[3-9]\d{8}$/;
    if (!formData.phone.trim()) {
      errs.phone = 'সচল মোবাইল নম্বর লিখুন';
    } else if (!bdPhoneRegex.test(formData.phone.replace(/[\s-]/g, ''))) {
      errs.phone = 'সঠিক বাংলাদেশী মোবাইল নম্বর প্রদান করুন (যেমন: 017XXXXXXXX)';
    }
    if (!formData.address.trim()) {
      errs.address = 'ডেলিভারির বিস্তারিত ঠিকানা লিখুন';
    }
    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && !bkashTrxId.trim()) {
      errs.trxId = 'অনুগ্রহ করে পেমেন্ট ট্রানজ্যাকশন আইডি (TrxID) লিখুন';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const orderId = `TV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const formattedDate = new Date().toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      const cleanedTrx =
        paymentMethod === 'bkash' || paymentMethod === 'nagad'
          ? bkashTrxId.trim().toUpperCase()
          : undefined;

      const newOrder: Order = {
        id: orderId,
        orderNumber: orderId,
        date: formattedDate,
        createdAt: formattedDate,
        items: items.map((item) => ({
          ...item,
          price: getUnitPrice(item),
        })),
        customer: formData,
        customerName: formData.fullName.trim(),
        customerPhone: formData.phone.trim(),
        deliveryAddress: `${formData.address.trim()}, ${formData.division}`,
        subtotal,
        deliveryFee,
        discount: discountAmount,
        total: grandTotal,
        totalAmount: grandTotal,
        paymentMethod: paymentMethod === 'bkash' ? 'bKash' : 'Cash on Delivery',
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        trxId: cleanedTrx,
        status: 'Pending',
      };

      setIsSubmitting(false);
      onOrderComplete(newOrder);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-slate-900 text-slate-100 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-800">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold">TRENDVERSE অর্ডার কনফার্মেশন</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[82vh] overflow-y-auto space-y-6">
          {/* Section 1: Customer Details */}
          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span>১. প্রাপকের তথ্য ও ঠিকানা</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  আপনার নাম <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="যেমন: মোঃ ফজলে রাব্বি"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={`w-full px-3.5 py-2.5 text-xs bg-slate-950 text-white border rounded-xl focus:outline-none ${
                    errors.fullName ? 'border-rose-500' : 'border-slate-800 focus:border-amber-400'
                  }`}
                />
                {errors.fullName && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  মোবাইল নম্বর <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="যেমন: 017XXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-3.5 py-2.5 text-xs bg-slate-950 text-white border rounded-xl focus:outline-none ${
                    errors.phone ? 'border-rose-500' : 'border-slate-800 focus:border-amber-400'
                  }`}
                />
                {errors.phone && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.phone}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  বিভাগ / এলাকা নির্বাচন করুন <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-950 text-white border border-slate-800 rounded-xl focus:outline-none focus:border-amber-400"
                >
                  {BANGLADESH_DIVISIONS.map((div) => (
                    <option key={div} value={div}>
                      {div}{' '}
                      {div.includes('ঢাকা')
                        ? `(ডেলিভারি ৳${insideDhakaFeeNum.toLocaleString('bn-BD')})`
                        : `(ডেলিভারি ৳${outsideDhakaFeeNum.toLocaleString('bn-BD')})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  বিস্তারিত ডেলিভারি ঠিকানা <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="বাড়ি নং, রোড নং, এলাকা/থানা, জেলা"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full px-3.5 py-2.5 text-xs bg-slate-950 text-white border rounded-xl focus:outline-none ${
                    errors.address ? 'border-rose-500' : 'border-slate-800 focus:border-amber-400'
                  }`}
                />
                {errors.address && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.address}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  ডেলিভারি বা সাইজ নোট (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: L সাইজ পাঠাবেন বা বিকালে কল দিয়ে আসবেন"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-950 text-white border border-slate-800 rounded-xl focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div>
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Banknote className="w-4 h-4 text-emerald-400" />
              <span>২. পেমেন্ট পদ্ধতি নির্বাচন করুন</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Cash on Delivery */}
              <label
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-amber-400 bg-amber-400/10'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-0.5 accent-amber-400"
                />
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>ক্যাশ অন ডেলিভারি (COD)</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-semibold">
                      জনপ্রিয়
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    পণ্য হাতে পেয়ে চেক করে মূল্য পরিশোধ করুন।
                  </p>
                </div>
              </label>

              {/* bKash */}
              <label
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'bkash'
                    ? 'border-pink-500 bg-pink-500/10'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'bkash'}
                  onChange={() => setPaymentMethod('bkash')}
                  className="mt-0.5 accent-pink-500"
                />
                <div>
                  <p className="text-xs font-bold text-pink-400">বিকাশ (bKash)</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    আমাদের বিকাশ নম্বরে সরাসরি পেমেন্ট করুন।
                  </p>
                </div>
              </label>

              {/* Nagad */}
              <label
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'nagad'
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'nagad'}
                  onChange={() => setPaymentMethod('nagad')}
                  className="mt-0.5 accent-amber-500"
                />
                <div>
                  <p className="text-xs font-bold text-amber-400">নগদ (Nagad)</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    নগদ একাউন্ট থেকে দ্রুত ও সহজে ক্যাশলেস পেমেন্ট।
                  </p>
                </div>
              </label>

              {/* Debit/Credit Card */}
              <label
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-sky-500 bg-sky-500/10'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="mt-0.5 accent-sky-500"
                />
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-sky-400" />
                    <span>কার্ড পেমেন্ট (Visa / Master)</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    নিরাপদ অনলাইন গেটওয়ের মাধ্যমে কার্ড পরিশোধ।
                  </p>
                </div>
              </label>
            </div>

            {/* bKash / Nagad instructions */}
            {(paymentMethod === 'bkash' || paymentMethod === 'nagad') && (
              <div className="mt-3 p-4 bg-slate-950 text-slate-200 rounded-2xl border border-slate-800 text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <p className="font-bold text-white flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${paymentMethod === 'bkash' ? 'bg-pink-500' : 'bg-amber-500'}`}></span>
                    <span>{paymentMethod === 'bkash' ? 'বিকাশ (bKash) পেমেন্ট' : 'নগদ (Nagad) পেমেন্ট'}</span>
                  </p>
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md font-mono">
                    TRENDVERSE Verified
                  </span>
                </div>

                <div className="space-y-1 text-slate-300">
                  <p className="font-medium text-[11px] text-amber-400">পেমেন্ট করার নিয়মাবলী:</p>
                  <p>১. আপনার অ্যাপ থেকে <strong>Send Money</strong> বা <strong>Cash In</strong> করুন।</p>
                  <p>২. প্রদেয় মোট টাকা: <strong className="text-emerald-400 font-mono font-bold">৳{grandTotal.toLocaleString('bn-BD')}</strong></p>
                  <p>৩. নিচের নাম্বারে টাকা পাঠান:</p>
                </div>

                <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="font-mono text-sm font-bold text-white tracking-wider">
                    {paymentMethod === 'bkash' ? settings.bkashNumber : settings.helpline}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const num =
                        paymentMethod === 'bkash' ? settings.bkashNumber : settings.helpline;
                      copyTextSafe(num).then(() => {
                        setCopiedNumber(true);
                        setTimeout(() => setCopiedNumber(false), 2000);
                      });
                    }}
                    className="text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedNumber ? 'কপি হয়েছে!' : 'কপি করুন'}</span>
                  </button>
                </div>

                <div>
                  <label className="block text-slate-400 text-[11px] font-semibold mb-1">
                    {paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'} ট্রানজেকশন আইডি (TrxID) *
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: 8N7A6W5X9Z"
                    value={bkashTrxId}
                    onChange={(e) => setBkashTrxId(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-900 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-amber-400 font-mono uppercase tracking-wider"
                  />
                  {errors.trxId && (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.trxId}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Order Summary */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <h5 className="text-xs font-bold text-white mb-2">অর্ডার সামারি</h5>
            <div className="max-h-32 overflow-y-auto space-y-1 text-xs">
              {items.map((it) => (
                <div key={it.id} className="flex justify-between text-slate-300">
                  <span className="truncate pr-2">
                    {it.name} × {it.quantity}
                  </span>
                  <span className="font-mono tabular-nums shrink-0 text-white">
                    ৳{(getUnitPrice(it) * it.quantity).toLocaleString('bn-BD')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-1 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>সাবটোটাল</span>
                <span className="font-mono tabular-nums text-slate-200">৳{subtotal.toLocaleString('bn-BD')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>ডিসকাউন্ট</span>
                  <span className="font-mono tabular-nums">-৳{discountAmount.toLocaleString('bn-BD')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>ডেলিভারি চার্জ ({isDhaka ? 'ঢাকা' : 'ঢাকার বাইরে'})</span>
                <span className="font-mono tabular-nums">
                  {deliveryFee === 0 ? <span className="text-emerald-400 font-bold">ফ্রি</span> : `৳${deliveryFee.toLocaleString('bn-BD')}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-1.5 border-t border-slate-800">
                <span>মোট পরিশোধযোগ্য</span>
                <span className="text-amber-400 font-mono text-base tabular-nums">
                  ৳{grandTotal.toLocaleString('bn-BD')}
                </span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 disabled:bg-slate-700 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-400/10 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            {isSubmitting ? (
              <span>অর্ডার সম্পন্ন হচ্ছে...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>অর্ডার নিশ্চিত করুন (৳{grandTotal.toLocaleString('bn-BD')})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
