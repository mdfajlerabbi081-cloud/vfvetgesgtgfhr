'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  KeyRound,
  Phone,
  Truck,
  Save,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  ShopSettings,
  DEFAULT_SHOP_SETTINGS,
  loadShopSettings,
  saveShopSettings,
} from '@/src/utils/shopSettings';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SHOP_SETTINGS);
  const [savedMessage, setSavedMessage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setSettings(loadShopSettings());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveShopSettings(settings);
    setSettings(updated);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6 font-sans text-slate-100">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-amber-400 shrink-0" />
          অ্যাডমিন ও শপ সেটিংস
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          আপনার পাসওয়ার্ড, বিকাশ নম্বর, হেল্পলাইন এবং ডেলিভারি চার্জ নিজের মতো কাস্টমাইজ করুন
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl"
      >
        {/* নম্বর ও পেমেন্ট সেটিংস */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" /> অফিশিয়াল হেল্পলাইন নম্বর
            </label>
            <input
              type="text"
              value={settings.helpline}
              onChange={(e) => setSettings({ ...settings, helpline: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-pink-400 shrink-0" /> বিকাশ পেমেন্ট নম্বর
              (পার্সোনাল/মার্চেন্ট)
            </label>
            <input
              type="text"
              value={settings.bkashNumber}
              onChange={(e) => setSettings({ ...settings, bkashNumber: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
              required
            />
          </div>
        </div>

        {/* ডেলিভারি চার্জ কন্ট্রোল */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> ঢাকার ভেতরে ডেলিভারি চার্জ
              (৳)
            </label>
            <input
              type="number"
              min="0"
              value={settings.insideDhakaFee}
              onChange={(e) =>
                setSettings({ ...settings, insideDhakaFee: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono tabular-nums focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-blue-400 shrink-0" /> ঢাকার বাইরে ডেলিভারি চার্জ
              (৳)
            </label>
            <input
              type="number"
              min="0"
              value={settings.outsideDhakaFee}
              onChange={(e) =>
                setSettings({ ...settings, outsideDhakaFee: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white font-mono tabular-nums focus:outline-none focus:border-amber-400"
              required
            />
          </div>
        </div>

        {/* সিকিউরিটি পাসওয়ার্ড পরিবর্তন */}
        <div className="pt-2 border-t border-slate-800">
          <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" /> অ্যাডমিন লগইন পাসওয়ার্ড
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={settings.adminPassword}
              onChange={(e) =>
                setSettings({ ...settings, adminPassword: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-11 py-3 text-sm text-amber-300 font-mono focus:outline-none focus:border-amber-400"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 p-1 cursor-pointer"
              aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            সতর্কতা: পাসওয়ার্ড পরিবর্তন করলে পরবর্তী লগইনের সময় নতুন পাসওয়ার্ড ব্যবহার করতে হবে।
          </p>
        </div>

        {savedMessage && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> আপনার সকল সেটিংস সফলভাবে সংরক্ষিত হয়েছে!
          </div>
        )}

        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-6 py-3.5 rounded-xl transition shadow-lg shadow-amber-400/10 text-sm cursor-pointer"
        >
          <Save className="w-4 h-4 shrink-0" /> সেটিংস সেভ করুন
        </button>
      </form>
    </div>
  );
}
