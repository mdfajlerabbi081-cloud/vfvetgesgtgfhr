'use client';

import React, { useState } from 'react';
import { CheckCircle2, Copy } from 'lucide-react';
import { copyTextSafe } from '@/src/assets/brandAssets';

interface BkashCheckoutProps {
  totalAmount?: number;
  onSuccess?: (trxId: string) => void;
}

export default function BkashCheckout({ totalAmount = 1200, onSuccess }: BkashCheckoutProps) {
  const bkashNumber = "01759720739";
  const [trxId, setTrxId] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const copyBkashNumber = () => {
    copyTextSafe(bkashNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId.trim()) {
      setError('অনুগ্রহ করে বিকাশের Transaction ID দিন');
      return;
    }
    setError('');
    setIsSubmitted(true);
    if (onSuccess) {
      onSuccess(trxId.trim().toUpperCase());
    }
  };

  return (
    <div className="max-w-md mx-auto bg-slate-900 p-6 rounded-2xl border border-slate-800 text-slate-200 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-pink-500"></span>
          বিকাশ (bKash) পেমেন্ট
        </h2>
        <span className="text-xs bg-pink-500/10 text-pink-400 border border-pink-500/20 px-2.5 py-1 rounded-full font-mono font-bold">
          TRENDVERSE Payment
        </span>
      </div>

      {!isSubmitted ? (
        <form onSubmit={handlePaymentSubmit} className="space-y-5">
          {/* নির্দেশাবলী */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2 text-slate-300">
            <p className="font-semibold text-pink-400">পেমেন্ট করার নিয়মাবলী:</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>আপনার বিকাশ অ্যাপ থেকে <strong>Send Money</strong> বা <strong>Cash In</strong> করুন।</li>
              <li>প্রদেয় মোট টাকার পরিমাণ: <strong className="text-emerald-400 text-sm font-mono">৳{totalAmount.toLocaleString('bn-BD')}</strong></li>
              <li>নিচের বিকাশ নাম্বারে টাকা পাঠান:</li>
            </ol>

            {/* বিকাশ নম্বর কপি বক্স */}
            <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-pink-500/30 mt-2">
              <span className="font-mono text-base font-bold text-white tracking-wider">{bkashNumber}</span>
              <button 
                type="button" 
                onClick={copyBkashNumber}
                className="text-xs bg-pink-500 text-white px-3 py-1 rounded-md font-medium hover:bg-pink-600 transition flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <Copy className="w-3 h-3" />
                {copied ? 'কপি হয়েছে!' : 'কপি করুন'}
              </button>
            </div>
          </div>

          {/* TrxID ইনপুট */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              বিকাশ ট্রানজেকশন আইডি (bKash TrxID)
            </label>
            <input
              type="text"
              required
              value={trxId}
              onChange={(e) => {
                setTrxId(e.target.value.toUpperCase());
                if (error) setError('');
              }}
              placeholder="যেমন: 8N7A6W5X9Z"
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:border-pink-500 transition uppercase tracking-wider"
            />
            {error && <p className="text-rose-400 text-[11px] mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-pink-600/20 cursor-pointer active:scale-98 text-sm"
          >
            পেমেন্ট নিশ্চিত করুন (৳{totalAmount.toLocaleString('bn-BD')})
          </button>
        </form>
      ) : (
        <div className="text-center py-6 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">পেমেন্ট তথ্য গৃহিত হয়েছে!</h3>
          <p className="text-xs text-slate-400">
            আপনার বিকাশ TrxID: <span className="font-mono text-pink-400 font-bold">{trxId}</span>
          </p>
          <p className="text-xs text-slate-400">আমাদের প্রতিনিধি ভেরিফাই করে শীঘ্রই আপনার অর্ডার প্রসেস করবেন।</p>
        </div>
      )}
    </div>
  );
}
