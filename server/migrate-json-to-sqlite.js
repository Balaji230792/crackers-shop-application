const db = require('./database');
const fs = require('fs');
const path = require('path');

// Read JSON data
const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/products.json'), 'utf8'));
const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/users.json'), 'utf8'));

console.log('🔄 Starting migration...');

// Clear existing data and migrate
db.serialize(() => {
  // Clear tables
  db.run('DELETE FROM products');
  db.run('DELETE FROM users');
  
  // Migrate products
  const productStmt = db.prepare('INSERT INTO products (id, name, price, category, description, unit) VALUES (?, ?, ?, ?, ?, ?)');
  
  productsData.forEach(product => {
    productStmt.run([
      product.id,
      product.name,
      product.price,
      product.category,
      product.description || '',
      product.unit
    ]);
  });
  
  productStmt.finalize();
  console.log(`✅ Migrated ${productsData.length} products`);
  
  // Migrate users
  const userStmt = db.prepare('INSERT INTO users (id, name, email, phone, password, address, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  
  usersData.forEach(user => {
    userStmt.run([
      user.id,
      user.name,
      user.email,
      user.phone || '',
      user.password,
      user.address || '',
      user.role || 'customer',
      user.createdAt || new Date().toISOString()
    ]);
  });
  
  userStmt.finalize();
  console.log(`✅ Migrated ${usersData.length} users`);
  
  console.log('🎉 Migration completed successfully!');
  process.exit(0);
});