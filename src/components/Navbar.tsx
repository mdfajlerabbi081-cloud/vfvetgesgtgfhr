'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, MessageCircle, Phone, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useShopSettings } from '../utils/shopSettings';

interface NavbarProps {
  onOpenCart?: () => void;
  onOpenAuth?: () => void;
}

export default function Navbar({ onOpenCart, onOpenAuth }: NavbarProps = {}) {
  const { cart } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const { settings, whatsappOrderUrl } = useShopSettings();
  const helplineNumber = settings.helpline;
  const whatsappLink = whatsappOrderUrl;
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userStr = localStorage.getItem('trendverse_user');
        if (userStr) {
          const parsed = JSON.parse(userStr);
          setIsLoggedIn(Boolean(parsed?.loggedIn));
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
    window.addEventListener('trendverse_auth_updated', checkAuth);
    return () => window.removeEventListener('trendverse_auth_updated', checkAuth);
  }, []);

  const handleCartClick = (e: React.MouseEvent) => {
    if (onOpenCart) {
      e.preventDefault();
      onOpenCart();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-amber-500/20">
      {/* Top Contact Bar */}
      <div className="bg-slate-900 border-b border-slate-800 text-xs px-4 sm:px-6 py-2.5 flex justify-between items-center text-slate-400">
        <a href={`tel:${helplineNumber}`} className="flex items-center gap-1.5 hover:text-amber-400 transition">
          <Phone className="w-3.5 h-3.5 text-amber-400" />
          <span>হেল্পলাইন: <strong className="text-white font-mono tabular-nums">{helplineNumber}</strong></span>
        </a>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-emerald-400 font-bold hover:underline"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-current" />
          <span>হোয়াটসঅ্যাপে অর্ডার করুন</span>
        </a>
      </div>

      {/* Main Header with Logo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo (Single-row clean brand lockup) */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-amber-400 shadow-lg shadow-amber-500/10 group-hover:scale-105 transition duration-300 bg-slate-900 shrink-0">
            <Image
              src="/logo.png"
              alt="TRENDVERSE Logo"
              fill
              sizes="44px"
              className="object-cover"
              priority
            />
          </div>
          <span className="text-xl font-black tracking-widest text-white uppercase whitespace-nowrap">
            TREND<span className="text-amber-400">VERSE</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
          <Link href="/" className="hover:text-amber-400 transition whitespace-nowrap">হোম</Link>
          <Link href="#products" className="hover:text-amber-400 transition whitespace-nowrap">কালেকশন</Link>
          <Link href="#about" className="hover:text-amber-400 transition whitespace-nowrap">আমাদের সম্পর্কে</Link>
          <Link href="#location" className="hover:text-amber-400 transition whitespace-nowrap">শপ লোকেশন</Link>
        </nav>

        {/* Actions: Auth & Cart */}
        <div className="flex items-center gap-2.5">
          {onOpenAuth && (
            <button
              type="button"
              onClick={onOpenAuth}
              className={`relative p-2.5 bg-slate-900 border rounded-full transition cursor-pointer active:scale-95 ${
                isLoggedIn
                  ? 'border-emerald-500/50 text-emerald-400 hover:border-emerald-400'
                  : 'border-slate-800 text-slate-200 hover:text-amber-400 hover:border-amber-500/40'
              }`}
              title={isLoggedIn ? 'কাস্টমার একাউন্ট (সক্রিয়)' : 'কাস্টমার সাইন-ইন / রেজিস্ট্রেশন'}
              aria-label="কাস্টমার একাউন্ট"
            >
              <User className="w-5 h-5" />
              {isLoggedIn && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950" />
              )}
            </button>
          )}

          <Link 
            href="#products" 
            onClick={handleCartClick}
            className="relative p-2.5 bg-slate-900 border border-slate-800 rounded-full text-slate-200 hover:text-amber-400 hover:border-amber-500/40 transition cursor-pointer active:scale-95"
            aria-label="শপিং কার্ট"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
