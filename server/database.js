const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'crackers.db');
const db = new sqlite3.Database(dbPath);

// Performance optimizations
db.serialize(() => {
  db.run('PRAGMA journal_mode = WAL');
  db.run('PRAGMA synchronous = NORMAL');
  db.run('PRAGMA cache_size = 10000');
  
  // Products table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    unit TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password TEXT NOT NULL,
    address TEXT,
    role TEXT DEFAULT 'customer',
    created_at DATETIME
  )`);

  // Orders table
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    original_amount REAL NOT NULL,
    discount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    order_date DATETIME,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Order items table
  db.run(`CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
  )`);

  // Sessions table
  db.run(`CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Create indexes
  db.run('CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date)');
  db.run('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)');
  db.run('CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at)');
});

module.exports = db;