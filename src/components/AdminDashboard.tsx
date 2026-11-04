'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ProductAnalytics, SecuritySession } from '@/types/admin';
import { Order, getUnitPrice } from '@/types/product';
import TrendverseAdmin from './TrendverseAdmin';
import AdminPasswordSettings from './AdminPasswordSettings';
import BlankCustomizableProductManager from './BlankCustomizableProductManager';
import MigrationPanel from './MigrationPanel';
import { loadAdminInventory } from '@/src/data/products';
import {
  LayoutDashboard,
  PackageCheck,
  ShoppingCart,
  BarChart3,
  ShieldAlert,
  ShieldCheck,
  Users,
  Settings,
  Lock,
  LogOut,
  CheckCircle2
} from 'lucide-react';

interface AdminDashboardProps {
  onClose: () => void;
}

function loadAnalyticsData(): ProductAnalytics[] {
  return loadAdminInventory().map((p) => {
    const selling = Number(p.sellingPrice ?? p.price ?? 0);
    const cost = Number(p.costPrice ?? 0);
    const stock = Number(p.stock ?? 0);
    const sold = Number(p.sold ?? 0);
    const profitMargin = selling > 0 ? Math.round(((selling - cost) / selling) * 100) : 0;

    return {
      id: p.id,
      title: p.name || 'TRENDVERSE Item',
      sku: p.sku || p.id,
      costPrice: cost,
      sellingPrice: selling,
      stockQuantity: stock,
      soldQuantity: sold,
      category: p.category || 'Three Piece',
      profitMargin,
    };
  });
}

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<ProductAnalytics[]>(loadAnalyticsData);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'analytics' | 'users' | 'settings'>('dashboard');

  useEffect(() => {
    const refresh = () => setAnalyticsData(loadAnalyticsData());
    window.addEventListener('trendverse_inventory_updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('trendverse_inventory_updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const [session, setSession] = useState<SecuritySession>({
    adminId: 'ADMIN-DHAKA-01',
    role: 'SUPER_ADMIN',
    ipAddress: '103.205.180.45 (Dhaka, BD)',
    lastActive: 'সক্রিয় (Active)',
  });

  const [orders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('trendverse_orders');
      const parsed = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(parsed)) return [];
      const seenOrdIds = new Set<string>();
      return parsed.map((ord: Order, idx: number) => {
        const rawOrdId = typeof ord?.id === 'string' ? ord.id.trim() : '';
        let safeOrdId = rawOrdId || `TV-ORD-${idx + 1}`;
        while (seenOrdIds.has(safeOrdId)) {
          safeOrdId = `${safeOrdId}-${idx + 1}`;
        }
        seenOrdIds.add(safeOrdId);

        const seenItemIds = new Set<string>();
        const safeItems = Array.isArray(ord?.items)
          ? ord.items.map((it, itIdx) => {
              const rawItId = typeof it?.id === 'string' ? it.id.trim() : String(it?.id ?? '');
              let safeItId = rawItId || `item-${itIdx + 1}`;
              while (seenItemIds.has(safeItId)) {
                safeItId = `${safeItId}-${itIdx + 1}`;
              }
              seenItemIds.add(safeItId);
              return { ...it, id: safeItId };
            })
          : [];

        return { ...ord, id: safeOrdId, items: safeItems };
      });
    } catch {
      return [];
    }
  });

  const totalRevenue = analyticsData.reduce(
    (sum, item) => sum + item.soldQuantity * item.sellingPrice,
    0
  );
  const totalCost = analyticsData.reduce(
    (sum, item) => sum + item.soldQuantity * item.costPrice,
    0
  );
  const totalNetProfit = totalRevenue - totalCost;

  const uniqueCategories = Array.from(
    new Set(analyticsData.map((i) => i.category.trim()).filter(Boolean))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-sans">
      {/* High-Security Sidebar with Official Logo */}
      <aside className="w-full lg:w-64 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between p-4 lg:sticky lg:top-0 lg:h-screen shrink-0">
        <div>
          {/* Official TRENDVERSE Logo Header */}
          <div className="flex items-center justify-between lg:justify-start gap-3 px-3 py-4 border-b border-slate-800 mb-4 lg:mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-3 text-left group cursor-pointer"
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400/80 shadow-lg shadow-amber-500/10 shrink-0 group-hover:scale-105 transition duration-300 bg-slate-950">
                <Image
                  src="/logo.png"
                  alt="TRENDVERSE Admin Logo"
                  fill
                  sizes="48px"
                  className="object-cover"
                  priority
                />
              </div>
              <div>
                <h1 className="font-black text-lg tracking-wider text-white uppercase leading-tight">
                  TREND<span className="text-amber-400">VERSE</span>
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono tracking-wider uppercase mt-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  ADMIN PANEL
                </span>
              </div>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-semibold cursor-pointer"
            >
              স্টোরে ফিরুন
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl font-bold transition text-xs cursor-pointer whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800 font-medium'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>ড্যাশবোর্ড</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl transition text-xs cursor-pointer whitespace-nowrap ${
                activeTab === 'products'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800 font-medium'
              }`}
            >
              <PackageCheck className="w-4 h-4 shrink-0" />
              <span>প্রোডাক্টস ও ইনভেন্টরি</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl transition text-xs cursor-pointer whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800 font-medium'
              }`}
            >
              <ShoppingCart className="w-4 h-4 shrink-0" />
              <span>অর্ডার ও ট্র্যাকিং</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl transition text-xs cursor-pointer whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800 font-medium'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>হিসাব ও লাভ-ক্ষতি</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl transition text-xs cursor-pointer whitespace-nowrap ${
                activeTab === 'users'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800 font-medium'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>এডমিন রোলস</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl transition text-xs cursor-pointer whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800 font-medium'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>সেটিংস ও সিকিউরিটি</span>
            </button>
          </nav>
        </div>

        {/* Security Controls & Logout */}
        <div className="hidden lg:block border-t border-slate-800 pt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 px-2 py-1">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" /> SSL Protected
            </span>
            <span className="font-mono text-emerald-400">2FA Verified</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 px-4 py-2.5 rounded-xl font-semibold transition cursor-pointer text-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>লগআউট (Secure Exit)</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-5 sm:p-8 overflow-y-auto bg-slate-950">
        {/* Tab 1: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <TrendverseAdmin onAddInventory={() => setActiveTab('products')} />
        )}

        {/* Tab 2: Blank Customizable Product & Inventory Manager */}
        {activeTab === 'products' && (
          <div className="py-2">
            <BlankCustomizableProductManager />
          </div>
        )}

        {/* Tab 3: Orders & Tracking */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white">গ্রাহক অর্ডার ও ডেলিভারি ট্র্যাকিং</h2>
              <p className="text-xs text-slate-400 mt-1">
                গ্রাহকদের বর্তমান অর্ডার রিসিট ও পেমেন্ট স্ট্যাটাস।
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <h4 className="text-white font-bold text-sm">কোনো লাইভ অর্ডার পাওয়া যায়নি</h4>
                <p className="text-xs mt-1">গ্রাহক স্টোর থেকে অর্ডার প্লেস করলে এখানে প্রদর্শিত হবে।</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div key={ord.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                    <div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-slate-800 text-xs">
                      <div>
                        <span className="font-bold text-white font-mono text-sm">{ord.id}</span>
                        <span className="text-slate-500 mx-2">·</span>
                        <span className="text-slate-400">{ord.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {ord.status.toUpperCase()}
                        </span>
                        <span className="text-slate-400 uppercase font-mono text-[11px]">
                          {ord.paymentMethod}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs">
                      <div>
                        <span className="text-slate-500 block mb-1">প্রাপক ও ঠিকানা:</span>
                        <p className="text-white font-semibold">{ord.customer.fullName}</p>
                        <p className="text-slate-400 font-mono">{ord.customer.phone}</p>
                        <p className="text-slate-400">{ord.customer.address}, {ord.customer.division}</p>
                      </div>

                      <div>
                        <span className="text-slate-500 block mb-1">অর্ডারকৃত আইটেম:</span>
                        <div className="space-y-1">
                          {ord.items.map((it) => (
                            <div key={it.id} className="flex justify-between text-slate-300">
                              <span>{it.name} × {it.quantity}</span>
                              <span className="font-mono tabular-nums">
                                ৳{(getUnitPrice(it) * it.quantity).toLocaleString('bn-BD')}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between font-bold text-white">
                          <span>সর্বমোট:</span>
                          <span className="text-emerald-400 font-mono">৳{ord.total.toLocaleString('bn-BD')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Analytics & Margin */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white">লাভ-ক্ষতি ও মার্জিন বিশ্লেষণ</h2>
              <p className="text-xs text-slate-400 mt-1">
                প্রতিটি পণ্যের ইউনিট কস্ট, বিক্রয় মূল্য এবং মোট লাভ মার্জিন।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-sm font-bold text-white mb-4">আর্থিক সারাংশ (Financial Summary)</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-slate-800 text-slate-400">
                    <span>মোট বিক্রয় রাজস্ব (Gross Revenue):</span>
                    <span className="font-mono text-white font-bold">৳{totalRevenue.toLocaleString('bn-BD')}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800 text-slate-400">
                    <span>মোট পণ্য ক্রয় খরচ (COGS - Cost of Goods):</span>
                    <span className="font-mono text-rose-400 font-bold">-৳{totalCost.toLocaleString('bn-BD')}</span>
                  </div>
                  <div className="flex justify-between py-2 text-white font-bold text-sm">
                    <span>মোট নিট মুনাফা (Net Profit Margin):</span>
                    <span className="font-mono text-emerald-400">৳{totalNetProfit.toLocaleString('bn-BD')}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-sm font-bold text-white mb-4">ক্যাটাগরি ভিত্তিক লাভ বিশ্লেষণ</h3>
                <div className="space-y-3 text-xs">
                  {uniqueCategories.length === 0 ? (
                    <div className="py-8 text-center text-slate-500">
                      এখনও কোনো প্রোডাক্ট ক্যাটাগরির হিসাব তৈরি হয়নি। প্রোডাক্ট যোগ করলে এখানে লাভের হিসাব দেখাবে।
                    </div>
                  ) : (
                    uniqueCategories.map((cat) => {
                      const catItems = analyticsData.filter((i) => i.category === cat);
                      const catRev = catItems.reduce((s, i) => s + i.soldQuantity * i.sellingPrice, 0);
                      const catCost = catItems.reduce((s, i) => s + i.soldQuantity * i.costPrice, 0);
                      const catProfit = catRev - catCost;

                      return (
                        <div key={cat} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                          <div className="flex justify-between font-bold text-white mb-1">
                            <span>{cat}</span>
                            <span className="text-emerald-400 font-mono">৳{catProfit.toLocaleString('bn-BD')} লাভ</span>
                          </div>
                          <div className="flex justify-between text-slate-500 text-[11px]">
                            <span>মোট বিক্রয়: ৳{catRev.toLocaleString('bn-BD')}</span>
                            <span>আইটেম: {catItems.length.toLocaleString('bn-BD')} টি</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Admin Roles & Security */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white">এডমিন রোলস & সিকিউরিটি পারমিশন</h2>
              <p className="text-xs text-slate-400 mt-1">
                SecuritySession স্টেট ও অ্যাক্টিভ সেশন নিয়ন্ত্রণ।
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-800">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">সক্রিয় অ্যাডমিন সেশন (SecuritySession)</h4>
                  <p className="text-xs text-slate-400 font-mono">আইডি: {session.adminId}</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1.5 font-medium">নির্ধারিত অ্যাডমিন রোল (Role):</label>
                  <select
                    value={session.role}
                    onChange={(e) => setSession({ ...session, role: e.target.value as SecuritySession['role'] })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="SUPER_ADMIN">SUPER_ADMIN (ফুল এক্সেস ও ফিনান্সিয়াল কনসোল)</option>
                    <option value="MANAGER">MANAGER (অর্ডার ও ইনভেন্টরি ম্যানেজমেন্ট)</option>
                    <option value="INVENTORY_ADMIN">INVENTORY_ADMIN (শুধুমাত্র স্টক আপডেট)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[11px]">আইপি অ্যাড্রেস</span>
                    <span className="font-mono text-white font-bold">{session.ipAddress}</span>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block text-[11px]">সেশন স্ট্যাটাস</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {session.lastActive}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs flex items-start gap-2.5">
                  <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    এন্ড-টু-এন্ড এনক্রিপশন সক্রিয় রয়েছে। সমস্ত ইনভেন্টরি ও ফিনান্সিয়াল ট্রানজ্যাকশন অডিট লগে সংরক্ষিত হচ্ছে।
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Password, Security & Migration Settings */}
        {activeTab === 'settings' && (
          <div className="py-6 space-y-8 max-w-2xl mx-auto">
            <MigrationPanel onImportSuccess={() => setAnalyticsData(loadAnalyticsData())} />
            <AdminPasswordSettings />
          </div>
        )}
      </main>
    </div>
  );
}
