'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Search,
  Package,
  Upload,
  Layers,
  Calculator,
  Inbox,
  AlertTriangle,
} from 'lucide-react';
import {
  loadAdminInventory,
  saveAdminInventory,
  inferProductGender,
  createUniqueProductId,
  createUniqueProductSku,
} from '@/src/data/products';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  gender: 'Men' | 'Women' | 'Unisex';
  costPrice: number;
  sellingPrice: number;
  price?: number;
  stock: number;
  sold: number;
  image: string;
}

const CATEGORIES_STORAGE_KEY = 'trendverse_custom_categories';
const DEFAULT_CATEGORIES = [
  'Three Piece',
  'T-Shirts',
  'Jackets',
  'Hoodies',
  'Pants',
  'Accessories',
];

function readImageFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!rawDataUrl) {
        resolve(URL.createObjectURL(file));
        return;
      }

      const img = new window.Image();
      img.onload = () => {
        try {
          const maxDim = 720;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width >= height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        } catch {
          resolve(rawDataUrl);
        }
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.onerror = () => resolve(URL.createObjectURL(file));
    reader.readAsDataURL(file);
  });
}

export default function BlankCustomizableProductManager() {
  const [products, setProducts] = useState<Product[]>(() => {
    const seenIds = new Set<string>();
    const seenSkus = new Set<string>();
    return loadAdminInventory().map((p, idx) => {
      const rawId = typeof p.id === 'string' ? p.id.trim() : '';
      let safeId = rawId || createUniqueProductId(`tv-${idx}`);
      while (seenIds.has(safeId)) {
        safeId = createUniqueProductId(`tv-${idx}`);
      }
      seenIds.add(safeId);

      const rawSku = typeof p.sku === 'string' ? p.sku.trim() : '';
      let safeSku = rawSku || createUniqueProductSku(seenSkus, 'TV');
      while (seenSkus.has(safeSku.toUpperCase())) {
        safeSku = createUniqueProductSku(seenSkus, 'TV');
      }
      seenSkus.add(safeSku.toUpperCase());

      return {
        id: safeId,
        sku: safeSku,
        name: p.name,
        category: p.category || 'Three Piece',
        gender: inferProductGender(p),
        costPrice: Number(p.costPrice ?? 0),
        sellingPrice: Number(p.sellingPrice ?? p.price ?? 0),
        price: Number(p.sellingPrice ?? p.price ?? 0),
        stock: Number(p.stock ?? 0),
        sold: Number(p.sold ?? 0),
        image: p.image,
      };
    });
  });

  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return Array.from(new Set(['Three Piece', ...parsed]));
        }
      }
    } catch {}
    return DEFAULT_CATEGORIES;
  });

  const [newCategory, setNewCategory] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    category: string;
    gender: 'Men' | 'Women' | 'Unisex';
    costPrice: string;
    sellingPrice: string;
    stock: string;
    image: string;
  }>({
    name: '',
    category: 'Three Piece',
    gender: 'Women',
    costPrice: '',
    sellingPrice: '',
    stock: '',
    image: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    saveAdminInventory(products);
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
      window.dispatchEvent(new Event('trendverse_inventory_updated'));
    } catch (err) {
      console.error('Failed to persist categories', err);
    }
  }, [categories]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const persistentImageUrl = await readImageFileAsDataUrl(file);
      setImagePreview(persistentImageUrl);
      setFormData((prev) => ({ ...prev, image: persistentImageUrl }));
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategory.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
      setFormData((prev) => ({ ...prev, category: trimmed }));
      setNewCategory('');
      setShowCategoryModal(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      gender: product.gender || inferProductGender(product),
      costPrice: product.costPrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      stock: product.stock.toString(),
      image: product.image || '',
    });
    setImagePreview(product.image || null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setPendingDeleteId(id);
  };

  const confirmDelete = () => {
    if (pendingDeleteId) {
      setProducts((prev) => prev.filter((p) => p.id !== pendingDeleteId));
      setPendingDeleteId(null);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedCost = Math.max(0, Number(formData.costPrice) || 0);
    const parsedSelling = Math.max(0, Number(formData.sellingPrice) || 0);
    const parsedStock = Math.max(0, Number(formData.stock) || 0);

    if (editingProduct) {
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: formData.name.trim(),
                category: formData.category,
                gender: formData.gender,
                costPrice: parsedCost,
                sellingPrice: parsedSelling,
                price: parsedSelling,
                stock: parsedStock,
                image: formData.image || p.image || '',
              }
            : p
        )
      );
    } else {
      const skuPrefix = formData.gender === 'Women' ? 'TV-3P' : 'TV';
      const newProduct: Product = {
        id: createUniqueProductId('tv'),
        sku: createUniqueProductSku(
          products.map((item) => item.sku),
          skuPrefix
        ),
        name: formData.name.trim(),
        category: formData.category,
        gender: formData.gender,
        costPrice: parsedCost,
        sellingPrice: parsedSelling,
        price: parsedSelling,
        stock: parsedStock,
        sold: 0,
        image: formData.image || '',
      };
      setProducts([newProduct, ...products]);
    }

    setIsModalOpen(false);
    setEditingProduct(null);
    setImagePreview(null);
    setFormData({
      name: '',
      category: categories[0] || 'Three Piece',
      gender: 'Women',
      costPrice: '',
      sellingPrice: '',
      stock: '',
      image: '',
    });
  };

  const costVal = Number(formData.costPrice) || 0;
  const sellVal = Number(formData.sellingPrice) || 0;
  const calculatedProfit = sellVal - costVal;

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 text-slate-100 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-white flex items-center gap-2">
            ইনভেন্টরি কন্ট্রোল প্যানেল
            <Package className="w-6 h-6 text-amber-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            মহিলাদের থ্রি-পিস ও পুরুষদের কালেকশনের নাম, স্টক পরিমাণ এবং মূল্যের তথ্য কাস্টমাইজ করুন
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 px-4 py-3 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            ক্যাটাগরি
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingProduct(null);
              setImagePreview(null);
              setFormData({
                name: '',
                category: categories[0] || 'Three Piece',
                gender: 'Women',
                costPrice: '',
                sellingPrice: '',
                stock: '',
                image: '',
              });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-5 py-3 rounded-xl text-xs transition shadow-lg shadow-amber-400/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            নতুন প্রোডাক্ট যোগ করুন
          </button>
        </div>
      </div>

      {/* Search and Metrics */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="প্রোডাক্টের নাম বা SKU দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition"
          />
        </div>
        <span className="text-xs font-mono text-slate-400 tabular-nums">
          মোট এন্ট্রি প্রোডাক্ট: <strong className="text-amber-400">{products.length}</strong> টি
        </span>
      </div>

      {/* Main Inventory Table / Blank State */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        {products.length === 0 ? (
          <div className="text-center py-20 px-4 space-y-4">
            <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-600">
              <Inbox className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">এখনও কোনো প্রোডাক্ট যোগ করা হয়নি</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                উপরে থাকা <strong className="text-amber-400">&quot;নতুন প্রোডাক্ট যোগ করুন&quot;</strong> বাটনে ক্লিক করে আপনার পণ্যের তথ্য ইনপুট দিন।
              </p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <p className="text-sm font-bold text-white">অনুসন্ধানকৃত নামে কোনো প্রোডাক্ট পাওয়া যায়নি</p>
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              সার্চ ক্লিয়ার করুন
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase text-xs tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">প্রোডাক্ট</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">ধরন</th>
                  <th className="p-4">কেনা দাম</th>
                  <th className="p-4">বিক্রয় মূল্য</th>
                  <th className="p-4">একক লাভ</th>
                  <th className="p-4">স্টক</th>
                  <th className="p-4 text-center">পরিবর্তন/সম্পাদনা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredProducts.map((product) => {
                  const profit = product.sellingPrice - product.costPrice;
                  return (
                    <tr key={product.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 flex items-center justify-center">
                          {product.image ? (
                            <Image src={product.image} alt={product.name} fill sizes="48px" className="object-cover" />
                          ) : (
                            <Package className="w-5 h-5 text-slate-600" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-white block">{product.name}</span>
                          <span className="text-xs text-amber-400 font-mono">{product.category}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-slate-400">{product.sku}</td>
                      <td className="p-4 text-xs text-slate-300">
                        {product.gender === 'Women'
                          ? 'মহিলাদের'
                          : product.gender === 'Men'
                          ? 'পুরুষদের'
                          : 'ইউনিসেক্স'}
                      </td>
                      <td className="p-4 text-rose-400 font-mono tabular-nums">৳{product.costPrice}</td>
                      <td className="p-4 text-emerald-400 font-mono font-bold tabular-nums">৳{product.sellingPrice}</td>
                      <td className={`p-4 font-mono font-bold tabular-nums ${profit >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {profit >= 0 ? `+৳${profit}` : `-৳${Math.abs(profit)}`}
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-xs font-bold font-mono tabular-nums ${
                            product.stock < 10 ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {product.stock} টি
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(product)}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition cursor-pointer"
                            title="পরিবর্তন করুন"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(product.id)}
                            className="p-2 bg-slate-800 hover:bg-rose-500/20 text-rose-400 rounded-lg transition cursor-pointer"
                            title="ডিলিট করুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                {editingProduct ? 'প্রোডাক্টের তথ্য সংশোধন করুন' : 'নতুন প্রোডাক্ট যুক্ত করুন'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">প্রোডাক্টের নাম টাইপ করুন</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: Exclusive Cotton Three Piece"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">ক্যাটাগরি বেছে নিন</label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const nextCat = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        category: nextCat,
                        gender: nextCat === 'Three Piece' ? 'Women' : prev.gender,
                      }));
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">কালেকশন ধরন</label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gender: e.target.value as 'Men' | 'Women' | 'Unisex',
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition"
                  >
                    <option value="Women">মহিলাদের কালেকশন (Women)</option>
                    <option value="Men">পুরুষদের কালেকশন (Men)</option>
                    <option value="Unisex">ইউনিসেক্স (Unisex)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">কেনা দাম (Cost Price)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="0"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">বিক্রয় মূল্য (Selling Price)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="0"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition font-mono"
                  />
                </div>
              </div>

              {/* Realtime Profit Margin Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calculator className="w-4 h-4 text-amber-400" />
                  <span>অটো লাভ হিসাব:</span>
                </div>
                <div
                  className={`font-mono font-bold text-sm tabular-nums ${
                    calculatedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  ৳{calculatedProfit}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">স্টক পরিমাণ</label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition font-mono"
                />
              </div>

              {/* Image Upload Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">প্রোডাক্টের ছবি সিলেক্ট করুন</label>
                <div className="border-2 border-dashed border-slate-800 rounded-2xl p-4 text-center bg-slate-950 hover:border-amber-400/50 transition">
                  {imagePreview ? (
                    <div className="relative w-24 h-24 mx-auto rounded-xl overflow-hidden border border-amber-400">
                      <Image src={imagePreview} alt="Preview" fill sizes="96px" className="object-cover" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-6 h-6 text-slate-500 mx-auto" />
                      <p className="text-xs text-slate-400">কম্পিউটার বা মোবাইল থেকে ছবি বেছে নিন</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mt-3 text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-400 file:text-slate-950 cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold py-3.5 rounded-xl transition shadow-lg shadow-amber-400/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{editingProduct ? 'পরিবর্তন কনফার্ম করুন' : 'প্রোডাক্ট সেভ করুন'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">নতুন ক্যাটাগরি তৈরি</h3>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-3">
              <input
                type="text"
                required
                placeholder="ক্যাটাগরির নাম..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition"
              />
              <button
                type="submit"
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                ক্যাটাগরি সেভ করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {pendingDeleteId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-5 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">প্রোডাক্ট মুছে ফেলতে চান?</h3>
              <p className="text-xs text-slate-400 mt-1">
                আপনি কি নিশ্চিত যে এই প্রোডাক্টটি ইনভেন্টরি ও স্টোর থেকে মুছে ফেলতে চান?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPendingDeleteId(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition cursor-pointer"
              >
                হ্যাঁ, মুছে ফেলুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
