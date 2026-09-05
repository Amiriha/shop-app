import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import db from './db/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Auth middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin only' });
  }
  next();
};

// Auth routes
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  
  const stmt = db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)');
  try {
    const result = stmt.run(email, password, name); // In production, hash password!
    const token = jwt.sign({ id: result.lastInsertRowid, email, name, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: result.lastInsertRowid, email, name, role: 'user' } });
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    throw e;
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ? AND password_hash = ?').get(email, password); // In production, compare hash!
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Product routes
app.get('/api/products', (req, res) => {
  const { category, search, page = 1, limit = 12 } = req.query;
  let query = 'SELECT * FROM products WHERE is_active = 1';
  const params = [];
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), (Number(page) - 1) * Number(limit));
  
  const products = db.prepare(query).all(...params);
  const total = db.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1' + (category ? ' AND category = ?' : '') + (search ? ' AND (name LIKE ? OR description LIKE ?)' : '')).get(...params.slice(0, -2));
  
  res.json({ products, total: total.count, page: Number(page), limit: Number(limit) });
});

app.get('/api/products/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});

app.post('/api/products', authenticate, requireAdmin, (req, res) => {
  const { name, description, price, image_url, stock, category } = req.body;
  const stmt = db.prepare('INSERT INTO products (name, description, price, image_url, stock, category) VALUES (?, ?, ?, ?, ?, ?)');
  const result = stmt.run(name, description, price, image_url, stock || 0, category);
  res.status(201).json({ id: result.lastInsertRowid, ...req.body });
});

app.put('/api/products/:id', authenticate, requireAdmin, (req, res) => {
  const { name, description, price, image_url, stock, category, is_active } = req.body;
  const stmt = db.prepare('UPDATE products SET name=?, description=?, price=?, image_url=?, stock=?, category=?, is_active=?, updated_at=CURRENT_TIMESTAMP WHERE id=?');
  stmt.run(name, description, price, image_url, stock, category, is_active, req.params.id);
  res.json({ id: req.params.id, ...req.body });
});

app.delete('/api/products/:id', authenticate, requireAdmin, (req, res) => {
  db.prepare('DELETE FROM products WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

app.get('/api/categories', (req, res) => {
  const categories = db.prepare('SELECT DISTINCT category FROM products WHERE is_active=1 AND category IS NOT NULL').all();
  res.json(categories.map(c => c.category));
});

// Cart routes
app.get('/api/cart', authenticate, (req, res) => {
  const items = db.prepare(`
    SELECT ci.*, p.name, p.price, p.image_url, p.stock
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
  `).all(req.user.id);
  res.json(items);
});

app.post('/api/cart', authenticate, (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  const stmt = db.prepare(`
    INSERT INTO cart_items (user_id, product_id, quantity)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, product_id) DO UPDATE SET quantity = quantity + ?
  `);
  stmt.run(req.user.id, product_id, quantity, quantity);
  res.json({ success: true });
});

app.put('/api/cart/:productId', authenticate, (req, res) => {
  const { quantity } = req.body;
  if (quantity <= 0) {
    db.prepare('DELETE FROM cart_items WHERE user_id=? AND product_id=?').run(req.user.id, req.params.productId);
  } else {
    db.prepare('UPDATE cart_items SET quantity=? WHERE user_id=? AND product_id=?').run(quantity, req.user.id, req.params.productId);
  }
  res.json({ success: true });
});

app.delete('/api/cart/:productId', authenticate, (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE user_id=? AND product_id=?').run(req.user.id, req.params.productId);
  res.json({ success: true });
});

app.delete('/api/cart', authenticate, (req, res) => {
  db.prepare('DELETE FROM cart_items WHERE user_id=?').run(req.user.id);
  res.json({ success: true });
});

// Order routes
app.post('/api/orders', authenticate, (req, res) => {
  const { shipping_address } = req.body;
  
  const cartItems = db.prepare(`
    SELECT ci.*, p.price, p.stock, p.name
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
  `).all(req.user.id);
  
  if (cartItems.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }
  
  // Check stock
  for (const item of cartItems) {
    if (item.quantity > item.stock) {
      return res.status(400).json({ error: `Not enough stock for ${item.name}` });
    }
  }
  
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Create order
  const orderStmt = db.prepare('INSERT INTO orders (user_id, total_amount, shipping_address) VALUES (?, ?, ?)');
  const orderResult = orderStmt.run(req.user.id, total, shipping_address);
  const orderId = orderResult.lastInsertRowid;
  
  // Create order items and reduce stock
  const itemStmt = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
  const stockStmt = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
  
  const transaction = db.transaction(() => {
    for (const item of cartItems) {
      itemStmt.run(orderId, item.product_id, item.quantity, item.price);
      stockStmt.run(item.quantity, item.product_id);
    }
    db.prepare('DELETE FROM cart_items WHERE user_id=?').run(req.user.id);
  });
  
  transaction();
  
  res.status(201).json({ id: orderId, total, status: 'pending' });
});

app.get('/api/orders', authenticate, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  
  // Add items to each order
  const itemStmt = db.prepare(`
    SELECT oi.*, p.name, p.image_url
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `);
  
  const ordersWithItems = orders.map(order => ({
    ...order,
    items: itemStmt.all(order.id)
  }));
  
  res.json(ordersWithItems);
});

app.get('/api/orders/:id', authenticate, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Not found' });
  
  const items = db.prepare(`
    SELECT oi.*, p.name, p.image_url
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `).all(order.id);
  
  res.json({ ...order, items });
});

// Admin order routes
app.get('/api/admin/orders', authenticate, requireAdmin, (req, res) => {
  const orders = db.prepare(`
    SELECT o.*, u.name as user_name, u.email as user_email
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC
  `).all();
  
  const itemStmt = db.prepare(`
    SELECT oi.*, p.name, p.image_url
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `);
  
  const ordersWithItems = orders.map(order => ({
    ...order,
    items: itemStmt.all(order.id)
  }));
  
  res.json(ordersWithItems);
});

app.put('/api/admin/orders/:id/status', authenticate, requireAdmin, (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE orders SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(status, req.params.id);
  res.json({ success: true });
});

// Zarinpal payment simulation
app.post('/api/payment/initiate', authenticate, (req, res) => {
  const { order_id } = req.body;
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(order_id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.status !== 'pending') return res.status(400).json({ error: 'Order not payable' });
  
  // Simulate Zarinpal authority
  const authority = 'AUTH_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  db.prepare('UPDATE orders SET payment_id = ? WHERE id = ?').run(authority, order_id);
  
  // In production, redirect to Zarinpal: https://www.zarinpal.com/pg/StartPay/{authority}
  res.json({ 
    authority,
    payment_url: `http://localhost:5173/payment/${authority}` // Simulated payment page
  });
});

app.get('/api/payment/verify/:authority', authenticate, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE payment_id = ? AND user_id = ?').get(req.params.authority, req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  
  // Simulate successful payment
  db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run('paid', order.id);
  
  res.json({ success: true, order_id: order.id });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});