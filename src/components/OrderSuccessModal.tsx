import React from 'react';
import { Order, getUnitPrice } from '@/types/product';
import { CheckCircle2, PackageCheck, Printer, ArrowRight } from 'lucide-react';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-slate-900 text-slate-100 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-800">
        {/* Success Header banner */}
        <div className="p-6 bg-emerald-600 text-white text-center">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold">ধন্যবাদ! আপনার অর্ডারটি সফলভাবে নিশ্চিত হয়েছে</h3>
          <p className="text-emerald-100 text-xs mt-1">
            অর্ডার আইডি: <strong className="font-mono text-white tracking-wider">{order.id}</strong>
          </p>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-5">
          {/* Timeline tracker */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              অর্ডার স্ট্যাটাস ট্র্যাকিং:
            </h4>
            <div className="grid grid-cols-3 text-center text-xs relative">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-bold mb-1">
                  ✓
                </div>
                <span className="font-semibold text-emerald-400">অর্ডার নিশ্চিত</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[10px] font-bold mb-1">
                  ২
                </div>
                <span className="text-slate-200 font-medium">প্যাকেজিং হচ্ছে</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold mb-1">
                  ৩
                </div>
                <span className="text-slate-500">ডেলিভারি সম্পন্ন</span>
              </div>
            </div>
            <p className="text-center text-[11px] text-slate-400 mt-3">
              আনুমানিক ডেলিভারি সময়: <strong className="text-white">২৪-৭২ ঘণ্টা</strong> (প্রতিনিধি কল করে নিশ্চিত করবেন)
            </p>
          </div>

          {/* Delivery & Billing Summary */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">গ্রাহকের নাম:</span>
              <span className="font-semibold text-white">{order.customer.fullName}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">মোবাইল নম্বর:</span>
              <span className="font-mono text-white">{order.customer.phone}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">ডেলিভারি ঠিকানা:</span>
              <span className="font-medium text-slate-200 text-right max-w-[60%]">
                {order.customer.address}, {order.customer.division}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">পেমেন্ট মেথড:</span>
              <span className="font-semibold text-amber-400 uppercase">
                {order.paymentMethod === 'cod'
                  ? 'ক্যাশ অন ডেলিভারি (COD)'
                  : order.paymentMethod === 'bkash'
                  ? 'বিকাশ পেমেন্ট'
                  : order.paymentMethod === 'nagad'
                  ? 'নগদ পেমেন্ট'
                  : 'কার্ড পেমেন্ট'}
              </span>
            </div>
          </div>

          {/* Items breakdown */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <h5 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-amber-400" />
              <span>ক্রয়কৃত আইটেমসমূহ:</span>
            </h5>
            <div className="space-y-1.5 text-xs">
              {order.items.map((it) => (
                <div key={it.id} className="flex justify-between text-slate-300">
                  <span>
                    {it.name} × {it.quantity}
                  </span>
                  <span className="font-mono tabular-nums text-white">
                    ৳{(getUnitPrice(it) * it.quantity).toLocaleString('bn-BD')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 mt-2 border-t border-slate-800 flex justify-between text-xs font-bold text-white">
              <span>সর্বমোট পরিশোধ:</span>
              <span className="text-amber-400 font-mono text-sm">
                ৳{order.total.toLocaleString('bn-BD')}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>রিসিট প্রিন্ট করুন</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>আরও শপিং করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
