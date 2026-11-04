'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBag,
  ShoppingCart,
  Phone,
  MessageCircle,
  Sparkles,
  Copy,
  CheckCircle2,
  Trash2,
  MapPin,
  Inbox,
} from 'lucide-react';
import { copyTextSafe } from '@/src/assets/brandAssets';
import { loadSyncedInventory, inferProductGender } from '@/src/data/products';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  image: string;
  gender: 'Men' | 'Women' | 'Unisex';
}

interface CartItem extends Product {
  quantity: number;
}

function mapStorefrontProducts(): Product[] {
  return loadSyncedInventory().map((p) => ({
    id: p.id,
    sku: p.sku || p.id,
    name: p.name,
    category: p.category,
    price: Number(p.sellingPrice ?? p.price ?? 0),
    image: p.image,
    gender: inferProductGender(p),
  }));
}

export default function TrendverseEcommerceApp() {
  const [products, setProducts] = useState<Product[]>(mapStorefrontProducts);

  useEffect(() => {
    const sync = () => {
      setProducts(mapStorefrontProducts());
    };
    window.addEventListener('trendverse_inventory_updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('trendverse_inventory_updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Women' | 'Men'>('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [trxId, setTrxId] = useState('');
  const [formError, setFormError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false);

  const bkashNumber = '01759720739';
  const helplineNumber = '01930045168';
  const whatsappLink = `https://wa.me/8801930045168?text=${encodeURIComponent(
    'হ্যালো TRENDVERSE, আমি থ্রি-পিস/মেয়েদের কালেকশন দেখতে চাই।'
  )}`;

  const filteredProducts =
    selectedFilter === 'All'
      ? products
      : products.filter((p) => p.gender === selectedFilter || p.gender === 'Unisex');

  const addToCart = (product: Product) => {
    setIsOrderSubmitted(false);
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const copyBkashNumber = () => {
    copyTextSafe(bkashNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setFormError('আপনার কার্ট খালি!');
      return;
    }
    if (!trxId.trim()) {
      setFormError('অনুগ্রহ করে বিকাশের Transaction ID দিন');
      return;
    }
    setFormError('');
    setIsOrderSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* ১. শীর্ষ কন্টাক্ট বার */}
      <div className="bg-slate-900 border-b border-slate-800 text-xs px-6 py-2.5 flex justify-between items-center text-slate-400">
        <a
          href={`tel:${helplineNumber}`}
          className="flex items-center gap-1.5 hover:text-amber-400 transition"
        >
          <Phone className="w-3.5 h-3.5 text-amber-400" />
          <span>
            হেল্পলাইন: <strong className="text-white font-mono">{helplineNumber}</strong>
          </span>
        </a>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-emerald-400 font-bold hover:underline"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-current" />
          <span>হোয়াটসঅ্যাপে চ্যাট করুন</span>
        </a>
      </div>

      {/* ২. হেডার নেভিগেশন ও লোগো */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-amber-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400/80 shadow-lg shadow-amber-500/10">
              <Image
                src="/logo.png"
                alt="TRENDVERSE Logo"
                fill
                sizes="48px"
                className="object-cover"
                priority
              />
            </div>
            <span className="text-xl font-black tracking-widest text-white uppercase whitespace-nowrap shrink-0">
              TREND<span className="text-amber-400">VERSE</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="relative p-2.5 bg-slate-900 border border-slate-800 rounded-full text-slate-200 hover:text-amber-400 transition cursor-pointer"
          >
            <ShoppingCart className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center tabular-nums">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ৩. ফিল্টারিং ট্যাব (মেয়েদের থ্রি-পিস ও ছেলেদের কালেকশন সুইচার) */}
      <section className="pt-10 pb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 mb-4">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>নতুন উইমেন্স থ্রি-পিস কালেকশন যুক্ত হয়েছে</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-6">
          TRENDVERSE <span className="text-amber-400">Collection</span>
        </h1>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setSelectedFilter('All')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
              selectedFilter === 'All'
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/10'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            সব কালেকশন
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('Women')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
              selectedFilter === 'Women'
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/10'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            মহিলাদের কালেকশন (থ্রি-পিস)
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('Men')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
              selectedFilter === 'Men'
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/10'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            পুরুষদের কালেকশন
          </button>
        </div>
      </section>

      {/* ৪. প্রোডাক্ট গ্রিড display */}
      <section id="products" className="py-10 bg-slate-900/40 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 space-y-4">
              <Inbox className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-300">বর্তমানে কোনো প্রোডাক্ট নেই</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  এডমিন ড্যাশবোর্ড থেকে নতুন প্রোডাক্ট যুক্ত করার পর এখানে স্বয়ংক্রিয়ভাবে দেখাবে।
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-amber-500/40 transition"
                >
                  <div className="relative aspect-[4/5] w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 text-slate-600 p-6 text-center">
                        <ShoppingBag className="w-10 h-10 text-slate-700" />
                        <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500">
                          {product.sku || 'TRENDVERSE'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                        {product.category}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1 line-clamp-1">{product.name}</h3>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
                      <span className="text-xl font-black text-amber-400 font-mono tabular-nums">
                        ৳{product.price.toLocaleString('bn-BD')}
                      </span>
                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        অর্ডার করুন
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ৫. কার্ট ও পেমেন্ট স্লাইডবার */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-slate-900 h-full p-6 overflow-y-auto border-l border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
                <h3 className="text-lg font-bold text-white uppercase">আপনার শপিং কার্ট</h3>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="text-slate-500 text-center py-8 text-sm">
                  আপনার কার্ট খালি রয়েছে!
                </p>
              ) : (
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-white">{item.name}</h4>
                        <p className="text-xs text-amber-400 font-mono tabular-nums">
                          ৳{item.price} x {item.quantity}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-rose-400 hover:text-rose-300 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-slate-800">
                    <span>মোট টাকা:</span>
                    <span className="text-amber-400 font-mono tabular-nums">
                      ৳{totalAmount.toLocaleString('bn-BD')}
                    </span>
                  </div>
                </div>
              )}

              {cart.length > 0 && !isOrderSubmitted && (
                <form
                  onSubmit={handleCheckoutSubmit}
                  className="bg-slate-950 p-4 rounded-2xl border border-pink-500/30 space-y-4 mt-6"
                >
                  <h4 className="text-sm font-bold text-pink-400">
                    বিকাশ (bKash) পেমেন্ট অপশন
                  </h4>
                  <div className="text-xs text-slate-400 space-y-1">
                    <p>
                      ১. বিকাশ থেকে <strong>Send Money</strong> করুন:{' '}
                      <strong className="text-emerald-400 font-mono tabular-nums">
                        ৳{totalAmount.toLocaleString('bn-BD')}
                      </strong>
                    </p>
                    <div className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800 mt-2">
                      <span className="font-mono text-white font-bold">{bkashNumber}</span>
                      <button
                        type="button"
                        onClick={copyBkashNumber}
                        className="text-[10px] bg-pink-500 text-white px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copied ? 'কপি হয়েছে!' : 'কপি করুন'}</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      বিকাশ TrxID দিন
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 8N7A6W5X9Z"
                      value={trxId}
                      onChange={(e) => {
                        setTrxId(e.target.value.toUpperCase());
                        if (formError) setFormError('');
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 font-mono uppercase"
                    />
                    {formError && (
                      <p className="text-[11px] text-rose-400 mt-1">{formError}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer"
                  >
                    অর্ডার কনফার্ম করুন (৳{totalAmount.toLocaleString('bn-BD')})
                  </button>
                </form>
              )}

              {isOrderSubmitted && (
                <div className="text-center py-6 space-y-2 bg-slate-950 p-4 rounded-2xl border border-emerald-500/30">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-base font-bold text-white">অর্ডার সফল হয়েছে!</h4>
                  <p className="text-xs text-slate-400">
                    TrxID: <span className="font-mono text-pink-400 font-bold">{trxId}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ৬. লোকেশন সহ ফুটার */}
      <footer className="bg-slate-950 border-t border-slate-900 py-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-2 text-center md:text-left">
            <p className="font-black text-white uppercase text-base tracking-widest">
              TREND<span className="text-amber-400">VERSE</span>
            </p>
            <div className="flex items-center justify-center md:justify-start gap-1.5 text-slate-400">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>দক্ষিণ মনিপুর, মিরপুর-২, ঢাকা-১২১৬</span>
            </div>
          </div>
          <p className="text-center md:text-right text-slate-500">
            সর্বস্বত্ব সংরক্ষিত &copy; ২০২৬ TRENDVERSE
          </p>
        </div>
      </footer>
    </div>
  );
}
