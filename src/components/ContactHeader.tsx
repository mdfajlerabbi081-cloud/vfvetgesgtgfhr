'use client';

import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';

export default function ContactHeader() {
  const phoneNumber = "01930045168";
  // আন্তর্জাতিক ফরম্যাটে 880 যোগ করে হোয়াটসঅ্যাপ লিঙ্ক তৈরি
  const whatsappLink = `https://wa.me/8801930045168?text=${encodeURIComponent('হ্যালো TRENDVERSE, আমি আপনার প্রোডাক্ট সম্পর্কে জানতে চাই।')}`;

  return (
    <div className="bg-slate-900 text-slate-200 py-2.5 px-4 sm:px-6 border-b border-slate-800 flex flex-wrap justify-between items-center text-xs sm:text-sm">
      {/* ফোন নাম্বার */}
      <div className="flex items-center gap-6">
        <a href={`tel:${phoneNumber}`} className="flex items-center gap-2 hover:text-emerald-400 transition font-medium">
          <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
          <span>কল করুন: <strong className="text-white font-mono">{phoneNumber}</strong></span>
        </a>
      </div>

      {/* হোয়াটসঅ্যাপ বোতাম */}
      <a 
        href={whatsappLink} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 sm:gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full transition shadow-md shadow-emerald-500/20 text-xs sm:text-sm"
      >
        <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
        <span>হোয়াটসঅ্যাপে মেসেজ দিন</span>
      </a>
    </div>
  );
}
