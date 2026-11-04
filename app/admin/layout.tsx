'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  LayoutDashboard,
  PackageCheck,
  ShoppingCart,
  Settings,
  Lock,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { checkAdminAuth, revokeAdminAuth } from '@/src/utils/adminAuth';

export default function StrictAdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isLoginRoute = pathname === '/admin/login' || pathname === '/admin-login';

  useEffect(() => {
    // লগইন পেজে থাকলে ভেরিফিকেশন স্কিপ করবে
    if (isLoginRoute) {
      setCheckingAuth(false);
      return;
    }

    // প্রতিবার পেজে ঢোকার সময় সেশন চেক করা
    if (checkAdminAuth()) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      router.push('/admin/login');
    }
    setCheckingAuth(false);
  }, [pathname, router, isLoginRoute]);

  const handleLogout = () => {
    revokeAdminAuth();
    fetch('/api/admin/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    setIsAuthenticated(false);
    router.push('/admin/login');
  };

  if (isLoginRoute) {
    return <>{children}</>;
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-amber-400 text-xs font-mono space-y-3">
        <ShieldAlert className="w-8 h-8 animate-pulse text-amber-400" />
        <span>এডমিন সিকিউরিটি ও পাসওয়ার্ড ভেরিফাই করা হচ্ছে...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    {
      href: '/admin',
      label: 'কন্ট্রোল ড্যাশবোর্ড',
      icon: LayoutDashboard,
      active: pathname === '/admin',
    },
    {
      href: '/admin/products',
      label: 'ইনভেন্টরি ও প্রোডাক্ট',
      icon: PackageCheck,
      active: pathname === '/admin/products',
    },
    {
      href: '/admin/orders',
      label: 'অর্ডার ম্যানেজমেন্ট',
      icon: ShoppingCart,
      active: pathname === '/admin/orders',
    },
    {
      href: '/admin/settings',
      label: 'সেটিংস',
      icon: Settings,
      active: pathname === '/admin/settings',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-sans">
      {/* সুরক্ষিত সাইডবার */}
      <aside className="w-full lg:w-64 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between p-4 lg:sticky lg:top-0 lg:h-screen shrink-0">
        <div>
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-4 border-b border-slate-800 mb-4 lg:mb-6 group"
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400/80 shadow-lg shadow-amber-500/10 shrink-0 bg-slate-950">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                sizes="48px"
                className="object-cover"
                priority
              />
            </div>
            <div>
              <h1 className="font-black text-lg tracking-wider text-white uppercase leading-none">
                TREND<span className="text-amber-400">VERSE</span>
              </h1>
              <span className="text-[10px] bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded-md font-mono font-bold mt-1.5 inline-block">
                SECURE ADMIN
              </span>
            </div>
          </Link>

          <nav className="flex lg:flex-col gap-1.5 text-xs overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition whitespace-nowrap ${
                    item.active
                      ? 'bg-amber-400 text-slate-950 font-extrabold shadow-lg shadow-amber-400/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800 font-medium'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-4 mt-4 lg:mt-0 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400 shrink-0" /> সুরক্ষিত সেশন
            </span>
            <span className="font-mono text-emerald-400 font-bold">ভেরিফাইড</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 px-4 py-2.5 rounded-xl font-semibold transition text-xs cursor-pointer whitespace-nowrap"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>লগআউট করুন</span>
          </button>
        </div>
      </aside>

      {/* মূল অ্যাডমিন কনটেন্ট */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto bg-slate-950">{children}</main>
    </div>
  );
}
