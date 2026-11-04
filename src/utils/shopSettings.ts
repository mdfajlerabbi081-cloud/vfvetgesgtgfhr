import { useState, useEffect, useCallback } from 'react';
import { AdminOrderStatus, getUnitPrice } from '@/types/product';

export interface ShopSettings {
  helpline: string;
  bkashNumber: string;
  insideDhakaFee: string;
  outsideDhakaFee: string;
  adminPassword: string;
}

export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  helpline: '01930045168',
  bkashNumber: '01759720739',
  insideDhakaFee: '70',
  outsideDhakaFee: '130',
  adminPassword: '01759720739',
};

export function loadShopSettings(): ShopSettings {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_SHOP_SETTINGS };
  }

  let storedCustomPass = '';
  try {
    storedCustomPass = (localStorage.getItem('trendverse_admin_password') || '').trim();
  } catch {}

  try {
    const raw = localStorage.getItem('trendverse_settings');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          helpline:
            typeof parsed.helpline === 'string' && parsed.helpline.trim()
              ? parsed.helpline.trim()
              : DEFAULT_SHOP_SETTINGS.helpline,
          bkashNumber:
            typeof parsed.bkashNumber === 'string' && parsed.bkashNumber.trim()
              ? parsed.bkashNumber.trim()
              : DEFAULT_SHOP_SETTINGS.bkashNumber,
          insideDhakaFee:
            parsed.insideDhakaFee !== undefined && String(parsed.insideDhakaFee).trim() !== ''
              ? String(parsed.insideDhakaFee).trim()
              : DEFAULT_SHOP_SETTINGS.insideDhakaFee,
          outsideDhakaFee:
            parsed.outsideDhakaFee !== undefined && String(parsed.outsideDhakaFee).trim() !== ''
              ? String(parsed.outsideDhakaFee).trim()
              : DEFAULT_SHOP_SETTINGS.outsideDhakaFee,
          adminPassword:
            typeof parsed.adminPassword === 'string' && parsed.adminPassword.trim()
              ? parsed.adminPassword.trim()
              : storedCustomPass || DEFAULT_SHOP_SETTINGS.adminPassword,
        };
      }
    }
  } catch {}

  return {
    ...DEFAULT_SHOP_SETTINGS,
    adminPassword: storedCustomPass || DEFAULT_SHOP_SETTINGS.adminPassword,
  };
}

export function saveShopSettings(settings: ShopSettings): ShopSettings {
  const normalized: ShopSettings = {
    helpline: settings.helpline.trim() || DEFAULT_SHOP_SETTINGS.helpline,
    bkashNumber: settings.bkashNumber.trim() || DEFAULT_SHOP_SETTINGS.bkashNumber,
    insideDhakaFee: String(settings.insideDhakaFee).trim() || DEFAULT_SHOP_SETTINGS.insideDhakaFee,
    outsideDhakaFee: String(settings.outsideDhakaFee).trim() || DEFAULT_SHOP_SETTINGS.outsideDhakaFee,
    adminPassword: settings.adminPassword.trim() || DEFAULT_SHOP_SETTINGS.adminPassword,
  };

  try {
    localStorage.setItem('trendverse_settings', JSON.stringify(normalized));
    localStorage.setItem('trendverse_admin_password', normalized.adminPassword);
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('trendverse_settings_updated'));
    fetch('/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        newPassword: normalized.adminPassword,
        clientSynced: true,
      }),
    }).catch(() => {});
  }

  return normalized;
}

export function useShopSettings() {
  const [settings, setSettings] = useState<ShopSettings>(loadShopSettings);

  const sync = useCallback(() => {
    setSettings(loadShopSettings());
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener('trendverse_settings_updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('trendverse_settings_updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, [sync]);

  const insideDhakaFeeNum = Math.max(0, Number(settings.insideDhakaFee) || 70);
  const outsideDhakaFeeNum = Math.max(0, Number(settings.outsideDhakaFee) || 130);

  const digitsOnlyHelpline = settings.helpline.replace(/\D/g, '');
  const intlHelpline = digitsOnlyHelpline.startsWith('88')
    ? digitsOnlyHelpline
    : `88${digitsOnlyHelpline || '01930045168'}`;

  return {
    settings,
    insideDhakaFeeNum,
    outsideDhakaFeeNum,
    whatsappOrderUrl: `https://wa.me/${intlHelpline}?text=${encodeURIComponent(
      'হ্যালো TRENDVERSE, আমি প্রোডাক্ট অর্ডার করতে চাই।'
    )}`,
  };
}

export function normalizeAdminOrderStatus(rawStatus?: string): AdminOrderStatus {
  switch ((rawStatus || '').trim()) {
    case 'Confirmed':
      return 'Confirmed';
    case 'Processing':
    case 'processing':
      return 'Processing';
    case 'Out for Delivery':
    case 'shipped':
      return 'Out for Delivery';
    case 'Delivered':
    case 'delivered':
      return 'Delivered';
    case 'Cancelled':
      return 'Cancelled';
    case 'Pending':
    default:
      return 'Pending';
  }
}

export function getBengaliOrderStatusLabel(rawStatus?: string): string {
  const normalized = normalizeAdminOrderStatus(rawStatus);
  switch (normalized) {
    case 'Pending':
      return 'অপেক্ষমাণ (Pending)';
    case 'Confirmed':
      return 'কনফার্মড';
    case 'Processing':
      return 'প্রস্তুত হচ্ছে';
    case 'Out for Delivery':
      return 'ডেলিভারির পথে';
    case 'Delivered':
      return 'পৌঁছে গেছে';
    case 'Cancelled':
      return 'বাতিলকৃত';
  }
}

export interface NormalizedAdminOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sellingPrice?: number;
  category?: string;
  image?: string;
}

export interface NormalizedAdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: NormalizedAdminOrderItem[];
  totalAmount: number;
  paymentMethod: 'bKash' | 'Cash on Delivery';
  trxId?: string;
  status: AdminOrderStatus;
  createdAt: string;
  // Preserved storefront fields for OrderHistoryModal compatibility
  date?: string;
  customer?: {
    fullName: string;
    phone: string;
    division: string;
    address: string;
    notes?: string;
  };
  subtotal?: number;
  deliveryFee?: number;
  discount?: number;
  total?: number;
  paymentStatus?: 'pending' | 'paid';
}

