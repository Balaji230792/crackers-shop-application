const fs = require('fs');
const path = require('path');
const db = require('./database');

// Migrate products from JSON to SQLite
function migrateProducts() {
  return new Promise((resolve, reject) => {
    const productsPath = path.join(__dirname, '../src/data/products.json');
    const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    
    const stmt = db.prepare('INSERT OR REPLACE INTO products (id, name, price, category, description, unit) VALUES (?, ?, ?, ?, ?, ?)');
    
    products.forEach(product => {
      stmt.run([product.id, product.name, product.price, product.category, product.description, product.unit]);
    });
    
    stmt.finalize((err) => {
      if (err) reject(err);
      else {
        console.log(`✅ Migrated ${products.length} products`);
        resolve();
      }
    });
  });
}

// Migrate users from JSON to SQLite
function migrateUsers() {
  return new Promise((resolve, reject) => {
    const usersPath = path.join(__dirname, '../src/data/users.json');
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    
    const stmt = db.prepare('INSERT OR REPLACE INTO users (id, name, email, phone, password, address, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    
    users.forEach(user => {
      stmt.run([user.id, user.name, user.email, user.phone, user.password, user.address, user.role, user.createdAt]);
    });
    
    stmt.finalize((err) => {
      if (err) reject(err);
      else {
        console.log(`✅ Migrated ${users.length} users`);
        resolve();
      }
    });
  });
}

// Migrate orders from JSON to SQLite
function migrateOrders() {
  return new Promise((resolve, reject) => {
    const ordersPath = path.join(__dirname, '../src/data/orders.json');
    const orders = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    
    const orderStmt = db.prepare('INSERT OR REPLACE INTO orders (id, user_id, total_amount, original_amount, discount, status, order_date) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const itemStmt = db.prepare('INSERT OR REPLACE INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
    
    // Clear existing order items first
    db.run('DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders)', () => {
      orders.forEach(order => {
        orderStmt.run([order.id, order.userId, order.totalAmount, order.originalAmount, order.discount, order.status, order.orderDate]);
        
        order.items.forEach(item => {
          itemStmt.run([order.id, item.id, item.quantity, item.price]);
        });
      });
      
      orderStmt.finalize();
      itemStmt.finalize((err) => {
        if (err) reject(err);
        else {
          console.log(`✅ Migrated ${orders.length} orders with ${orders.reduce((sum, o) => sum + o.items.length, 0)} items`);
          resolve();
        }
      });
    });
  });
}

// Run migration
async function runMigration() {
  try {
    console.log('🚀 Starting migration from JSON to SQLite...');
    
    await migrateProducts();
    await migrateUsers();
    await migrateOrders();
    
    console.log('🎉 Migration completed successfully!');
    console.log('📊 Database ready at: server/crackers.db');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    db.close();
  }
}

runMigration();