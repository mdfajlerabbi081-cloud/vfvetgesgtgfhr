/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Product, Order, getUnitPrice } from '@/types/product';
import {
  BANGLADESH_DIVISIONS,
  loadSyncedInventory,
  loadAdminInventory,
  saveAdminInventory,
  inferProductGender,
} from './data/products';
import { CartProvider, useCart } from './context/CartContext';
import { checkAdminAuth, revokeAdminAuth } from './utils/adminAuth';
import { useShopSettings, normalizeStoredOrders } from './utils/shopSettings';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { TrustBadges } from './components/TrustBadges';
import { FaqContact } from './components/FaqContact';
import LocationSection from './components/LocationSection';
import { Footer } from './components/Footer';
import AdminLoginPage from './components/AdminLoginPage';
import BlankCustomizableProductManager from './components/BlankCustomizableProductManager';
import AdminLayout from '../app/admin/layout';
import FullyCustomizableAdminDashboard from '../app/admin/page';
import AdminOrdersPage from '../app/admin/orders/page';
import AdminSettingsPage from '../app/admin/settings/page';
import TrendverseLoader from './components/TrendverseLoader';
import CustomerAuthPage from './components/CustomerAuthPage';
import {
  Sparkles,
  SlidersHorizontal,
  Search,
  Clock,
  Shield,
  Inbox,
} from 'lucide-react';

function loadCatalogCategories(catalogProducts: Product[]): { id: string; label: string }[] {
  const baseIds = ['Three Piece', 'T-Shirts', 'Jackets', 'Hoodies', 'Pants', 'Accessories'];
  let storedIds: string[] = [];
  try {
    const saved = localStorage.getItem('trendverse_custom_categories');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) storedIds = parsed;
    }
  } catch {}

  const productCatIds = catalogProducts.map((p) => p.category);
  const merged = Array.from(
    new Set(
      [...baseIds, ...storedIds, ...productCatIds]
        .map((c) => (typeof c === 'string' ? c.trim() : ''))
        .filter((c) => Boolean(c) && c.toLowerCase() !== 'all')
    )
  );

  return [
    { id: 'all', label: 'সব ক্যাটাগরি' },
    ...merged.map((cat) => ({ id: cat, label: cat })),
  ];
}

