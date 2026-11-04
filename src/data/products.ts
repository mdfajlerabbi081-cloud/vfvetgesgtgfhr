import { Product } from '@/types/product';
import { BRAND_IMAGES, resolveBrandImage } from '@/src/assets/brandAssets';

export const HERO_EDITORIAL_IMAGE = BRAND_IMAGES.heroEditorial;

export const CATEGORY_SHOWCASE = [
  {
    id: 'Three Piece',
    name: 'Three Piece',
    bnLabel: 'উইমেন্স থ্রি-পিস',
    count: 'নতুন কালেকশন',
    image: BRAND_IMAGES.cottonThreePiece,
  },
  {
    id: 'T-Shirts',
    name: 'T-Shirts',
    bnLabel: 'প্রিমিয়াম টি-শার্ট',
    count: '২৫+ আইটেম',
    image: BRAND_IMAGES.oversizedTshirt,
  },
  {
    id: 'Jackets',
    name: 'Denim Jackets',
    bnLabel: 'ডেনিম জ্যাকেট',
    count: '১২+ আইটেম',
    image: BRAND_IMAGES.denimJacket,
  },
  {
    id: 'Hoodies',
    name: 'Premium Hoodies',
    bnLabel: 'সিগনেচার হুডি',
    count: '১৮+ আইটেম',
    image: BRAND_IMAGES.heavyHoodie,
  },
] as const;

export const PRODUCTS: Product[] = [
  {
    id: '1',
    sku: 'TV-3P-01',
    name: 'TRENDVERSE Exclusive Cotton Three Piece',
    category: 'Three Piece',
    gender: 'Women',
    costPrice: 1350,
    sellingPrice: 2450,
    price: 2450,
    originalPrice: 2850,
    stock: 35,
    sold: 64,
    image: BRAND_IMAGES.cottonThreePiece,
    description:
      '১০০% পিওর কটন ফেব্রিকে সূক্ষ্ম এমব্রয়ডারি ও প্রিন্টেড ওড়না সমৃদ্ধ এক্সক্লুসিভ থ্রি-পিস কালেকশন।',
    rating: 4.9,
    reviewsCount: 64,
    inStock: true,
    warranty: '৭ দিনের সহজ এক্সচেঞ্জ সুবিধা',
    badge: 'নতুন কালেকশন',
    features: [
      '১০০% সফট ব্রিদেবল সুতি কামিজ ও সালোয়ার',
      'নিখুঁত সূচিকর্ম ও প্রিমিয়াম ফিনিশিং',
      'প্রশস্ত ২.৫ হাত ম্যাচিং প্রিন্টেড কটন ওড়না',
      'কালার ও ফেব্রিক কোয়ালিটি গ্যারান্টি',
    ],
    specs: [
      { label: 'ফেব্রিক', value: '১০০% এক্সক্লুসিভ কটন' },
      { label: 'কালেকশন', value: 'মহিলাদের থ্রি-পিস (Women)' },
      { label: 'সাইজ / ধরন', value: 'আনস্টিচড ও ফ্রি-সাইজ রেডি' },
    ],
  },
  {
    id: '2',
    sku: 'TV-3P-02',
    name: 'Premium Designer Georgette Three Piece',
    category: 'Three Piece',
    gender: 'Women',
    costPrice: 1850,
    sellingPrice: 3200,
    price: 3200,
    originalPrice: 3750,
    stock: 25,
    sold: 49,
    image: BRAND_IMAGES.georgetteThreePiece,
    description:
      'উৎসব ও পার্টি ওয়্যারের জন্য জরি ও সিকোয়েন্স কারুকাজ করা প্রিমিয়াম ডিজাইনার জর্জেট থ্রি-পিস।',
    rating: 5.0,
    reviewsCount: 49,
    inStock: true,
    warranty: '৭ দিনের সহজ এক্সচেঞ্জ সুবিধা',
    badge: 'এক্সক্লুসিভ',
    features: [
      'প্রিমিয়াম সফট জর্জেট ফেব্রিক ও ইনার লাইনিং সাপোর্ট',
      'আভিজাত্যপূর্ণ গোল্ডেন জরি এমব্রয়ডারি ডিজাইন',
      'ম্যাচিং জর্জেট ওড়না ও আরামদায়ক সালোয়ার পিস',
      'যেকোনো উৎসব ও দাওয়াতে অনন্য লুক',
    ],
    specs: [
      { label: 'ফেব্রিক', value: 'প্রিমিয়াম ডিজাইনার জর্জেট' },
      { label: 'কালেকশন', value: 'মহিলাদের থ্রি-পিস (Women)' },
      { label: 'সাইজ / ধরন', value: 'আনস্টিচড ও কাস্টম ফিট' },
    ],
  },
  {
    id: '3',
    sku: 'TV-101',
    name: 'TRENDVERSE Oversized T-Shirt',
    category: 'T-Shirts',
    gender: 'Men',
    costPrice: 450,
    sellingPrice: 950,
    price: 950,
    originalPrice: 1250,
    stock: 120,
    sold: 142,
    image: BRAND_IMAGES.oversizedTshirt,
    description:
      '২৪০ জিএসএম ১০০% কম্বড কটন ফেব্রিকে তৈরি প্রিমিয়াম ড্রপ-শোল্ডার ওভারসাইজড টি-শার্ট।',
    rating: 4.9,
    reviewsCount: 142,
    inStock: true,
    warranty: '৭ দিনের সহজ সাইজ এক্সচেঞ্জ সুবিধা',
    badge: 'বেস্টসেলার',
    features: [
      '২৪০ GSM হেভিওয়েট ১০০% অর্গানিক কম্বড কটন',
      'প্রি-শ্রাঙ্ক ও কালার গ্যারান্টি ওয়াশ ফিনিশ',
      'মডার্ন রিল্যাক্সড ড্রপ-শোল্ডার ফিট',
      'ডাবল-স্টিচড রিবড কলার',
    ],
    specs: [
      { label: 'ফেব্রিক', value: '২৪০ GSM ১০০% কটন' },
      { label: 'কালেকশন', value: 'পুরুষদের কালেকশন (Men)' },
      { label: 'সাইজ', value: 'M, L, XL, XXL' },
    ],
  },
  {
    id: '4',
    sku: 'TV-102',
    name: 'Slim Fit Denim Jacket',
    category: 'Jackets',
    gender: 'Men',
    costPrice: 1200,
    sellingPrice: 2450,
    price: 2450,
    originalPrice: 2950,
    stock: 18,
    sold: 85,
    image: BRAND_IMAGES.denimJacket,
    description:
      'ভিন্টেজ চারকোল-ইন্ডিগো ওয়াশ এবং প্রিমিয়াম মেটাল বাটন সমৃদ্ধ স্লিম ফিট ডেনিম জ্যাকেট।',
    rating: 4.8,
    reviewsCount: 85,
    inStock: true,
    warranty: '৭ দিনের সহজ সাইজ এক্সচেঞ্জ সুবিধা',
    badge: 'লিমিটেড রান',
    features: [
      '১৩.৫ আউন্স প্রিমিয়াম র-ওয়াশ ডেনিম ফেব্রিক',
      'অ্যান্টিক ব্রাস মেটাল বাটন ফিনিশিং',
      'দুই পাশে ডিপ হ্যান্ড ওয়ার্মার ও চেস্ট পকেট',
      'সকল ঋতুতে লেয়ারিংয়ের জন্য আদর্শ',
    ],
    specs: [
      { label: 'ফেব্রিক', value: '১৩.৫ oz প্রিমিয়াম ডেনিম' },
      { label: 'কালেকশন', value: 'পুরুষদের কালেকশন (Men)' },
      { label: 'সাইজ', value: 'M, L, XL' },
    ],
  },
];

