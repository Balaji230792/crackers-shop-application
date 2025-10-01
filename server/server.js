const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');
const db = require('./database');

const app = express();
const PORT = 3002;

// Auto-populate database on startup (only if empty)
const initializeDatabase = async () => {
  try {
    // Check if admin user exists
    db.get('SELECT COUNT(*) as count FROM users WHERE email = ?', ['admin@mahin.com'], (err, result) => {
      if (err || result.count === 0) {
        console.log('🔄 Creating admin user...');
        
        // Create admin user only if doesn't exist
        bcrypt.hash('admin123', 10, (err, hash) => {
          if (err) {
            console.error('Error hashing password:', err);
            return;
          }
          
          db.run(
            'INSERT INTO users (name, email, phone, password, address, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            ['Admin User', 'admin@mahin.com', '9876543210', hash, 'Admin Address', 'admin', new Date().toISOString()],
            function(err) {
              if (err) {
                console.error('Error creating admin user:', err);
              } else {
                console.log('✅ Admin user created with ID:', this.lastID);
              }
            }
          );
        });
      } else {
        console.log('✅ Admin user already exists');
      }
    });
    
    // Check and populate products if needed
    db.get('SELECT COUNT(*) as count FROM products', (err, result) => {
      if (err || result.count === 0) {
        console.log('🔄 Populating products...');
        
        // Load and insert products
        const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/products.json'), 'utf8'));
        const stmt = db.prepare('INSERT OR REPLACE INTO products (id, name, price, category, description, unit) VALUES (?, ?, ?, ?, ?, ?)');
        
        productsData.forEach(product => {
          stmt.run([product.id, product.name, product.price, product.category, product.description, product.unit]);
        });
        stmt.finalize();
        
        console.log('✅ Products populated');
      } else {
        console.log('✅ Products already exist');
      }
    });
    
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

// Initialize database after a short delay
setTimeout(initializeDatabase, 1000);

app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../build')));

// Get all products
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products ORDER BY category, name', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create a new product
app.post('/api/products', (req, res) => {
  const { name, price, category, description, unit } = req.body;
  
  if (!name || !price || !category || !unit) {
    return res.status(400).json({ error: 'Missing required fields: name, price, category, unit' });
  }
  
  db.run(
    'INSERT INTO products (name, price, category, description, unit) VALUES (?, ?, ?, ?, ?)',
    [name, price, category, description || '', unit],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Product created successfully', productId: this.lastID });
    }
  );
});

// Update a product
app.put('/api/products/:id', (req, res) => {
  const { name, price, category, description, unit } = req.body;
  db.run(
    'UPDATE products SET name = ?, price = ?, category = ?, description = ?, unit = ? WHERE id = ?',
    [name, price, category, description, unit, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Product updated successfully' });
    }
  );
});

// Delete a product
app.delete('/api/products/:id', (req, res) => {
  const productId = req.params.id;
  console.log('Attempting to delete product ID:', productId);
  
  db.run(
    'DELETE FROM products WHERE id = ?',
    [productId],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: err.message });
      }
      
      console.log('Delete operation completed. Changes:', this.changes);
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json({ message: 'Product deleted successfully' });
    }
  );
});

// User signup
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (name, email, phone, password, address, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone, hashedPassword, address, new Date().toISOString()],
      function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({ error: 'Email or phone already exists' });
          }
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'User created successfully', userId: this.lastID });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// User login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    let isValid = false;
    if (user.password.startsWith('$2b$')) {
      isValid = await bcrypt.compare(password, user.password);
    } else {
      isValid = password === user.password;
    }
    
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });
    
    res.json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  });
});

// Get all orders
app.get('/api/orders', (req, res) => {
  const query = `
    SELECT o.id, o.user_id as userId, o.total_amount as totalAmount, 
           o.original_amount as originalAmount, o.discount, o.status, 
           o.order_date as orderDate, u.name as customerName, 
           u.email as customerEmail, u.phone as customerPhone
    FROM orders o
    JOIN users u ON o.user_id = u.id
    ORDER BY o.order_date DESC
  `;
  
  db.all(query, (err, orders) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const promises = orders.map(order => {
      return new Promise((resolve) => {
        db.all(
          `SELECT oi.product_id as id, p.name, p.category, p.unit, 
                  oi.quantity, oi.price
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ?`,
          [order.id],
          (err, items) => {
            order.items = items || [];
            resolve(order);
          }
        );
      });
    });
    
    Promise.all(promises).then(ordersWithItems => {
      res.json(ordersWithItems);
    });
  });
});

// Get orders by user ID
app.get('/api/orders/user/:userId', (req, res) => {
  const userId = req.params.userId;
  
  const query = `
    SELECT o.id, o.user_id as userId, o.total_amount as totalAmount, 
           o.original_amount as originalAmount, o.discount, o.status, 
           o.order_date as orderDate
    FROM orders o
    WHERE o.user_id = ?
    ORDER BY o.order_date DESC
  `;
  
  db.all(query, [userId], (err, orders) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const promises = orders.map(order => {
      return new Promise((resolve) => {
        db.all(
          `SELECT oi.product_id as id, p.name, p.category, p.unit, 
                  oi.quantity, oi.price
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ?`,
          [order.id],
          (err, items) => {
            order.items = items || [];
            resolve(order);
          }
        );
      });
    });
    
    Promise.all(promises).then(ordersWithItems => {
      res.json(ordersWithItems);
    });
  });
});

// Update order status
app.put('/api/orders/:id', (req, res) => {
  const { status } = req.body;
  db.run(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Order status updated successfully' });
    }
  );
});

// Create new order
app.post('/api/orders', (req, res) => {
  const { userId, items, totalAmount, originalAmount, discount } = req.body;
  
  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    
    db.run(
      'INSERT INTO orders (user_id, total_amount, original_amount, discount, order_date) VALUES (?, ?, ?, ?, ?)',
      [userId, totalAmount, originalAmount, discount, new Date().toISOString()],
      function(err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(500).json({ error: err.message });
        }
        
        const orderId = this.lastID;
        const stmt = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)');
        
        items.forEach(item => {
          stmt.run([orderId, item.id, item.quantity, item.price]);
        });
        
        stmt.finalize((err) => {
          if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ error: err.message });
          }
          db.run('COMMIT');
          res.json({ message: 'Order created successfully', orderId });
        });
      }
    );
  });
});

// Helper endpoint to generate password hash (for development only)
app.post('/api/hash-password', async (req, res) => {
  try {
    const { password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    res.json({ password, hash });
  } catch (error) {
    res.status(500).json({ error: 'Failed to hash password' });
  }
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

const port = process.env.PORT || PORT;
app.listen(port, () => {
  console.log(`🚀 SQLite Server running on port ${port}`);
  console.log(`📊 Database: server/crackers.db`);
  console.log(`🌐 Serving React app from build folder`);
  console.log(`👤 Admin Login: admin@mahin.com / admin123`);
});