const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'crackers.db');
const db = new sqlite3.Database(dbPath);

// Performance optimizations
db.serialize(() => {
  // Enable WAL mode for better concurrency
  db.run('PRAGMA journal_mode = WAL');
  
  // Optimize for performance
  db.run('PRAGMA synchronous = NORMAL');
  db.run('PRAGMA cache_size = 10000');
  db.run('PRAGMA temp_store = MEMORY');
  
  // Create indexes for fast queries
  db.run('CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)');
  db.run('CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date)');
  db.run('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)');
  db.run('CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)');
});

module.exports = db;