export const CATEGORIES = [
  { id: 'all', label: 'সব কালেকশন' },
  { id: 'Three Piece', label: 'Three Piece' },
  { id: 'T-Shirts', label: 'T-Shirts' },
  { id: 'Jackets', label: 'Jackets' },
  { id: 'Hoodies', label: 'Hoodies' },
  { id: 'Pants', label: 'Pants' },
  { id: 'Accessories', label: 'Accessories' },
] as const;

export const BANGLADESH_DIVISIONS = [
  'ঢাকা বিভাগ (Dhaka)',
  'চট্টগ্রাম বিভাগ (Chittagong)',
  'রাজশাহী বিভাগ (Rajshahi)',
  'খুলনা বিভাগ (Khulna)',
  'সিলেট বিভাগ (Sylhet)',
  'বরিশাল বিভাগ (Barishal)',
  'রংপুর বিভাগ (Rangpur)',
  'ময়মনসিংহ বিভাগ (Mymensingh)',
];

export const PRODUCTS_STORAGE_KEY = 'trendverse_products';
export const ADMIN_INVENTORY_STORAGE_KEY = 'trendverse_admin_products';

export function inferProductGender(item: {
  gender?: string;
  category?: string;
  name?: string;
}): 'Men' | 'Women' | 'Unisex' {
  if (item.gender === 'Women' || item.gender === 'Men' || item.gender === 'Unisex') {
    return item.gender;
  }
  const cat = (item.category || '').toLowerCase();
  const nm = (item.name || '').toLowerCase();
  if (
    cat.includes('three piece') ||
    cat.includes('থ্রি-পিস') ||
    cat.includes('women') ||
    nm.includes('three piece') ||
    nm.includes('থ্রি-পিস')
  ) {
    return 'Women';
  }
  return 'Men';
}

