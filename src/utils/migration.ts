import { Product, Order, getUnitPrice } from '@/types/product';
import {
  loadAdminInventory,
  loadSyncedInventory,
  saveAdminInventory,
  normalizeStoredProduct,
} from '@/src/data/products';

export interface TrendverseMigrationBundle {
  schemaVersion: string;
  exportedAt: string;
  storeInfo: {
    brand: string;
    address: string;
    helplineWhatsapp: string;
    bkashPersonal: string;
    currency: string;
  };
  categories: string[];
  adminProducts: Product[];
  catalogProducts: Product[];
  orders: Order[];
}

const DEFAULT_CATEGORIES = [
  'Three Piece',
  'T-Shirts',
  'Jackets',
  'Hoodies',
  'Pants',
  'Accessories',
];

function sqlEscape(val: unknown): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return Number.isFinite(val) ? String(val) : '0';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  return `'${String(val).replace(/'/g, "''")}'`;
}

export function loadSavedCategories(): string[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES;
  try {
    const raw = localStorage.getItem('trendverse_custom_categories');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return Array.from(
          new Set(
            ['Three Piece', ...parsed]
              .map((c) => (typeof c === 'string' ? c.trim() : ''))
              .filter(Boolean)
          )
        );
      }
    }
  } catch {}
  return DEFAULT_CATEGORIES;
}

export function loadSavedOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('trendverse_orders');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function buildJsonMigrationBundle(): TrendverseMigrationBundle {
  const adminProducts = loadAdminInventory();
  const catalogProducts = loadSyncedInventory();
  const categories = loadSavedCategories();
  const orders = loadSavedOrders();

  return {
    schemaVersion: '1.0.0',
    exportedAt: new Date().toISOString(),
    storeInfo: {
      brand: 'TRENDVERSE',
      address: 'দক্ষিণ মনিপুর, মিরপুর-২, ঢাকা-১২১৬',
      helplineWhatsapp: '01930045168',
      bkashPersonal: '01759720739',
      currency: 'BDT',
    },
    categories,
    adminProducts,
    catalogProducts,
    orders,
  };
}

