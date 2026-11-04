import React from 'react';
import { Order, getUnitPrice } from '@/types/product';
import {
  getBengaliOrderStatusLabel,
  normalizeAdminOrderStatus,
} from '../utils/shopSettings';
import { X, Clock, Package } from 'lucide-react';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

function getStatusClasses(rawStatus?: string): string {
  const normalized = normalizeAdminOrderStatus(rawStatus);
  switch (normalized) {
    case 'Pending':
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    case 'Confirmed':
      return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    case 'Processing':
      return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    case 'Out for Delivery':
      return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
    case 'Delivered':
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    case 'Cancelled':
      return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
  }
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-slate-900 text-slate-100 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-800">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold">আপনার পূর্ববর্তী অর্ডারসমূহ</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-40 text-amber-400" />
              <h4 className="text-sm font-semibold text-white">কোনো অর্ডার পাওয়া যায়নি</h4>
              <p className="text-xs text-slate-400 mt-1">
                আপনি এখনো কোনো অর্ডার করেননি। আমাদের প্রিমিয়াম কালেকশন ঘুরে দেখুন।
              </p>
            </div>
          ) : (
            orders.map((ord) => {
              const displayTotal = ord.totalAmount ?? ord.total ?? 0;
              const displayAddress =
                ord.deliveryAddress ||
                `${ord.customer?.address || ''}, ${ord.customer?.division || ''}`;
              return (
                <div
                  key={ord.id}
                  className="p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors bg-slate-950"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-3 text-xs">
                    <div>
                      <span className="font-bold text-amber-400 font-mono">
                        #{ord.orderNumber || ord.id}
                      </span>
                      <span className="text-slate-600 mx-2">·</span>
                      <span className="text-slate-400">{ord.createdAt || ord.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${getStatusClasses(
                          ord.status
                        )}`}
                      >
                        {getBengaliOrderStatusLabel(ord.status)}
                      </span>
                      <span className="text-slate-400 uppercase font-mono text-[11px]">
                        {ord.paymentMethod}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-3 text-xs">
                    {ord.items.map((it) => (
                      <div key={it.id} className="flex justify-between text-slate-300">
                        <span>
                          {it.name} × {it.quantity}
                        </span>
                        <span className="font-mono tabular-nums text-white">
                          ৳{(getUnitPrice(it) * it.quantity).toLocaleString('bn-BD')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs gap-3">
                    <span className="text-slate-400">ডেলিভারি: {displayAddress}</span>
                    <span className="font-bold text-amber-400 font-mono text-sm tabular-nums whitespace-nowrap">
                      মোট: ৳{displayTotal.toLocaleString('bn-BD')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