function ShopContent() {
  const pathname = usePathname();
  const router = useRouter();
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount } = useCart();

  // Live catalog synced with Admin BlankCustomizableProductManager
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(loadSyncedInventory);

  const syncInventory = useCallback(() => {
    setCatalogProducts(loadSyncedInventory());
  }, []);

  useEffect(() => {
    syncInventory();
    window.addEventListener('trendverse_inventory_updated', syncInventory);
    window.addEventListener('storage', syncInventory);
    return () => {
      window.removeEventListener('trendverse_inventory_updated', syncInventory);
      window.removeEventListener('storage', syncInventory);
    };
  }, [syncInventory, pathname]);

  const categoriesList = useMemo(
    () => loadCatalogCategories(catalogProducts),
    [catalogProducts]
  );

  const { settings: shopSettings, insideDhakaFeeNum } = useShopSettings();

  const readStoredOrders = useCallback((): Order[] => {
    try {
      const saved = localStorage.getItem('trendverse_orders');
      const parsed = saved ? JSON.parse(saved) : [];
      return normalizeStoredOrders(parsed) as unknown as Order[];
    } catch {
      return [];
    }
  }, []);

  // Orders state with localStorage persistence (synced live with AdminOrderManagementPage)
  const [orders, setOrders] = useState<Order[]>(readStoredOrders);

  useEffect(() => {
    const syncOrders = () => {
      setOrders(readStoredOrders());
    };
    window.addEventListener('trendverse_orders_updated', syncOrders);
    window.addEventListener('storage', syncOrders);
    return () => {
      window.removeEventListener('trendverse_orders_updated', syncOrders);
      window.removeEventListener('storage', syncOrders);
    };
  }, [readStoredOrders, pathname]);

  // Active filters and query (Gender collection filter + Category + Search + Sort)
  const [selectedGender, setSelectedGender] = useState<'All' | 'Women' | 'Men'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating'>('popular');

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [, setIsAdminAuthenticated] = useState<boolean>(checkAdminAuth);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    const syncAdminAuth = () => {
      setIsAdminAuthenticated(checkAdminAuth());
    };
    syncAdminAuth();
    window.addEventListener('trendverse_admin_auth_updated', syncAdminAuth);
    return () => {
      window.removeEventListener('trendverse_admin_auth_updated', syncAdminAuth);
    };
  }, []);

  // মূল ওয়েবসাইটে (স্টোরফ্রন্টে) ফিরে আসলে পূর্ববর্তী এডমিন সেশন বাতিল হবে যাতে পরের বার প্রবেশে আবার পাসওয়ার্ড লাগে
  useEffect(() => {
    const onAdminSection = pathname === '/admin' || pathname.startsWith('/admin/');
    if (!onAdminSection && pathname !== '/admin-login') {
      if (checkAdminAuth()) {
        revokeAdminAuth();
      }
    }
  }, [pathname]);

  // Loading state for initial splash
  const [isLoading, setIsLoading] = useState(true);

  // Applied Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 650);
    return () => clearTimeout(timer);
  }, []);

  const persistNewOrder = useCallback((newOrder: Order) => {
    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      try {
        localStorage.setItem('trendverse_orders', JSON.stringify(updated));
        window.dispatchEvent(new Event('trendverse_orders_updated'));
      } catch (e) {
        console.error('Failed to save orders to localStorage', e);
      }
      return updated;
    });
  }, []);

  const handleAddToCart = (product: Product, quantity = 1) => {
    addToCart(product, quantity);
  };

  // Coupon handling
  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon === 'TREND10' || appliedCoupon === 'AMAR10') {
      return Math.round(totalAmount * 0.1);
    }
    if (appliedCoupon === 'SHOP50') {
      return 50;
    }
    if (appliedCoupon === 'EID2026') {
      return Math.round(totalAmount * 0.15);
    }
    return 0;
  }, [appliedCoupon, totalAmount]);

  const handleApplyCoupon = (code: string): boolean => {
    const validCoupons = ['TREND10', 'AMAR10', 'SHOP50', 'EID2026'];
    if (validCoupons.includes(code)) {
      setAppliedCoupon(code);
      return true;
    }
    return false;
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
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

  // Order workflow
  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
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
        phone: `${shopSettings.bkashNumber} (TrxID: ${trxId})`,
        division: BANGLADESH_DIVISIONS[0],
        address: 'বিকাশ পেমেন্ট ভেরিফিকেশন সাপেক্ষে ডেলিভারি',
        notes: `bKash TrxID: ${trxId}`,
      },
      customerName: 'বিকাশ এক্সপ্রেস কাস্টমার',
      customerPhone: `${shopSettings.bkashNumber} (TrxID: ${trxId})`,
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

    persistNewOrder(newOrder);
    decrementInventoryForOrder(newOrder.items);
    clearCart();
    setAppliedCoupon(null);
  };

  const handleOrderComplete = (order: Order) => {
    persistNewOrder(order);
    decrementInventoryForOrder(order.items);
    clearCart();
    setAppliedCoupon(null);
    setIsCheckoutOpen(false);
    setLastPlacedOrder(order);
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = [...catalogProducts];

    if (selectedGender !== 'All') {
      result = result.filter((p) => {
        const g = p.gender || inferProductGender(p);
        return (
          g === selectedGender ||
          g === 'Unisex' ||
          p.category.toLowerCase().includes(selectedGender.toLowerCase())
        );
      });
    }

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => getUnitPrice(a) - getUnitPrice(b));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => getUnitPrice(b) - getUnitPrice(a));
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else {
      result.sort((a, b) => (b.sold ?? b.reviewsCount ?? 0) - (a.sold ?? a.reviewsCount ?? 0));
    }

    return result;
  }, [catalogProducts, selectedGender, selectedCategory, searchQuery, sortBy]);

  const isAdminLoginRoute =
    pathname === '/admin/login' ||
    pathname.startsWith('/admin/login/') ||
    pathname === '/admin-login' ||
    pathname.startsWith('/admin-login/');
  const isAdminRoute = !isAdminLoginRoute && (pathname === '/admin' || pathname.startsWith('/admin/'));

  if (isAdminLoginRoute) {
    return (
      <AdminLoginPage
        onLoginSuccess={() => {
          setIsAdminAuthenticated(true);
        }}
      />
    );
  }

  if (isAdminRoute) {
    return (
      <AdminLayout>
        {pathname === '/admin/products' ? (
          <BlankCustomizableProductManager />
        ) : pathname === '/admin/orders' ? (
          <AdminOrdersPage />
        ) : pathname === '/admin/settings' ? (
          <AdminSettingsPage />
        ) : (
          <FullyCustomizableAdminDashboard />
        )}
      </AdminLayout>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Initial Trendverse Luxury Loader */}
      {isLoading && <TrendverseLoader />}

      {/* Sticky Header Navigation with Top Helpline & WhatsApp */}
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* ১. কালেকশন ফিল্টার সেকশন (কোনো প্রিসেট ব্যানার বা স্টক ছবি নেই) */}
      <section className="py-12 px-4 sm:px-6 text-center max-w-4xl mx-auto space-y-5 border-b border-slate-900/80 w-full">
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

        {/* কালেকশন ফিল্টার বাটনসমূহ */}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setSelectedGender('All');
              setSelectedCategory('all');
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
              selectedGender === 'All'
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/10'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-amber-500/40'
            }`}
          >
            সব কালেকশন
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedGender('Women');
              setSelectedCategory('all');
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
              selectedGender === 'Women'
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/10'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-amber-500/40'
            }`}
          >
            উইমেন্স কালেকশন (থ্রি-পিস)
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedGender('Men');
              setSelectedCategory('all');
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer whitespace-nowrap ${
              selectedGender === 'Men'
                ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/10'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-amber-500/40'
            }`}
          >
            মেনস কালেকশন
          </button>
        </div>
      </section>

      {/* ২. ডাইনামিক প্রোডাক্ট ডিসপ্লে (কোনো প্রিসেট ছবি থাকবে না) */}
      <main id="products" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* টুলবার: ক্যাটাগরি, সার্চ, সর্ট ও অর্ডার হিস্ট্রি */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          {catalogProducts.length > 0 ? (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {categoriesList.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-slate-800 text-amber-400 border border-amber-400/40'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 font-medium">
              লাইভ ইনভেন্টরি ক্যাটালগ
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {catalogProducts.length > 0 && (
              <>
                <div className="relative w-48 sm:w-56">
                  <input
                    type="text"
                    placeholder="থ্রি-পিস বা পোশাক খুঁজুন..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 text-white border border-slate-800 rounded-xl focus:outline-none focus:border-amber-400 transition"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'popular' | 'price-asc' | 'price-desc' | 'rating')}
                  className="text-xs font-medium bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="popular">জনপ্রিয়তা</option>
                  <option value="rating">সর্বোচ্চ রেটিং</option>
                  <option value="price-asc">দাম: কম থেকে বেশি</option>
                  <option value="price-desc">দাম: বেশি থেকে কম</option>
                </select>
              </>
            )}

            <button
              type="button"
              onClick={() => setIsOrderHistoryOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl cursor-pointer transition-colors whitespace-nowrap"
              title="অর্ডার হিস্ট্রি"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>অর্ডার হিস্ট্রি</span>
            </button>
          </div>
        </div>

        {/* প্রোডাক্ট গ্রিড অথবা খালি ইনভেন্টরি কার্ড */}
        {catalogProducts.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 p-8 space-y-4">
            <Inbox className="w-12 h-12 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-200">বর্তমানে কোনো প্রোডাক্ট নেই</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                এডমিন ড্যাশবোর্ড থেকে নতুন প্রোডাক্ট যুক্ত করার পর এখানে স্বয়ংক্রিয়ভাবে দেখাবে।
              </p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800 p-8">
            <SlidersHorizontal className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">বর্তমানে এই ফিল্টারে কোনো প্রোডাক্ট নেই</h3>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              অনুসন্ধান বা নির্বাচিত কালেকশনে কোনো প্রোডাক্ট পাওয়া যায়নি।
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedGender('All');
                setSelectedCategory('all');
              }}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl cursor-pointer transition whitespace-nowrap"
            >
              সব কালেকশন দেখুন
            </button>
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
      </main>

      {/* 4. Craftsmanship & Assurance */}
      <TrustBadges />

      {/* 5. FAQ & Customer Support */}
      <FaqContact />

      {/* 6. Shop Location & Direct Contact */}
      <LocationSection />

      {/* 7. Footer */}
      <Footer />

      {/* Cart Slide-Over Drawer (with Direct bKash 01759720739 + COD Full Checkout) */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onProceedToCheckout={handleProceedToCheckout}
        onQuickBkashOrder={handleQuickBkashOrder}
        appliedCoupon={appliedCoupon}
        discountAmount={discountAmount}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Full Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        discountAmount={discountAmount}
        onOrderComplete={handleOrderComplete}
      />

      {/* Order Placed Success Modal */}
      <OrderSuccessModal
        order={lastPlacedOrder}
        onClose={() => setLastPlacedOrder(null)}
      />

      {/* Order History Modal */}
      <OrderHistoryModal
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
        orders={orders}
      />

      {/* Customer Authentication Modal */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <CustomerAuthPage
            onClose={() => setIsAuthOpen(false)}
            onSuccess={() => setIsAuthOpen(false)}
          />
        </div>
      )}

      {/* Floating Secure Admin Gateway Link — প্রতিবার প্রবেশের জন্য ভেরিফিকেশন বাধ্যতামূলক */}
      <button
        type="button"
        onClick={() => {
          revokeAdminAuth();
          router.push('/admin/login');
        }}
        className="fixed bottom-5 right-5 z-40 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-2xl border border-amber-500/30 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
        title="TRENDVERSE এডমিন গেটওয়ে"
      >
        <Shield className="w-4 h-4 text-amber-400 shrink-0" />
        <span>এডমিন গেটওয়ে</span>
      </button>
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <ShopContent />
    </CartProvider>
  );
}
