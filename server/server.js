const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

const productsPath = path.join(__dirname, '../src/data/products.json');
const usersPath = path.join(__dirname, '../src/data/users.json');
const ordersPath = path.join(__dirname, '../src/data/orders.json');

// Get all products
app.get('/api/products', (req, res) => {
  try {
    const data = fs.readFileSync(productsPath, 'utf8');
    const products = JSON.parse(data);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read products' });
  }
});

// Update a product
app.put('/api/products/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const updatedProduct = req.body;
    
    const data = fs.readFileSync(productsPath, 'utf8');
    let products = JSON.parse(data);
    
    const index = products.findIndex(p => p.id === productId);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    products[index] = { ...products[index], ...updatedProduct };
    
    fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
    res.json({ message: 'Product updated successfully', product: products[index] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// User signup
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;
    
    const data = fs.readFileSync(usersPath, 'utf8');
    let users = JSON.parse(data);
    
    // Check if email or phone already exists
    const existingUser = users.find(u => u.email === email || u.phone === phone);
    if (existingUser) {
      return res.status(400).json({ error: 'Email or phone number already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      name,
      email,
      phone,
      password: hashedPassword,
      address,
      role: 'customer',
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    
    res.json({ message: 'User created successfully', userId: newUser.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// User login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const data = fs.readFileSync(usersPath, 'utf8');
    const users = JSON.parse(data);
    
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Compare password with hash or plain text (for transition)
    let isValidPassword = false;
    
    if (user.password.startsWith('$2b$')) {
      // Hashed password
      isValidPassword = await bcrypt.compare(password, user.password);
    } else {
      // Plain text password (fallback)
      isValidPassword = password === user.password;
    }
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({ 
      message: 'Login successful', 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get all orders
app.get('/api/orders', (req, res) => {
  try {
    const data = fs.readFileSync(ordersPath, 'utf8');
    const orders = JSON.parse(data);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read orders' });
  }
});

// Get orders by user ID
app.get('/api/orders/user/:userId', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const data = fs.readFileSync(ordersPath, 'utf8');
    const orders = JSON.parse(data);
    const userOrders = orders.filter(order => order.userId === userId);
    res.json(userOrders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read user orders' });
  }
});

// Update order status
app.put('/api/orders/:id', (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;
    
    const data = fs.readFileSync(ordersPath, 'utf8');
    let orders = JSON.parse(data);
    
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    orders[index].status = status;
    
    fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Create new order
app.post('/api/orders', (req, res) => {
  try {
    const orderData = req.body;
    
    const data = fs.readFileSync(ordersPath, 'utf8');
    let orders = JSON.parse(data);
    
    const newOrder = {
      id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
      ...orderData,
      orderDate: new Date().toISOString()
    };
    
    orders.push(newOrder);
    fs.writeFileSync(ordersPath, JSON.stringify(orders, null, 2));
    
    res.json({ message: 'Order created successfully', orderId: newOrder.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});