import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ThemeSelector from './ThemeSelector';

function Header() {
  const { user, logout } = useAuth();
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    clearCart();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <div className="logo-icon">🎆</div>
          <h1>Mahin Crackers</h1>
        </Link>
        <nav className="main-nav">
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          {user && user.role === 'customer' && (
            <>
              <Link to="/my-orders">My Orders</Link>
              <Link to="/cart" className="cart-link">
                <span className="cart-icon">🛒</span>
                <span className="cart-count">{cartItems.length}</span>
              </Link>
            </>
          )}
        </nav>
        <div className="user-section">
          <ThemeSelector />
          {user ? (
            <div className="user-menu">
              {user.role === 'admin' && (
                <>
                  <Link to="/admin" className="admin-link">Products</Link>
                  <Link to="/orders" className="admin-link">Orders</Link>
                </>
              )}
              <div className="user-info">
                <span className="user-avatar">{user.name.charAt(0).toUpperCase()}</span>
                <span className="user-name">{user.name}</span>
              </div>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="login-btn">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;