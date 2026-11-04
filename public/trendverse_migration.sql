-- ============================================================================
-- TRENDVERSE E-Commerce & Inventory Control — Database Migration File
-- Brand: TRENDVERSE (দক্ষিণ মনিপুর, মিরপুর-২, ঢাকা-১২১৬)
-- Helpline / WhatsApp: 01930045168 | bKash Personal: 01759720739
-- Compatible with PostgreSQL / Supabase
-- ============================================================================

BEGIN;

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120) NOT NULL UNIQUE,
  bn_label VARCHAR(160),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products Table (Unique id & Unique sku enforced)
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(80) PRIMARY KEY,
  sku VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(120) NOT NULL DEFAULT 'Three Piece',
  gender VARCHAR(20) NOT NULL DEFAULT 'Women' CHECK (gender IN ('Men', 'Women', 'Unisex')),
  cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
  selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (selling_price >= 0),
  original_price NUMERIC(12, 2),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sold INTEGER NOT NULL DEFAULT 0 CHECK (sold >= 0),
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  image TEXT NOT NULL,
  description TEXT,
  badge VARCHAR(80),
  warranty VARCHAR(160),
  rating NUMERIC(3, 2) DEFAULT 4.90,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(80) PRIMARY KEY,
  order_date VARCHAR(120) NOT NULL,
  customer_name VARCHAR(180) NOT NULL,
  customer_phone VARCHAR(80) NOT NULL,
  customer_email VARCHAR(180),
  division VARCHAR(120) NOT NULL,
  delivery_address TEXT NOT NULL,
  notes TEXT,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(32) NOT NULL CHECK (payment_method IN ('cod', 'bkash', 'nagad', 'card')),
  payment_status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  trx_id VARCHAR(100),
  status VARCHAR(32) NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'shipped', 'delivered')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);

-- 4. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(80) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id VARCHAR(80) NOT NULL,
  sku VARCHAR(64),
  product_name VARCHAR(255) NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  line_total NUMERIC(12, 2) NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 5. Store Settings Table
CREATE TABLE IF NOT EXISTS store_settings (
  setting_key VARCHAR(80) PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Default Categories
INSERT INTO categories (id, name, bn_label) VALUES
  ('Three Piece', 'Three Piece', 'উইমেন্স থ্রি-পিস'),
  ('T-Shirts', 'T-Shirts', 'প্রিমিয়াম টি-শার্ট'),
  ('Jackets', 'Jackets', 'ডেনিম জ্যাকেট'),
  ('Hoodies', 'Hoodies', 'সিগনেচার হুডি'),
  ('Pants', 'Pants', 'প্যান্টস কালেকশন'),
  ('Accessories', 'Accessories', 'অ্যাক্সেসরিজ')
ON CONFLICT (id) DO NOTHING;

-- Seed Official Store Configuration
INSERT INTO store_settings (setting_key, setting_value) VALUES
  ('brand_name', 'TRENDVERSE'),
  ('office_address', 'দক্ষিণ মনিপুর, মিরপুর-২, ঢাকা-১২১৬'),
  ('helpline_whatsapp', '01930045168'),
  ('bkash_personal', '01759720739'),
  ('currency', 'BDT')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value;

-- Seed Initial Showcase Products
INSERT INTO products (
  id, sku, name, category, gender, cost_price, selling_price, original_price,
  stock, sold, in_stock, image, description, badge, warranty, rating, reviews_count
) VALUES
  (
    '1',
    'TV-3P-01',
    'TRENDVERSE Exclusive Cotton Three Piece',
    'Three Piece',
    'Women',
    1350,
    2450,
    2850,
    35,
    64,
    TRUE,
    '/images/cotton-three-piece.png',
    '১০০% পিওর কটন ফেব্রিকে সূক্ষ্ম এমব্রয়ডারি ও প্রিন্টেড ওড়না সমৃদ্ধ এক্সক্লুসিভ থ্রি-পিস কালেকশন।',
    'নতুন কালেকশন',
    '৭ দিনের সহজ এক্সচেঞ্জ সুবিধা',
    4.90,
    64
  ),
  (
    '2',
    'TV-3P-02',
    'Premium Designer Georgette Three Piece',
    'Three Piece',
    'Women',
    1850,
    3200,
    3750,
    25,
    49,
    TRUE,
    '/images/georgette-three-piece.png',
    'উৎসব ও পার্টি ওয়্যারের জন্য জরি ও সিকোয়েন্স কারুকাজ করা প্রিমিয়াম ডিজাইনার জর্জেট থ্রি-পিস।',
    'এক্সক্লুসিভ',
    '৭ দিনের সহজ এক্সচেঞ্জ সুবিধা',
    5.00,
    49
  ),
  (
    '3',
    'TV-101',
    'TRENDVERSE Oversized T-Shirt',
    'T-Shirts',
    'Men',
    450,
    950,
    1250,
    120,
    142,
    TRUE,
    '/images/oversized-tshirt.png',
    '২৪০ জিএসএম ১০০% কম্বড কটন ফেব্রিকে তৈরি প্রিমিয়াম ড্রপ-শোল্ডার ওভারসাইজড টি-শার্ট।',
    'বেস্টসেলার',
    '৭ দিনের সহজ সাইজ এক্সচেঞ্জ সুবিধা',
    4.90,
    142
  ),
  (
    '4',
    'TV-102',
    'Slim Fit Denim Jacket',
    'Jackets',
    'Men',
    1200,
    2450,
    2950,
    18,
    85,
    TRUE,
    '/images/denim-jacket.png',
    'ভিন্টেজ চারকোল-ইন্ডিগো ওয়াশ এবং প্রিমিয়াম মেটাল বাটন সমৃদ্ধ স্লিম ফিট ডেনিম জ্যাকেট।',
    'লিমিটেড রান',
    '৭ দিনের সহজ সাইজ এক্সচেঞ্জ সুবিধা',
    4.80,
    85
  )
ON CONFLICT (sku) DO NOTHING;

COMMIT;
