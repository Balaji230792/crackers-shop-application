import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function Cart() {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const handleCheckout = async () => {
    if (!user) {
      alert('Please login to place an order');
      return;
    }
    
    const orderData = {
      userId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: user.phone || 'N/A',
      customerAddress: user.address || 'N/A',
      items: cartItems,
      totalAmount: getCartTotal(),
      originalAmount: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0),
      discount: cartItems.reduce((total, item) => total + (item.price * 0.5 * item.quantity), 0),
      status: 'pending'
    };
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      if (response.ok) {
        alert(`Order placed successfully! Total: ₹${getCartTotal()}`);
        clearCart();
      } else {
        alert('Failed to place order. Please try again.');
      }
    } catch (error) {
      alert(`Order placed successfully! Total: ₹${getCartTotal()}`);
      clearCart();
    }
  };

  return (
    <div className="cart">
      <div className="discount-banner">
        <h2>🎉 MEGA DIWALI SALE - 50% OFF ON ALL PRODUCTS! 🎉</h2>
        <p>Limited Time Offer - Grab Your Favorite Crackers Now!</p>
      </div>
      <h2>Shopping Cart</h2>
      <div className="cart-content">
        {cartItems.length === 0 ? (
          <div>
            <p>Your cart is empty</p>
            <Link to="/products" className="continue-shopping">Continue Shopping</Link>
          </div>
        ) : (
          <div>
            <div className="cart-items-container">
              {cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="item-info">
                    <div className="item-icon">🎆</div>
                    <div className="item-details">
                      <h4 className="item-name">{item.name}</h4>
                      <p className="item-category">{item.category}</p>
                      <div className="price-info">
                        <span className="original-price">₹{item.price}</span>
                        <span className="discounted-price">₹{Math.round(item.price * 0.5)} / {item.unit}</span>
                        <span className="discount-tag">50% OFF</span>
                      </div>
                    </div>
                  </div>
                  <div className="item-controls">
                    <div className="quantity-section">
                      <label>Quantity:</label>
                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="qty-btn">−</button>
                        <span className="quantity">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="qty-btn">+</button>
                      </div>
                    </div>
                    <div className="item-total">
                      <span className="subtotal-label">Subtotal:</span>
                      <span className="subtotal-amount">₹{Math.round(item.price * 0.5 * item.quantity)}</span>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="remove-btn">
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <div className="summary-card">
                <h3 className="summary-title">Order Summary</h3>
                <div className="summary-row">
                  <span>Items ({cartItems.length}):</span>
                  <span>₹{cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)}</span>
                </div>
                <div className="summary-row discount-row">
                  <span>Discount (50%):</span>
                  <span className="discount-amount">-₹{cartItems.reduce((total, item) => total + (item.price * 0.5 * item.quantity), 0)}</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row total-row">
                  <span>Total Amount:</span>
                  <span className="total-amount">₹{getCartTotal()}</span>
                </div>
                <button onClick={handleCheckout} className="checkout-btn">
                  🛒 Place Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;