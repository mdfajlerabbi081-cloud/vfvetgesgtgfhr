import React from 'react';
import { ShoppingBag, Search, Clock, PhoneCall } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenOrders: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenOrders,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 transition-all">
      {/* Top announcement bar */}
      <div className="bg-stone-900 text-stone-200 text-xs py-1.5 px-4 text-center">
        <span className="font-medium text-rose-400">অফার:</span> ৩,০০০ টাকার বেশি অর্ডারে সারা বাংলাদেশে ফ্রি ডেলিভারি! | হটলাইন: ০১৭১০-০০০০০০
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-18">
          {/* Zone 1: Brand title wordmark */}
          <a
            href="#"
            className="text-2xl font-bold tracking-tight text-stone-900 whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
          >
            আমার <span className="text-rose-600">শপ</span>
          </a>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
            <a
              href="#"
              className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0"
            >
              হোম
            </a>
            <a
              href="#products"
              className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0"
            >
              প্রোডাক্টস
            </a>
            <a
              href="#offers"
              className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0"
            >
              অফার
            </a>
            <a
              href="#features"
              className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0"
            >
              সুবিধাসমূহ
            </a>
            <a
              href="#contact"
              className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0"
            >
              যোগাযোগ
            </a>
          </nav>

          {/* Zone 3: Actions & Shopping Bag */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Search Input inline */}
            <div className="relative hidden sm:block w-48 lg:w-60">
              <input
                type="text"
                placeholder="প্রোডাক্ট খুঁজুন..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-100 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 focus:bg-white transition-all text-stone-900 placeholder:text-stone-400"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Order History button */}
            <button
              onClick={onOpenOrders}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors whitespace-nowrap"
              title="পূর্ববর্তী অর্ডার ট্র্যাকিং"
            >
              <Clock className="w-4 h-4 text-stone-500" />
              <span>অর্ডার হিস্ট্রি</span>
            </button>

            {/* Shopping Cart button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer text-xs font-semibold whitespace-nowrap shadow-sm active:scale-95"
              aria-label="কার্ট দেখুন"
            >
              <ShoppingBag className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">কার্ট</span>
              <span
                id="cart-count"
                className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-rose-600 rounded-full min-w-5 tabular-nums"
              >
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar below header */}
        <div className="sm:hidden pb-3">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="পণ্য বা মডেল সার্চ করুন..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-stone-100 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500 focus:bg-white text-stone-900 placeholder:text-stone-400"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>
    </header>
  );
};
