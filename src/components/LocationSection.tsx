'use client';

import React from 'react';
import { MapPin, Phone, MessageCircle } from 'lucide-react';
import { useShopSettings } from '../utils/shopSettings';

export default function LocationSection() {
  const { settings } = useShopSettings();
  const digitsOnly = settings.helpline.replace(/\D/g, '');
  const intlHelpline = digitsOnly.startsWith('88')
    ? digitsOnly
    : `88${digitsOnly || '01930045168'}`;
  const whatsappLink = `https://wa.me/${intlHelpline}?text=${encodeURIComponent(
    'হ্যালো TRENDVERSE, আমি আপনাদের লোকেশন ও শপ সম্পর্কে জানতে চাই।'
  )}`;

  return (
    <section
      id="location"
      className="bg-slate-900 border-t border-slate-800 py-12 px-4 sm:px-6 lg:px-8 text-slate-100"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {/* Brand & Address */}
        <div className="space-y-3">
          <h3 className="text-xl font-black tracking-widest text-white uppercase">
            TREND<span className="text-amber-400">VERSE</span>
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            স্টাইল, কোয়ালিটি এবং আস্থার প্রতীক। আপনার পছন্দের প্রিমিয়াম ফ্যাশন কালেকশন এখন হাতের নাগালে।
          </p>
          <div className="flex items-start gap-2.5 text-xs text-slate-300 pt-2">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">অফিস ও শপ লোকেশন:</span>
              <span>দক্ষিণ মনিপুর, মিরপুর-২, ঢাকা-১২১৬</span>
            </div>
          </div>
        </div>

        {/* Helpline & Payment Contact */}
        <div className="space-y-3 bg-slate-950/70 border border-slate-800 rounded-2xl p-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
            হেল্পলাইন ও পেমেন্ট নাম্বার
          </h4>
          <div className="space-y-2.5 text-xs">
            <a
              href={`tel:${settings.helpline}`}
              className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition"
            >
              <span className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>কাস্টমার হেল্পলাইন:</span>
              </span>
              <strong className="font-mono text-white tracking-wider tabular-nums">
                {settings.helpline}
              </strong>
            </a>

            <a
              href={`tel:${settings.bkashNumber}`}
              className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-pink-500/40 transition"
            >
              <span className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shrink-0" />
                <span>বিকাশ (bKash পেমেন্ট):</span>
              </span>
              <strong className="font-mono text-pink-400 tracking-wider tabular-nums">
                {settings.bkashNumber}
              </strong>
            </a>
          </div>
        </div>

        {/* WhatsApp Direct CTA */}
        <div className="flex flex-col md:items-end justify-center space-y-3">
          <p className="text-xs text-slate-400 md:text-right">
            লোকেশন, ডেলিভারি বা অর্ডারের যেকোনো তথ্যের জন্য সরাসরি মেসেজ করুন:
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition w-full sm:w-auto"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>হোয়াটসঅ্যাপে যোগাযোগ করুন</span>
          </a>
        </div>
      </div>
    </section>
  );
}
