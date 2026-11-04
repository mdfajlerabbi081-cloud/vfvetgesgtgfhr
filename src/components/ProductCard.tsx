'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag, Check, Star } from 'lucide-react';
import { Product, getUnitPrice } from '@/types/product';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  onOrderClick?: (product: Product) => void;
}

export default function ProductCard({
  product,
  onQuickView,
  onOrderClick,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const unitPrice = getUnitPrice(product);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
    onOrderClick?.(product);
  };

  const genderLabel =
    product.gender === 'Women'
      ? 'মহিলাদের কালেকশন'
      : product.gender === 'Men'
      ? 'পুরুষদের কালেকশন'
      : null;

  return (
    <div
      onClick={() => onQuickView?.(product)}
      className="group bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-amber-500/40 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer"
    >
      {/* Studio Product Image (4:5 portrait frame, zero preset photos) */}
      <div className="relative aspect-[4/5] w-full bg-slate-950 overflow-hidden flex items-center justify-center">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-slate-600 p-6 text-center select-none">
            <ShoppingBag className="w-10 h-10 text-slate-700" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-500">
              {product.sku || 'TRENDVERSE'}
            </span>
          </div>
        )}
        {product.badge && (
          <span className="absolute top-3 left-3 text-[11px] font-semibold tracking-wider uppercase text-amber-300 bg-slate-950/85 backdrop-blur-sm border border-amber-500/30 px-2.5 py-1 rounded-md">
            {product.badge}
          </span>
        )}
      </div>

      {/* Clean Unboxed Metadata & Action */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400 truncate">
              <span className="font-semibold text-amber-400 uppercase tracking-wider">
                {product.category}
              </span>
              {genderLabel && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{genderLabel}</span>
                </>
              )}
            </div>
            {product.rating !== undefined && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium shrink-0 tabular-nums">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{product.rating}</span>
              </span>
            )}
          </div>

          <h3 className="text-base font-semibold text-slate-100 mt-1.5 group-hover:text-amber-400 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-amber-400 font-mono tabular-nums">
              ৳{unitPrice.toLocaleString('bn-BD')}
            </span>
            {product.originalPrice && product.originalPrice > unitPrice && (
              <span className="text-xs text-slate-500 line-through font-mono tabular-nums">
                ৳{product.originalPrice.toLocaleString('bn-BD')}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className={`flex items-center gap-1.5 text-xs px-3.5 py-2.5 rounded-xl transition font-black cursor-pointer active:scale-95 shrink-0 whitespace-nowrap ${
              isAdded
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm shadow-amber-400/10'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>যুক্ত হয়েছে</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>অর্ডার করুন</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
