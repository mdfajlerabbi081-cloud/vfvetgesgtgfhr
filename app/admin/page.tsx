'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  ShieldCheck,
  Plus,
  Edit3,
  Trash2,
  Search,
  Inbox,
  X,
  Save,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import {
  loadAdminInventory,
  saveAdminInventory,
  createUniqueProductSku,
} from '@/src/data/products';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  sold: number;
  image?: string;
  gender?: 'Men' | 'Women' | 'Unisex';
}

function compressUploadedImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!rawDataUrl) {
        resolve('');
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
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

interface ErrorFreeAdminDashboardProps {
  onAddInventory?: () => void;
}

export default function ErrorFreeAdminDashboard({
  onAddInventory: _onAddInventory,
}: ErrorFreeAdminDashboardProps = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Three Piece',
    costPrice: '',
    sellingPrice: '',
    stock: '',
    sold: '',
    image: '',
  });

  // লোকাল মেমোরি থেকে নিরাপদভাবে কাস্টম ডাটা লোড (ইউনিক কি নিশ্চিতসহ)
  const syncProducts = useCallback(() => {
    try {
      const loaded = loadAdminInventory();
      const mapped: Product[] = loaded.map((p, idx) => ({
        id:
          p.id && String(p.id).trim()
            ? String(p.id).trim()
            : `prod_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
        sku: p.sku && String(p.sku).trim() ? String(p.sku).trim() : `TV-${101 + idx}`,
        name: p.name || '',
        category: p.category || 'Three Piece',
        costPrice: Number(p.costPrice) || 0,
        sellingPrice: Number(p.sellingPrice ?? p.price) || 0,
        stock: Number(p.stock) || 0,
        sold: Number(p.sold) || 0,
        image: p.image || '',
        gender: p.gender,
      }));
      setProducts(mapped);
    } catch (e) {
      console.error('Data parsing error:', e);
      setProducts([]);
    }
  }, []);

  useEffect(() => {
    syncProducts();
    window.addEventListener('trendverse_inventory_updated', syncProducts);
    window.addEventListener('storage', syncProducts);
    return () => {
      window.removeEventListener('trendverse_inventory_updated', syncProducts);
      window.removeEventListener('storage', syncProducts);
    };
  }, [syncProducts]);

  const saveProductsToStorage = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    saveAdminInventory(
      updatedProducts.map((p) => ({
        ...p,
        price: p.sellingPrice,
      }))
    );
  };

  // ডাইনামিক রিয়েল-টাইম হিসাবসমূহ
  const totalRevenue = products.reduce((sum, p) => sum + p.sellingPrice * p.sold, 0);
  const totalCost = products.reduce(
    (sum, p) => sum + p.costPrice * (p.stock + p.sold),
    0
  );
  const netProfit =
    totalRevenue - products.reduce((sum, p) => sum + p.costPrice * p.sold, 0);
  const lowStockCount = products.filter((p) => p.stock <= 5).length;

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category || 'Three Piece',
      costPrice: product.costPrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      stock: product.stock.toString(),
      sold: product.sold.toString(),
      image: product.image || '',
    });
    setIsModalOpen(true);
  };

  const confirmDeleteProduct = () => {
    if (!confirmDeleteId) return;
    const updated = products.filter((p) => p.id !== confirmDeleteId);
    saveProductsToStorage(updated);
    setConfirmDeleteId(null);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await compressUploadedImage(file);
    if (dataUrl) {
      setFormData((prev) => ({ ...prev, image: dataUrl }));
    }
    e.target.value = '';
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProduct) {
      const updated = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: formData.name.trim(),
              category: formData.category,
              costPrice: Number(formData.costPrice) || 0,
              sellingPrice: Number(formData.sellingPrice) || 0,
              stock: Number(formData.stock) || 0,
              sold: Number(formData.sold) || 0,
              image: formData.image.trim(),
            }
          : p
      );
      saveProductsToStorage(updated);
    } else {
      // ইউনিক কি (Unique Key Error সমাধানের জন্য)
      const uniqueId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const existingSkus = products.map((p) => p.sku);
      const uniqueSku = createUniqueProductSku(existingSkus, 'TV');

      const newProduct: Product = {
        id: uniqueId,
        sku: uniqueSku,
        name: formData.name.trim(),
        category: formData.category,
        costPrice: Number(formData.costPrice) || 0,
        sellingPrice: Number(formData.sellingPrice) || 0,
        stock: Number(formData.stock) || 0,
        sold: Number(formData.sold) || 0,
        image: formData.image.trim(),
      };
      saveProductsToStorage([newProduct, ...products]);
    }

    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Three Piece',
      costPrice: '',
      sellingPrice: '',
      stock: '',
      sold: '',
      image: '',
    });
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans text-slate-100">
      {/* ১. ড্যাশবোর্ড হেডার */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400 shadow-lg shadow-amber-500/10 shrink-0 bg-slate-950">
            <Image
              src="/logo.png"
              alt="TRENDVERSE Logo"
              fill
              sizes="56px"
              className="object-cover"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wide text-white flex items-center gap-2 uppercase">
              <span>
                TREND<span className="text-amber-400">VERSE</span> কন্ট্রোল সেন্টার
              </span>
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              রিয়েল-টাইম ইনভেন্টরি ও প্রোডাক্ট কাস্টমাইজেশন প্যানেল
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingProduct(null);
            setFormData({
              name: '',
              category: 'Three Piece',
              costPrice: '',
              sellingPrice: '',
              stock: '',
              sold: '',
              image: '',
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-5 py-3 rounded-xl transition shadow-lg shadow-amber-400/10 text-xs cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>নতুন প্রোডাক্ট যোগ করুন</span>
        </button>
      </div>

      {/* ২. রিয়েল-টাইম হিসাবের কার্ডস */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs text-slate-400 mb-1">মোট বিক্রয় (Total Revenue)</div>
          <div className="text-2xl font-black text-white font-mono tabular-nums">
            ৳ {totalRevenue.toLocaleString('bn-BD')}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs text-slate-400 mb-1">মোট কেনা বাজেট (Cost)</div>
          <div className="text-2xl font-black text-white font-mono tabular-nums">
            ৳ {totalCost.toLocaleString('bn-BD')}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs text-slate-400 mb-1">নিট লাভ (Net Profit)</div>
          <div className="text-2xl font-black text-amber-400 font-mono tabular-nums">
            ৳ {netProfit.toLocaleString('bn-BD')}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="text-xs text-slate-400 mb-1">স্টক অ্যালার্ট (Low Stock)</div>
          <div className="text-2xl font-black text-white font-mono tabular-nums">
            {lowStockCount} টি আইটেম
          </div>
        </div>
      </div>

      {/* ৩. সম্পূর্ণ নির্ভুল ডাইনামিক ডাটা টেবিল */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              প্রোডাক্ট এর বিস্তারিত হিসাব
            </h2>
            <p className="text-xs text-slate-400">
              আপনার যুক্ত করা পণ্যের তালিকা ও লাইভ স্টক
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="SKU বা প্রোডাক্ট নাম..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Inbox className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">কোনো ডাটা অবশিষ্ট নেই</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              কোনো অগ্রিম ফেক ডাটা রাখা নেই। নতুন প্রোডাক্ট যোগ করতে উপরের বাটনে ক্লিক করুন।
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">SKU CODE</th>
                  <th className="p-3">প্রোডাক্ট নাম</th>
                  <th className="p-3">কেনা দাম</th>
                  <th className="p-3">বিক্রয় মূল্য</th>
                  <th className="p-3">স্টক</th>
                  <th className="p-3">মোট বিক্রি</th>
                  <th className="p-3 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono text-amber-400 font-bold whitespace-nowrap">
                      {p.sku}
                    </td>
                    <td className="p-3 font-bold text-white">{p.name}</td>
                    <td className="p-3 font-mono tabular-nums text-rose-400 whitespace-nowrap">
                      ৳ {p.costPrice.toLocaleString('bn-BD')}
                    </td>
                    <td className="p-3 font-mono tabular-nums text-emerald-400 font-bold whitespace-nowrap">
                      ৳ {p.sellingPrice.toLocaleString('bn-BD')}
                    </td>
                    <td className="p-3 font-mono tabular-nums whitespace-nowrap">
                      {p.stock} টি
                    </td>
                    <td className="p-3 font-mono tabular-nums whitespace-nowrap">
                      {p.sold} টি
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(p)}
                          className="p-1.5 bg-slate-800 text-amber-400 rounded-lg hover:bg-slate-700 cursor-pointer transition"
                          title="সম্পাদনা করুন"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(p.id)}
                          className="p-1.5 bg-slate-800 text-rose-400 rounded-lg hover:bg-rose-500/20 cursor-pointer transition"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ৪. প্রোডাক্ট যোগ/সম্পাদনার মোডাল */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white uppercase">
                {editingProduct ? 'প্রোডাক্ট তথ্য সংশোধন' : 'নতুন প্রোডাক্ট ইনপুট'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
                aria-label="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">
                    প্রোডাক্টের নাম
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cotton Three Piece"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    ক্যাটাগরি
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                  >
                    <option value="Three Piece">Three Piece</option>
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Jackets">Jackets</option>
                    <option value="Hoodies">Hoodies</option>
                    <option value="Pants">Pants</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    কেনা দাম
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="0"
                    value={formData.costPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, costPrice: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono tabular-nums focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    বিক্রয় মূল্য
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="0"
                    value={formData.sellingPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, sellingPrice: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono tabular-nums focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    স্টক পরিমাণ
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono tabular-nums focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    বিক্রি সংখ্যা
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.sold}
                    onChange={(e) => setFormData({ ...formData, sold: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono tabular-nums focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* ঐচ্ছিক প্রোডাক্ট ছবি আপলোড বা লিংক */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  প্রোডাক্ট ছবি (ঐচ্ছিক — ফাইল আপলোড বা ইমেজ লিংক)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="https://... অথবা নিচের আপলোড বাটন ব্যবহার করুন"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
                  />
                  <label className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 px-3 py-2 rounded-xl font-bold cursor-pointer whitespace-nowrap transition">
                    <Upload className="w-3.5 h-3.5 shrink-0" />
                    <span>আপলোড</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-3 rounded-xl transition flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <Save className="w-4 h-4 shrink-0" />
                <span>
                  {editingProduct ? 'পরিবর্তন কনফার্ম করুন' : 'প্রোডাক্ট সেভ করুন'}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ৫. প্রোডাক্ট ডিলিট কনফার্মেশন মোডাল (iframe-safe) */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">প্রোডাক্ট মুছে ফেলবেন?</h4>
              <p className="text-xs text-slate-400">
                আপনি কি নিশ্চিত যে এই প্রোডাক্টটি মুছে ফেলতে চান?
              </p>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition cursor-pointer"
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