export function normalizeStoredOrders(rawList: unknown): NormalizedAdminOrder[] {
  if (!Array.isArray(rawList)) return [];

  const seenOrderIds = new Set<string>();

  return rawList.map((entry: Record<string, unknown>, idx: number) => {
    const rawId = typeof entry?.id === 'string' ? entry.id.trim() : '';
    let safeId = rawId || `TV-ORD-${idx + 1}`;
    while (seenOrderIds.has(safeId)) {
      safeId = `${safeId}-${idx + 1}`;
    }
    seenOrderIds.add(safeId);

    const rawOrderNum =
      typeof entry?.orderNumber === 'string' && entry.orderNumber.trim()
        ? entry.orderNumber.trim()
        : safeId;

    const customerObj =
      entry?.customer && typeof entry.customer === 'object'
        ? (entry.customer as Record<string, unknown>)
        : undefined;

    const customerName =
      (typeof entry?.customerName === 'string' && entry.customerName.trim()) ||
      (typeof customerObj?.fullName === 'string' && customerObj.fullName.trim()) ||
      'কাস্টমার';

    const customerPhone =
      (typeof entry?.customerPhone === 'string' && entry.customerPhone.trim()) ||
      (typeof customerObj?.phone === 'string' && customerObj.phone.trim()) ||
      'N/A';

    const composedAddress = customerObj
      ? [customerObj.address, customerObj.division]
          .filter((v) => typeof v === 'string' && v.trim())
          .join(', ')
      : '';

    const deliveryAddress =
      (typeof entry?.deliveryAddress === 'string' && entry.deliveryAddress.trim()) ||
      composedAddress ||
      'ঠিকানা উল্লেখ নেই';

    const rawItems = Array.isArray(entry?.items) ? entry.items : [];
    const seenItemIds = new Set<string>();
    const items: NormalizedAdminOrderItem[] = rawItems.map(
      (it: Record<string, unknown>, itemIdx: number) => {
        const rawItId = typeof it?.id === 'string' ? it.id.trim() : String(it?.id ?? '');
        let safeItId = rawItId || `${safeId}-item-${itemIdx + 1}`;
        while (seenItemIds.has(safeItId)) {
          safeItId = `${safeItId}-${itemIdx + 1}`;
        }
        seenItemIds.add(safeItId);

        const unitPrice = getUnitPrice({
          sellingPrice: typeof it?.sellingPrice === 'number' ? it.sellingPrice : undefined,
          price: typeof it?.price === 'number' ? it.price : Number(it?.price ?? 0),
        });

        return {
          ...(it as Record<string, unknown>),
          id: safeItId,
          name: typeof it?.name === 'string' && it.name.trim() ? it.name : 'প্রোডাক্ট',
          price: unitPrice,
          sellingPrice: unitPrice,
          quantity: Math.max(1, Number(it?.quantity ?? 1)),
        };
      }
    );

    const computedItemsTotal = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const totalAmount = Number(
      entry?.totalAmount ?? entry?.total ?? computedItemsTotal
    );

    const rawPayment = String(entry?.paymentMethod || '').toLowerCase();
    const paymentMethod: 'bKash' | 'Cash on Delivery' =
      rawPayment === 'bkash' ? 'bKash' : 'Cash on Delivery';

    const createdAt =
      (typeof entry?.createdAt === 'string' && entry.createdAt.trim()) ||
      (typeof entry?.date === 'string' && entry.date.trim()) ||
      new Date().toLocaleDateString('bn-BD');

    const status = normalizeAdminOrderStatus(
      typeof entry?.status === 'string' ? entry.status : 'Pending'
    );

    return {
      ...(entry as Record<string, unknown>),
      id: safeId,
      orderNumber: rawOrderNum,
      customerName,
      customerPhone,
      deliveryAddress,
      items,
      totalAmount: Number.isFinite(totalAmount) ? totalAmount : 0,
      total: Number.isFinite(totalAmount) ? totalAmount : 0,
      paymentMethod,
      trxId: typeof entry?.trxId === 'string' && entry.trxId.trim() ? entry.trxId.trim() : undefined,
      status,
      createdAt,
      date: typeof entry?.date === 'string' && entry.date.trim() ? entry.date : createdAt,
      customer: customerObj
        ? {
            fullName: String(customerObj.fullName || customerName),
            phone: String(customerObj.phone || customerPhone),
            division: String(customerObj.division || 'ঢাকা'),
            address: String(customerObj.address || deliveryAddress),
            notes: typeof customerObj.notes === 'string' ? customerObj.notes : undefined,
          }
        : {
            fullName: customerName,
            phone: customerPhone,
            division: 'ঢাকা',
            address: deliveryAddress,
          },
    };
  });
}
