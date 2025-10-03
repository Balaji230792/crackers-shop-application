import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Admin from './pages/Admin';
import Orders from './pages/Orders';
import MyOrders from './pages/MyOrders';
import Contact from './pages/Contact';
import './styles/App.css';
import './styles/countdown.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
          <div className="App">
            <Header />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><Admin /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute requiredRole="admin"><Orders /></ProtectedRoute>} />
              <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;