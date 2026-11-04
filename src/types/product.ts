export interface Product {
  id: string;
  sku?: string;
  name: string;
  category: string;
  gender?: 'Men' | 'Women' | 'Unisex';
  costPrice?: number;
  sellingPrice?: number;
  price: number;
  originalPrice?: number;
  stock?: number;
  sold?: number;
  image: string;
  description?: string;
  rating?: number;
  reviewsCount?: number;
  inStock?: boolean;
  warranty?: string;
  badge?: string;
  features?: string[];
  specs?: { label: string; value: string }[];
}

export interface CartItem extends Product {
  quantity: number;
}

export function getUnitPrice(item: { sellingPrice?: number; price?: number }): number {
  const raw = item.sellingPrice ?? item.price ?? 0;
  return Number.isFinite(raw) ? raw : 0;
}

export interface CustomerInfo {
  fullName: string;
  phone: string;
  division: string;
  address: string;
  notes?: string;
}

export type AdminOrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type OrderStatus = AdminOrderStatus | 'processing' | 'shipped' | 'delivered';

export interface Order {
  id: string;
  orderNumber?: string;
  date: string;
  createdAt?: string;
  items: CartItem[];
  customer: CustomerInfo;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  totalAmount?: number;
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'card' | 'bKash' | 'Cash on Delivery';
  paymentStatus: 'pending' | 'paid';
  trxId?: string;
  status: OrderStatus;
}
