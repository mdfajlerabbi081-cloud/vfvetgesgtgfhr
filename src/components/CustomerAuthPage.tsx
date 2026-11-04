'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Phone, Lock, Eye, EyeOff, ArrowRight, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface CustomerAuthPageProps {
  onClose?: () => void;
  onSuccess?: (userData: { phone: string; isGoogle?: boolean }) => void;
}

export default function CustomerAuthPage({ onClose, onSuccess }: CustomerAuthPageProps = {}) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage(null);
    }, 3500);
  };

  const handleGoogleSignIn = () => {
    showNotification('Google/Gmail সাইন-ইন সফল হয়েছে!', 'success');
    const user = { phone: 'gmail_user@gmail.com', isGoogle: true };
    try {
      localStorage.setItem(
        'trendverse_user',
        JSON.stringify({ name: 'Google User', email: 'user@gmail.com', loggedIn: true })
      );
      window.dispatchEvent(new Event('trendverse_auth_updated'));
    } catch {}
    if (onSuccess) {
      setTimeout(() => onSuccess(user), 800);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedPhone = phone.replace(/[\s-]/g, '');
    if (!/^(?:\+8801|01)[3-9]\d{8}$/.test(cleanedPhone)) {
      showNotification('সঠিক বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।', 'error');
      return;
    }
    if (password.length < 6) {
      showNotification('পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।', 'error');
      return;
    }

    showNotification(`${isSignUp ? 'রেজিস্ট্রেশন' : 'লগইন'} সফল হয়েছে!`, 'success');
    try {
      localStorage.setItem(
        'trendverse_user',
        JSON.stringify({ phone: cleanedPhone, loggedIn: true })
      );
      window.dispatchEvent(new Event('trendverse_auth_updated'));
    } catch {}
    if (onSuccess) {
      setTimeout(() => onSuccess({ phone: cleanedPhone }), 800);
    }
  };

  const cardContent = (
    <div className="w-full max-w-md bg-slate-900 border border-amber-500/25 rounded-3xl p-8 shadow-2xl relative">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          aria-label="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Notification Banner */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Logo & Header */}
      <div className="text-center mb-7">
        <button
          type="button"
          onClick={() => onClose?.()}
          className="inline-block relative w-16 h-16 mb-3 rounded-full border-2 border-amber-400 overflow-hidden shadow-lg bg-slate-950 cursor-pointer"
        >
          <Image src="/logo.png" alt="TRENDVERSE Logo" fill sizes="64px" className="object-cover" priority />
        </button>
        <h2 className="text-2xl font-black tracking-wider text-white uppercase">
          TREND<span className="text-amber-400">VERSE</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {isSignUp ? 'নতুন কাস্টমার একাউন্ট তৈরি করুন' : 'আপনার একাউন্টে লগইন করুন'}
        </p>
      </div>

      {/* Google / Gmail Sign-In Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-xl border border-slate-700 transition mb-6 shadow-sm cursor-pointer active:scale-98 text-xs sm:text-sm"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Gmail দিয়ে সাইন-ইন করুন</span>
      </button>

      <div className="flex items-center my-5">
        <div className="flex-1 border-t border-slate-800" />
        <span className="px-3 text-xs text-slate-500 font-medium">অথবা মোবাইল নম্বর দিয়ে</span>
        <div className="flex-1 border-t border-slate-800" />
      </div>

      {/* Mobile Number & Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">মোবাইল নম্বর</label>
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
            <input
              type="tel"
              required
              placeholder="017XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400 transition font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">পাসওয়ার্ড</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="কমপক্ষে ৬ অক্ষর"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-3 text-sm text-white focus:outline-none focus:border-amber-400 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-3.5 rounded-xl transition shadow-lg shadow-amber-400/10 flex items-center justify-center gap-2 cursor-pointer active:scale-98 text-sm"
        >
          <span>{isSignUp ? 'সাইন-আপ করুন' : 'সাইন-ইন করুন'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center mt-6 text-xs text-slate-400">
        {isSignUp ? 'আগে থেকেই একাউন্ট আছে?' : 'নতুন কাস্টমার?'}{' '}
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-amber-400 font-bold hover:underline ml-1 cursor-pointer"
        >
          {isSignUp ? 'সাইন-ইন করুন' : 'নতুন একাউন্ট খুলুন'}
        </button>
      </div>
    </div>
  );

  if (onClose) {
    return cardContent;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative">
      {cardContent}
    </div>
  );
}
