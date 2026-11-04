'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product as BaseProduct, CartItem as BaseCartItem, getUnitPrice } from '@/types/product';
import { resolveBrandImage } from '@/src/assets/brandAssets';

export type Product = BaseProduct;
export type CartItem = BaseCartItem;

export interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product | (Omit<Product, 'price'> & { sellingPrice: number; price?: number }), quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function normalizeCartItem(
  raw: Partial<CartItem> & { id: string; name: string; category: string; image: string },
  fallbackQty = 1
): CartItem {
  const unitPrice = getUnitPrice(raw);
  const qty = typeof raw.quantity === 'number' && raw.quantity > 0 ? raw.quantity : fallbackQty;
  return {
    ...raw,
    id: String(raw.id),
    name: raw.name || 'TRENDVERSE Item',
    category: raw.category || 'Three Piece',
    image: raw.image ? resolveBrandImage(raw.image) : '',
    price: unitPrice,
    sellingPrice: raw.sellingPrice ?? unitPrice,
    costPrice: raw.costPrice ?? Math.round(unitPrice * 0.55),
    sku: raw.sku ?? `TV-${100 + Number(raw.id || 1)}`,
    stock: raw.stock ?? 25,
    sold: raw.sold ?? 0,
    description: raw.description ?? `${raw.name} — ১০০% অরিজিনাল TRENDVERSE প্রিমিয়াম কালেকশন।`,
    quantity: qty,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Hydration-safe cart load strictly from trendverse_cart
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('trendverse_cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          const deduped = new Map<string, CartItem>();
          for (const rawItem of parsed) {
            if (rawItem && rawItem.id && String(rawItem.id).trim() && rawItem.name) {
              const normalized = normalizeCartItem({
                ...rawItem,
                id: String(rawItem.id).trim(),
              });
              const prev = deduped.get(normalized.id);
              if (prev) {
                deduped.set(normalized.id, {
                  ...normalized,
                  quantity: prev.quantity + normalized.quantity,
                });
              } else {
                deduped.set(normalized.id, normalized);
              }
            }
          }
          setCart(Array.from(deduped.values()));
        }
      }
    } catch (error) {
      console.error('Failed to parse cart JSON', error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('trendverse_cart', JSON.stringify(cart));
      } catch (error) {
        console.error('Failed to save cart to localStorage', error);
      }
    }
  }, [cart, isLoaded]);

  const addToCart: CartContextType['addToCart'] = (product, quantity: number = 1) => {
    const normalized = normalizeCartItem(product as CartItem, quantity);
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === normalized.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === normalized.id
            ? { ...item, ...normalized, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...normalized, quantity }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const totalAmount = cart.reduce(
    (sum, item) => sum + getUnitPrice(item) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