export function createUniqueProductId(prefix = 'tv'): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${rand}`;
}

export function createUniqueProductSku(
  existingSkus?: Iterable<string>,
  prefix = 'TV'
): string {
  const taken = new Set<string>();
  if (existingSkus) {
    for (const sku of existingSkus) {
      if (typeof sku === 'string' && sku.trim()) {
        taken.add(sku.trim().toUpperCase());
      }
    }
  }

  const normalizedPrefix = prefix.trim().toUpperCase() || 'TV';
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const num =
      normalizedPrefix === 'TV-3P'
        ? Math.floor(10 + Math.random() * 90)
        : Math.floor(100 + Math.random() * 900);
    const candidate = `${normalizedPrefix}-${num}`;
    if (!taken.has(candidate)) {
      return candidate;
    }
  }

  return `${normalizedPrefix}-${Date.now().toString().slice(-4)}-${Math.random()
    .toString(36)
    .slice(2, 4)
    .toUpperCase()}`;
}

export function normalizeStoredProduct(
  p: Partial<Product>,
  idx: number,
  seenIds?: Set<string>,
  seenSkus?: Set<string>
): Product {
  const selling = Number(p.sellingPrice ?? p.price ?? 0);
  const category = (typeof p.category === 'string' && p.category.trim()) || 'Three Piece';
  const gender = inferProductGender({
    gender: p.gender,
    category,
    name: p.name,
  });

  const rawId =
    typeof p.id === 'string'
      ? p.id.trim()
      : p.id != null
      ? String(p.id).trim()
      : '';

  let resolvedId = rawId || `tv-admin-${idx + 1}`;
  if (seenIds) {
    while (seenIds.has(resolvedId)) {
      resolvedId = `${rawId || 'tv-admin'}-${idx + 1}-${Math.random().toString(36).slice(2, 6)}`;
    }
    seenIds.add(resolvedId);
  }

  const rawSku =
    typeof p.sku === 'string'
      ? p.sku.trim()
      : p.sku != null
      ? String(p.sku).trim()
      : '';

  let resolvedSku = rawSku || `TV-${101 + idx}`;
  if (seenSkus) {
    while (seenSkus.has(resolvedSku.toUpperCase())) {
      resolvedSku = createUniqueProductSku(
        seenSkus,
        gender === 'Women' ? 'TV-3P' : 'TV'
      );
    }
    seenSkus.add(resolvedSku.toUpperCase());
  }

  const rawImage = typeof p.image === 'string' ? p.image.trim() : '';

  return {
    ...p,
    id: resolvedId,
    sku: resolvedSku,
    name: (typeof p.name === 'string' && p.name.trim()) || 'TRENDVERSE Apparel',
    category,
    gender,
    costPrice: Number(p.costPrice ?? 0),
    sellingPrice: selling,
    price: selling,
    stock: Number(p.stock ?? 0),
    sold: Number(p.sold ?? 0),
    inStock: Number(p.stock ?? 0) > 0,
    image: rawImage ? resolveBrandImage(rawImage) : '',
    description:
      p.description ||
      `${p.name || 'TRENDVERSE'} — ১০০% অরিজিনাল প্রিমিয়াম কালেকশন।`,
    rating: p.rating ?? 4.9,
    reviewsCount: p.reviewsCount ?? 0,
  };
}

/**
 * Loads ONLY the admin's real custom entries from trendverse_products (or legacy trendverse_admin_products).
 * 100% blank by default — zero preset products and zero preset images.
 */
export function loadAdminInventory(): Product[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawSaved =
      localStorage.getItem(ADMIN_INVENTORY_STORAGE_KEY) ??
      localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!rawSaved) return [];
    const parsedSaved = JSON.parse(rawSaved);
    if (!Array.isArray(parsedSaved)) return [];
    const seenIds = new Set<string>();
    const seenSkus = new Set<string>();
    return parsedSaved.map((item, idx) =>
      normalizeStoredProduct(item, idx, seenIds, seenSkus)
    );
  } catch {
    return [];
  }
}

export function saveAdminInventory(items: Partial<Product>[]): void {
  if (typeof window === 'undefined') return;
  try {
    const seenIds = new Set<string>();
    const seenSkus = new Set<string>();
    const normalized = items.map((item, idx) =>
      normalizeStoredProduct(item, idx, seenIds, seenSkus)
    );
    const serialized = JSON.stringify(normalized);
    localStorage.setItem(PRODUCTS_STORAGE_KEY, serialized);
    localStorage.setItem(ADMIN_INVENTORY_STORAGE_KEY, serialized);
    window.dispatchEvent(new Event('trendverse_inventory_updated'));
  } catch (err) {
    console.error('Failed to persist admin inventory', err);
  }
}

/**
 * Loads dynamic storefront catalog strictly from admin-added products (no preset showcase items).
 */
export function loadSyncedInventory(): Product[] {
  return loadAdminInventory();
}
