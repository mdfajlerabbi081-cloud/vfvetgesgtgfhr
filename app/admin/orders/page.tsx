'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  Search,
  Eye,
  Phone,
  MapPin,
  X,
  CreditCard,
} from 'lucide-react';
import {
  NormalizedAdminOrder,
  NormalizedAdminOrderItem,
  normalizeStoredOrders,
} from '@/src/utils/shopSettings';

export type OrderItem = NormalizedAdminOrderItem;
export type Order = NormalizedAdminOrder;

export default function AdminOrderManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // লোকাল স্টোরেজ বা অ্যাপ স্টেট থেকে ডাইনামিক অর্ডার লোড করা
  const loadOrders = useCallback(() => {
    try {
      const savedOrders = localStorage.getItem('trendverse_orders');
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        setOrders(normalizeStoredOrders(parsed));
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    window.addEventListener('trendverse_orders_updated', loadOrders);
    window.addEventListener('storage', loadOrders);
    return () => {
      window.removeEventListener('trendverse_orders_updated', loadOrders);
      window.removeEventListener('storage', loadOrders);
    };
  }, [loadOrders]);

  // অর্ডার স্ট্যাটাস আপডেট করা (পুরোপুরি ডাইনামিক)
  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    const updatedOrders = orders.map((order) =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    try {
      localStorage.setItem('trendverse_orders', JSON.stringify(updatedOrders));
      window.dispatchEvent(new Event('trendverse_orders_updated'));
    } catch {}

    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  // ফিল্টার ও সার্চ লজিক
  const filteredOrders = orders.filter((order) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      order.orderNumber.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerPhone.toLowerCase().includes(q);

    const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // স্ট্যাটাস অনুযায়ী ব্যাজ কালার ও আইকন
  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 whitespace-nowrap">
            <Clock className="w-3 h-3 shrink-0" /> অপেক্ষমাণ (Pending)
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3 shrink-0" /> কনফার্মড
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30 whitespace-nowrap">
            <ShoppingBag className="w-3 h-3 shrink-0" /> প্রস্তুত হচ্ছে
          </span>
        );
      case 'Out for Delivery':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 whitespace-nowrap">
            <Truck className="w-3 h-3 shrink-0" /> ডেলিভারির পথে
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
            <PackageCheck className="w-3 h-3 shrink-0" /> পৌঁছে গেছে
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 whitespace-nowrap">
            <XCircle className="w-3 h-3 shrink-0" /> বাতিলকৃত
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* হেডার ও অর্ডার কাউন্টার */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-amber-400 shrink-0" />
            অর্ডার কন্ট্রোল সেন্টার
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            কাস্টমারদের সকল অর্ডার যাচাই, বিকাশ TrxID চেক এবং ডেলিভারি স্ট্যাটাস পরিবর্তন করুন
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-2xl text-center">
            <p className="text-[11px] text-slate-400">মোট অর্ডার</p>
            <p className="text-lg font-black text-amber-400 font-mono tabular-nums">
              {orders.length}
            </p>
          </div>
          <div className="bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-2xl text-center">
            <p className="text-[11px] text-slate-400">পেন্ডিং অর্ডার</p>
            <p className="text-lg font-black text-rose-400 font-mono tabular-nums">
              {orders.filter((o) => o.status === 'Pending').length}
            </p>
          </div>
        </div>
      </div>

      {/* সার্চ ও স্ট্যাটাস ফিল্টার বার */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="অর্ডার নম্বর, কাস্টমারের নাম বা ফোন নম্বর দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {[
            'All',
            'Pending',
            'Confirmed',
            'Processing',
            'Out for Delivery',
            'Delivered',
            'Cancelled',
          ].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedStatus === status
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {status === 'All' ? 'সব অর্ডার' : status}
            </button>
          ))}
        </div>
      </div>

      {/* অর্ডার টেবিল */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 px-4 space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-700 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">কোনো অর্ডার পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-500">
              কাস্টমার সাইট থেকে অর্ডার প্লেস করলে সাথে সাথে এই তালিকায় চলে আসবে।
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase">
                  <th className="py-4 px-5">অর্ডার আইডি</th>
                  <th className="py-4 px-5">কাস্টমার ও ফোন</th>
                  <th className="py-4 px-5">পেমেন্ট মেথড</th>
                  <th className="py-4 px-5">মোট বিল</th>
                  <th className="py-4 px-5">বর্তমান স্ট্যাটাস</th>
                  <th className="py-4 px-5 text-right">অ্যাকশন / কন্ট্রোল</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-5 font-mono font-bold text-amber-400 whitespace-nowrap">
                      #{order.orderNumber}
                      <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                        {order.createdAt}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-bold text-white">{order.customerName}</div>
                      <div className="text-slate-400 flex items-center gap-1 mt-0.5 font-mono tabular-nums">
                        <Phone className="w-3 h-3 text-emerald-400 shrink-0" />{' '}
                        {order.customerPhone}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`font-bold ${
                          order.paymentMethod === 'bKash'
                            ? 'text-pink-400'
                            : 'text-slate-300'
                        }`}
                      >
                        {order.paymentMethod}
                      </span>
                      {order.trxId && (
                        <div className="text-[11px] font-mono text-amber-300 mt-0.5">
                          TrxID: {order.trxId}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-5 font-black text-white text-sm font-mono tabular-nums whitespace-nowrap">
                      ৳{order.totalAmount.toLocaleString('bn-BD')}
                    </td>
                    <td className="py-4 px-5">{getStatusBadge(order.status)}</td>
                    <td className="py-4 px-5 text-right space-x-2 whitespace-nowrap">
                      {/* সরাসরি স্ট্যাটাস চেঞ্জ ড্রপডাউন */}
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(
                            order.id,
                            e.target.value as Order['status']
                          )
                        }
                        className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-amber-400 px-3 py-1.5 rounded-lg font-bold transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> বিস্তারিত
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* অর্ডারের বিস্তারিত দেখার পপআপ মডাল */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white">
                  অর্ডার মেমো #{selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-slate-400">{selectedOrder.createdAt}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white cursor-pointer"
                aria-label="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">কাস্টমারের নাম:</span>
                <span className="font-bold text-white text-right">
                  {selectedOrder.customerName}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-400">ফোন নম্বর:</span>
                <a
                  href={`tel:${selectedOrder.customerPhone}`}
                  className="font-bold text-emerald-400 hover:underline font-mono tabular-nums"
                >
                  {selectedOrder.customerPhone}
                </a>
              </div>
              {selectedOrder.trxId && (
                <div className="flex justify-between gap-3">
                  <span className="text-slate-400 flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-pink-400" /> বিকাশ TrxID:
                  </span>
                  <span className="font-bold text-amber-300 font-mono">
                    {selectedOrder.trxId}
                  </span>
                </div>
              )}
              <div className="flex items-start justify-between gap-4">
                <span className="text-slate-400 shrink-0">ডেলিভারি ঠিকানা:</span>
                <span className="font-medium text-slate-200 text-right flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  {selectedOrder.deliveryAddress}
                </span>
              </div>
            </div>

            {/* অর্ডার করা প্রোডাক্ট লিস্ট */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase">
                অর্ডারকৃত পণ্যসমূহ
              </h4>
              <div className="divide-y divide-slate-800 bg-slate-950 rounded-2xl border border-slate-800 px-4 max-h-56 overflow-y-auto">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 flex justify-between items-center text-xs gap-3"
                  >
                    <div>
                      <span className="font-bold text-white">{item.name}</span>
                      <span className="text-slate-400 ml-2 font-mono tabular-nums">
                        x {item.quantity}
                      </span>
                    </div>
                    <span className="font-bold text-amber-400 font-mono tabular-nums whitespace-nowrap">
                      ৳{(item.price * item.quantity).toLocaleString('bn-BD')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-sm font-bold text-slate-300">সর্বমোট বিল:</span>
              <span className="text-xl font-black text-amber-400 font-mono tabular-nums">
                ৳{selectedOrder.totalAmount.toLocaleString('bn-BD')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
