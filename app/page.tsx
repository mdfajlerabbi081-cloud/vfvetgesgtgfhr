'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Truck,
  ShieldCheck,
  RefreshCw,
  Headphones,
  Inbox,
  MapPin,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import LocationSection from '@/components/LocationSection';
import { CartDrawer } from '@/src/components/CartDrawer';
import { CheckoutModal } from '@/src/components/CheckoutModal';
import { OrderSuccessModal } from '@/src/components/OrderSuccessModal';
import { ProductDetailModal } from '@/src/components/ProductDetailModal';
import { useCart } from '@/src/context/CartContext';
import { Product, Order, getUnitPrice } from '@/types/product';
import {
  BANGLADESH_DIVISIONS,
  loadAdminInventory,
  saveAdminInventory,
  loadSyncedInventory,
  inferProductGender,
} from '@/src/data/products';
import { useShopSettings } from '@/src/utils/shopSettings';

export default function DynamicHomePage() {
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount } = useCart();
  const { settings, insideDhakaFeeNum } = useShopSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Women' | 'Men'>('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  // অ্যাডমিন প্যানেলে ইনপুট করা প্রোডাক্ট লোকাল স্টোরেজ থেকে লোড করা (ডিফল্ট খালি, কোনো প্রিসেট ছবি নেই)
  useEffect(() => {
    const sync = () => {
      setProducts(loadSyncedInventory());
    };
    sync();
    window.addEventListener('trendverse_inventory_updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('trendverse_inventory_updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const filteredProducts =
    selectedFilter === 'All'
      ? products
      : products.filter((p) => {
          const g = p.gender || inferProductGender(p);
          return (
            g === selectedFilter ||
            g === 'Unisex' ||
            p.category.toLowerCase().includes(selectedFilter.toLowerCase())
          );
        });

  const discountAmount = appliedCoupon
    ? appliedCoupon === 'SHOP50'
      ? 50
      : appliedCoupon === 'EID2026'
      ? Math.round(totalAmount * 0.15)
      : Math.round(totalAmount * 0.1)
    : 0;

  const handleApplyCoupon = (code: string): boolean => {
    const valid = ['TREND10', 'AMAR10', 'SHOP50', 'EID2026'];
    if (valid.includes(code)) {
      setAppliedCoupon(code);
      return true;
    }
    return false;
  };

  const decrementInventoryForOrder = (orderItems: Order['items']) => {
    try {
      const currentAdminItems = loadAdminInventory();
      if (currentAdminItems.length > 0) {
        let didChange = false;
        const updatedInv = currentAdminItems.map((prod) => {
          const orderedItem = orderItems.find(
            (it) =>
              (it.id && String(it.id) === String(prod.id)) ||
              (it.sku && prod.sku && it.sku === prod.sku)
          );
          if (!orderedItem) return prod;
          didChange = true;
          return {
            ...prod,
            stock: Math.max(0, Number(prod.stock ?? 0) - orderedItem.quantity),
            sold: Number(prod.sold ?? 0) + orderedItem.quantity,
          };
        });
        if (didChange) {
          saveAdminInventory(updatedInv);
        }
      }
    } catch {}
  };

  const persistOrder = (order: Order) => {
    try {
      const saved = localStorage.getItem('trendverse_orders');
      const parsed = saved ? JSON.parse(saved) : [];
      const next = Array.isArray(parsed) ? [order, ...parsed] : [order];
      localStorage.setItem('trendverse_orders', JSON.stringify(next));
      window.dispatchEvent(new Event('trendverse_orders_updated'));
    } catch {}
  };

  const handleQuickBkashOrder = (trxId: string, paidTotal: number) => {
    const subtotal = cart.reduce((sum, item) => sum + getUnitPrice(item) * item.quantity, 0);
    const deliveryFee = subtotal >= 3000 || subtotal === 0 ? 0 : insideDhakaFeeNum;
    const orderId = `TV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const formattedDate = new Date().toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const newOrder: Order = {
      id: orderId,
      orderNumber: orderId,
      date: formattedDate,
      createdAt: formattedDate,
      items: cart.map((item) => ({
        ...item,
        price: getUnitPrice(item),
      })),
      customer: {
        fullName: 'বিকাশ এক্সপ্রেস কাস্টমার',
        phone: `${settings.bkashNumber} (TrxID: ${trxId})`,
        division: BANGLADESH_DIVISIONS[0],
        address: 'বিকাশ পেমেন্ট ভেরিফিকেশন সাপেক্ষে ডেলিভারি',
        notes: `bKash TrxID: ${trxId}`,
      },
      customerName: 'বিকাশ এক্সপ্রেস কাস্টমার',
      customerPhone: `${settings.bkashNumber} (TrxID: ${trxId})`,
      deliveryAddress: `বিকাশ পেমেন্ট ভেরিফিকেশন সাপেক্ষে ডেলিভারি, ${BANGLADESH_DIVISIONS[0]}`,
      subtotal,
      deliveryFee,
      discount: discountAmount,
      total: paidTotal,
      totalAmount: paidTotal,
      paymentMethod: 'bKash',
      paymentStatus: 'paid',
      trxId,
      status: 'Pending',
    };
    persistOrder(newOrder);
    decrementInventoryForOrder(newOrder.items);
    clearCart();
    setAppliedCoupon(null);
  };

  const handleOrderComplete = (order: Order) => {
    persistOrder(order);
    decrementInventoryForOrder(order.items);
    clearCart();
    setAppliedCoupon(null);
    setIsCheckoutOpen(false);
    setLastPlacedOrder(order);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* ১ ও ২. শীর্ষ কন্টাক্ট বার ও মেইন হেডার */}
      <Navbar onOpenCart={() => setIsCartOpen(true)} />

      {/* ৩. কালেকশন ফিল্টার সেকশন (কোনো প্রিসেট ব্যানার ছবি নেই) */}
      <section className="py-12 px-4 sm:px-6 text-center max-w-4xl mx-auto space-y-5">
        <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>অরিজিনাল প্রিমিয়াম কালেকশন</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          TREND<span className="text-amber-400">VERSE</span> COLLECTION
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          দক্ষিণ মনিপুর, মিরপুর-২, ঢাকা থেকে সরাসরি সেরা মানের থ্রি-পিস ও মেনস ফ্যাশন কালেকশন। বিকাশ ও ক্যাশ অন ডেলিভারি সুবিধা সারা বাংলাদেশে।
        </p>

        {/* ফিল্টার বাটনসমূহ */}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setSelectedFilter('All')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
              selectedFilter === 'All'
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/10'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-amber-500/40'
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
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-amber-500/40'
            }`}
          >
            উইমেন্স কালেকশন (থ্রি-পিস)
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('Men')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
              selectedFilter === 'Men'
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/10'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-amber-500/40'
            }`}
          >
            মেনস কালেকশন
          </button>
        </div>
      </section>

      {/* ৪. ডাইনামিক প্রোডাক্ট ডিসপ্লে (কোনো প্রিসেট ছবি থাকবে না) */}
      <section id="products" className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 space-y-4 px-4">
            <Inbox className="w-12 h-12 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-200">বর্তমানে কোনো প্রোডাক্ট নেই</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                এডমিন ড্যাশবোর্ড থেকে নতুন প্রোডাক্ট যুক্ত করার পর এখানে স্বয়ংক্রিয়ভাবে দেখাবে।
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
                onOrderClick={() => setIsCartOpen(true)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ৫. সার্ভিস নিশ্চয়তা */}
      <section id="about" className="py-14 border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Truck, title: 'দ্রুত ডেলিভারি', desc: 'ঢাকায় ২৪-৪৮ ঘণ্টায় হোম ডেলিভারি' },
            { icon: ShieldCheck, title: '১০০% অরিজিনাল', desc: 'প্রিমিয়াম কোয়ালিটি ফেব্রিক ও ফিনিশিং' },
            { icon: RefreshCw, title: 'সহজ এক্সচেঞ্জ', desc: '৭ দিনের সাইজ এক্সচেঞ্জ সুবিধা' },
            { icon: Headphones, title: 'সরাসরি হেল্পলাইন', desc: 'যোগাযোগ: 01930045168' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                <Icon className="w-6 h-6 text-amber-400 mb-3" />
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ৬. লোকেশন ও ফুটার */}
      <LocationSection />

      <footer className="bg-slate-900 border-t border-slate-800 py-10 px-6 text-center text-xs text-slate-400 space-y-2">
        <div className="font-black text-white text-base tracking-widest uppercase">
          TREND<span className="text-amber-400">VERSE</span>
        </div>
        <p className="flex items-center justify-center gap-1.5 text-slate-300">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>দক্ষিণ মনিপুর, মিরপুর-২, ঢাকা-১২১৬</span>
        </p>
        <p className="text-slate-500 pt-2">সর্বস্বত্ব সংরক্ষিত © ২০২৬ TRENDVERSE</p>
      </footer>

      {/* কার্ট ও চেকআউট ড্রয়ার */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onProceedToCheckout={() => {
          if (cart.length === 0) return;
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        onQuickBkashOrder={handleQuickBkashOrder}
        appliedCoupon={appliedCoupon}
        discountAmount={discountAmount}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={() => setAppliedCoupon(null)}
      />

      <ProductDetailModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(prod, qty) => addToCart(prod, qty)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        discountAmount={discountAmount}
        onOrderComplete={handleOrderComplete}
      />

      <OrderSuccessModal
        order={lastPlacedOrder}
        onClose={() => setLastPlacedOrder(null)}
      />
    </div>
  );
}