export function buildSqlMigrationString(): string {
  const bundle = buildJsonMigrationBundle();
  const lines: string[] = [
    '-- ============================================================================',
    '-- TRENDVERSE E-Commerce & Inventory — Live SQL Migration Export',
    `-- Exported At: ${bundle.exportedAt}`,
    `-- Address: ${bundle.storeInfo.address}`,
    `-- Helpline/WhatsApp: ${bundle.storeInfo.helplineWhatsapp} | bKash: ${bundle.storeInfo.bkashPersonal}`,
    '-- ============================================================================',
    '',
    'BEGIN;',
    '',
    'CREATE TABLE IF NOT EXISTS categories (',
    '  id VARCHAR(64) PRIMARY KEY,',
    '  name VARCHAR(120) NOT NULL UNIQUE,',
    '  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
    ');',
    '',
    'CREATE TABLE IF NOT EXISTS products (',
    '  id VARCHAR(80) PRIMARY KEY,',
    '  sku VARCHAR(64) NOT NULL UNIQUE,',
    '  name VARCHAR(255) NOT NULL,',
    "  category VARCHAR(120) NOT NULL DEFAULT 'Three Piece',",
    "  gender VARCHAR(20) NOT NULL DEFAULT 'Women',",
    '  cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0,',
    '  selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0,',
    '  stock INTEGER NOT NULL DEFAULT 0,',
    '  sold INTEGER NOT NULL DEFAULT 0,',
    '  in_stock BOOLEAN NOT NULL DEFAULT TRUE,',
    '  image TEXT NOT NULL,',
    '  description TEXT,',
    '  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
    ');',
    '',
    'CREATE TABLE IF NOT EXISTS orders (',
    '  id VARCHAR(80) PRIMARY KEY,',
    '  order_date VARCHAR(120) NOT NULL,',
    '  customer_name VARCHAR(180) NOT NULL,',
    '  customer_phone VARCHAR(80) NOT NULL,',
    '  division VARCHAR(120) NOT NULL,',
    '  delivery_address TEXT NOT NULL,',
    '  notes TEXT,',
    '  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,',
    '  delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,',
    '  discount NUMERIC(12, 2) NOT NULL DEFAULT 0,',
    '  total NUMERIC(12, 2) NOT NULL DEFAULT 0,',
    '  payment_method VARCHAR(32) NOT NULL,',
    '  payment_status VARCHAR(32) NOT NULL,',
    '  trx_id VARCHAR(100),',
    '  status VARCHAR(32) NOT NULL,',
    '  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP',
    ');',
    '',
    'CREATE TABLE IF NOT EXISTS order_items (',
    '  id SERIAL PRIMARY KEY,',
    '  order_id VARCHAR(80) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,',
    '  product_id VARCHAR(80) NOT NULL,',
    '  sku VARCHAR(64),',
    '  product_name VARCHAR(255) NOT NULL,',
    '  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,',
    '  quantity INTEGER NOT NULL DEFAULT 1,',
    '  line_total NUMERIC(12, 2) NOT NULL DEFAULT 0',
    ');',
    '',
  ];

  if (bundle.categories.length > 0) {
    lines.push('-- Categories Seed Data');
    for (const cat of bundle.categories) {
      lines.push(
        `INSERT INTO categories (id, name) VALUES (${sqlEscape(cat)}, ${sqlEscape(
          cat
        )}) ON CONFLICT (id) DO NOTHING;`
      );
    }
    lines.push('');
  }

  const productsToExport =
    bundle.adminProducts.length > 0 ? bundle.adminProducts : bundle.catalogProducts;

  if (productsToExport.length > 0) {
    lines.push('-- Products Seed Data');
    for (const p of productsToExport) {
      const selling = Number(p.sellingPrice ?? p.price ?? 0);
      const cost = Number(p.costPrice ?? 0);
      const stock = Number(p.stock ?? 0);
      const sold = Number(p.sold ?? 0);
      lines.push(
        `INSERT INTO products (id, sku, name, category, gender, cost_price, selling_price, stock, sold, in_stock, image, description) VALUES (${sqlEscape(
          p.id
        )}, ${sqlEscape(p.sku || p.id)}, ${sqlEscape(p.name)}, ${sqlEscape(
          p.category
        )}, ${sqlEscape(p.gender || 'Women')}, ${sqlEscape(cost)}, ${sqlEscape(
          selling
        )}, ${sqlEscape(stock)}, ${sqlEscape(sold)}, ${sqlEscape(
          stock > 0
        )}, ${sqlEscape(p.image)}, ${sqlEscape(
          p.description || ''
        )}) ON CONFLICT (sku) DO UPDATE SET name = EXCLUDED.name, cost_price = EXCLUDED.cost_price, selling_price = EXCLUDED.selling_price, stock = EXCLUDED.stock, sold = EXCLUDED.sold;`
      );
    }
    lines.push('');
  }

  if (bundle.orders.length > 0) {
    lines.push('-- Orders & Order Items Seed Data');
    for (const ord of bundle.orders) {
      lines.push(
        `INSERT INTO orders (id, order_date, customer_name, customer_phone, division, delivery_address, notes, subtotal, delivery_fee, discount, total, payment_method, payment_status, trx_id, status) VALUES (${sqlEscape(
          ord.id
        )}, ${sqlEscape(ord.date)}, ${sqlEscape(
          ord.customer?.fullName || ''
        )}, ${sqlEscape(ord.customer?.phone || '')}, ${sqlEscape(
          ord.customer?.division || ''
        )}, ${sqlEscape(ord.customer?.address || '')}, ${sqlEscape(
          ord.customer?.notes || ''
        )}, ${sqlEscape(ord.subtotal)}, ${sqlEscape(
          ord.deliveryFee
        )}, ${sqlEscape(ord.discount)}, ${sqlEscape(ord.total)}, ${sqlEscape(
          ord.paymentMethod
        )}, ${sqlEscape(ord.paymentStatus)}, ${sqlEscape(
          ord.trxId || null
        )}, ${sqlEscape(ord.status)}) ON CONFLICT (id) DO NOTHING;`
      );

      if (Array.isArray(ord.items)) {
        for (const item of ord.items) {
          const unit = getUnitPrice(item);
          lines.push(
            `INSERT INTO order_items (order_id, product_id, sku, product_name, unit_price, quantity, line_total) VALUES (${sqlEscape(
              ord.id
            )}, ${sqlEscape(item.id)}, ${sqlEscape(item.sku || item.id)}, ${sqlEscape(
              item.name
            )}, ${sqlEscape(unit)}, ${sqlEscape(item.quantity)}, ${sqlEscape(
              unit * item.quantity
            )});`
          );
        }
      }
    }
    lines.push('');
  }

  lines.push('COMMIT;');
  return lines.join('\n');
}

