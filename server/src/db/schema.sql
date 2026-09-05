-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- stored in cents/toman
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  category TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  total_amount INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  payment_id TEXT, -- zarinpal authority/id
  shipping_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL, -- price at time of order
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Cart table (server-side cart for persistence)
CREATE TABLE IF NOT EXISTS cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  UNIQUE(user_id, product_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);

-- Seed data
INSERT OR IGNORE INTO users (email, password_hash, name, role) VALUES 
  ('admin@shop.com', '$2b$10$dummyhash', 'Admin User', 'admin'),
  ('user@shop.com', '$2b$10$dummyhash', 'Test User', 'user');

INSERT OR IGNORE INTO products (name, description, price, image_url, stock, category, is_active) VALUES
  ('لپ تاپ گیمینگ ASUS ROG', 'لپ تاپ قدرتمند گیمینگ با کارت گرافیک RTX 4070', 45000000, 'https://picsum.photos/seed/laptop1/400/300', 10, 'لپ تاپ', 1),
  ('موبایل سامسونگ گلکسی S24', 'پرچمدار جدید سامسونگ با هوش مصنوعی', 32000000, 'https://picsum.photos/seed/phone1/400/300', 15, 'موبایل', 1),
  ('هدفون سونی WH-1000XM5', 'بهترین هدفون نویز کنسلینگ بازار', 12000000, 'https://picsum.photos/seed/headphone1/400/300', 20, 'لوازم جانبی', 1),
  ('کیبورد مکانیکی Keychron K2', 'کیبورد مکانیکی بی‌سیم برای برنامه‌نویسان', 4500000, 'https://picsum.photos/seed/keyboard1/400/300', 30, 'لوازم جانبی', 1),
  ('مانیتور ال جی 27 اینچ 4K', 'مانیتور حرفه‌ای با دقت 4K و HDR', 18000000, 'https://picsum.photos/seed/monitor1/400/300', 8, 'نمایشگر', 1),
  ('ماوس گیمینگ رेजر DeathAdder', 'ماوس ارگونومیک با سنسور 20K DPI', 2500000, 'https://picsum.photos/seed/mouse1/400/300', 25, 'لوازم جانبی', 1);