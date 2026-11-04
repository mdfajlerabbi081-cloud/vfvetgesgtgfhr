'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, KeyRound, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import {
  DEFAULT_ADMIN_PASSWORD,
  grantAdminAuth,
  revokeAdminAuth,
  verifyAdminPasswordInput,
} from '@/src/utils/adminAuth';

interface StrictAdminLoginPageProps {
  onClose?: () => void;
  onLoginSuccess?: () => void;
}

export default function StrictAdminLoginPage({
  onClose,
  onLoginSuccess,
}: StrictAdminLoginPageProps = {}) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  // অ্যাডমিন সেটিংস বা ডিফল্ট পাসওয়ার্ড
  const DEFAULT_PASSWORD = DEFAULT_ADMIN_PASSWORD;

  // লগইন পেজে প্রবেশের সাথে সাথে পূর্ববর্তী যেকোনো সেশন ক্লিয়ার করা
  useEffect(() => {
    revokeAdminAuth();
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // সেটিংস থেকে কাস্টম পাসওয়ার্ড থাকলে সেটি নেওয়া, না থাকলে ডিফল্ট পাসওয়ার্ড
    let targetPassword = DEFAULT_PASSWORD;
    try {
      const savedSettings = localStorage.getItem('trendverse_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed && parsed.adminPassword) {
          targetPassword = String(parsed.adminPassword);
        }
      }
    } catch (err) {
      console.error('Settings parse error', err);
    }

    if (password === targetPassword || verifyAdminPasswordInput(password)) {
      // স্থায়ী লোকাল স্টোরেজের বদলে sessionStorage ব্যবহার যাতে রিফ্রেশ বা নতুন ট্যাবে প্রতিবারই পাসওয়ার্ড লাগে
      grantAdminAuth();

      fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: password.trim(),
          clientVerified: true,
        }),
      }).catch(() => {});

      if (onLoginSuccess) {
        onLoginSuccess();
      }
      router.push('/admin');
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-amber-400 selection:text-slate-950">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
        {/* লোগো ও হেডার */}
        <div className="text-center space-y-3">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400 mx-auto shadow-lg shadow-amber-500/10 bg-slate-950">
            <Image
              src="/logo.png"
              alt="TRENDVERSE Logo"
              fill
              sizes="64px"
              className="object-cover"
              priority
            />
          </div>
          <h1 className="text-xl font-black text-white uppercase tracking-wider">
            TREND<span className="text-amber-400">VERSE</span> সিকিউর এডমিন
          </h1>
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>প্রতিবার প্রবেশের জন্য ভেরিফিকেশন বাধ্যতামূলক</span>
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>ভুল পাসওয়ার্ড! সঠিক এডমিন পাসওয়ার্ড দিয়ে ভেরিফাই করুন।</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              এডমিন ভেরিফিকেশন পাসওয়ার্ড দিন
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="পাসওয়ার্ড লিখুন..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-11 py-3 text-sm text-white focus:outline-none focus:border-amber-400 font-mono transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-amber-400 transition cursor-pointer"
                aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold py-3.5 rounded-xl transition shadow-lg shadow-amber-400/10 text-xs flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Lock className="w-4 h-4" />
            <span>পাসওয়ার্ড ভেরিফাই করে ঢুকুন</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <Link
            href="/"
            onClick={() => {
              if (onClose) onClose();
            }}
            className="text-xs text-slate-500 hover:text-amber-400 transition"
          >
            &larr; মূল ওয়েবসাইটে ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
}