function triggerFileDownload(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadSqlMigrationFile(): void {
  const sql = buildSqlMigrationString();
  const dateStamp = new Date().toISOString().slice(0, 10);
  triggerFileDownload(
    `trendverse_migration_${dateStamp}.sql`,
    sql,
    'application/sql;charset=utf-8'
  );
}

export function downloadJsonMigrationFile(): void {
  const bundle = buildJsonMigrationBundle();
  const dateStamp = new Date().toISOString().slice(0, 10);
  triggerFileDownload(
    `trendverse_migration_${dateStamp}.json`,
    JSON.stringify(bundle, null, 2),
    'application/json;charset=utf-8'
  );
}

export async function downloadWebsiteZipFile(): Promise<void> {
  let adminToken = '';
  try {
    adminToken = sessionStorage.getItem('trendverse_admin_session') || '';
  } catch {}

  const headers: Record<string, string> = {};
  if (adminToken) {
    headers['Authorization'] = `Bearer ${adminToken}`;
  }

  const response = await fetch('/api/admin/export-zip', {
    method: 'GET',
    credentials: 'include',
    headers,
  });

  if (response.status === 403) {
    throw new Error(
      'অনুমতি নেই! শুধুমাত্র TRENDVERSE এডমিন এই জিপ ফাইল ডাউনলোড করতে পারবেন।'
    );
  }
  if (!response.ok) {
    throw new Error('ZIP ফাইল ডাউনলোড ব্যর্থ হয়েছে।');
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `TRENDVERSE_Inventory_Data_${Date.now()}.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export async function importJsonMigrationFile(
  file: File
): Promise<{ productsCount: number; ordersCount: number; categoriesCount: number }> {
  const text = await file.text();
  const parsed = JSON.parse(text);

  const rawProducts: Partial<Product>[] = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.adminProducts) && parsed.adminProducts.length > 0
    ? parsed.adminProducts
    : Array.isArray(parsed?.products)
    ? parsed.products
    : Array.isArray(parsed?.catalogProducts)
    ? parsed.catalogProducts
    : [];

  const seenIds = new Set<string>();
  const seenSkus = new Set<string>();
  const normalizedProducts = rawProducts.map((item, idx) =>
    normalizeStoredProduct(item, idx, seenIds, seenSkus)
  );

  saveAdminInventory(normalizedProducts);

  let categoriesCount = 0;
  if (Array.isArray(parsed?.categories) && parsed.categories.length > 0) {
    const cleanCats = Array.from(
      new Set(
        ['Three Piece', ...parsed.categories]
          .map((c: unknown) => (typeof c === 'string' ? c.trim() : ''))
          .filter(Boolean)
      )
    );
    localStorage.setItem('trendverse_custom_categories', JSON.stringify(cleanCats));
    categoriesCount = cleanCats.length;
  }

  let ordersCount = 0;
  if (Array.isArray(parsed?.orders)) {
    localStorage.setItem('trendverse_orders', JSON.stringify(parsed.orders));
    ordersCount = parsed.orders.length;
  }

  window.dispatchEvent(new Event('trendverse_inventory_updated'));
  window.dispatchEvent(new Event('storage'));

  return {
    productsCount: normalizedProducts.length,
    ordersCount,
    categoriesCount,
  };
}
