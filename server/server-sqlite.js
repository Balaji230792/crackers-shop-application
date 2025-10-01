const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./database');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// Products endpoints
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products ORDER BY category, name', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

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

// User endpoints
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

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    // Handle both hashed and plain passwords for migration
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

// Orders endpoints
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
    
    // Get items for each order
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
    
    // Get items for each order
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

app.listen(PORT, () => {
  console.log(`🚀 SQLite Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: server/crackers.db`);
});