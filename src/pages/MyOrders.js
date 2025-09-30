import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMyOrders();
    }
  }, [user]);

  const fetchMyOrders = async () => {
    try {
      const response = await fetch(`http://localhost:3002/api/orders/user/${user.id}`);
      const data = await response.json();
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Server not available, using local data:', error);
      // Fallback to local data
      const ordersData = await import('../data/orders.json');
      const userOrders = ordersData.default.filter(order => order.userId === user.id);
      setOrders(userOrders);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'processing': return '#007bff';
      case 'completed': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return <div className="my-orders-container"><h2>Loading your orders...</h2></div>;
  }

  return (
    <div className="my-orders-container">
      <h2>My Orders</h2>
      
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
          <a href="/products" className="shop-now-btn">Start Shopping</a>
        </div>
      ) : (
        <div className="my-orders-list">
          {orders.map(order => (
            <div key={order.id} className="my-order-card">
              <div className="order-summary">
                <div className="order-basic-info">
                  <h3>Order #{order.id}</h3>
                  <p className="order-date">{new Date(order.orderDate).toLocaleDateString()}</p>
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status.toUpperCase()}
                  </span>
                </div>
                <div className="order-amount">
                  <span className="total-amount">₹{order.totalAmount}</span>
                  <span className="items-count">{order.items.length} items</span>
                </div>
              </div>
              
              <div className="order-actions">
                <button 
                  className="view-details-btn"
                  onClick={() => setSelectedOrder(order)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details - #{selectedOrder.id}</h3>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="order-info-section">
                <h4>Order Information</h4>
                <p><strong>Order Date:</strong> {new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
                <p><strong>Status:</strong> 
                  <span 
                    className="status-badge" 
                    style={{ backgroundColor: getStatusColor(selectedOrder.status), marginLeft: '0.5rem' }}
                  >
                    {selectedOrder.status.toUpperCase()}
                  </span>
                </p>
              </div>
              
              <div className="items-section">
                <h4>Items Ordered</h4>
                {selectedOrder.items.map(item => (
                  <div key={item.id} className="modal-item">
                    <span className="item-icon">🎆</span>
                    <div className="item-details">
                      <div className="item-name">{item.name}</div>
                      <div className="item-category">{item.category}</div>
                      <div className="item-pricing">
                        <span className="original-price">₹{item.price}</span>
                        <span className="discounted-price">₹{Math.round(item.price * 0.5)} / {item.unit}</span>
                        <span className="quantity">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="item-total">₹{Math.round(item.price * 0.5 * item.quantity)}</div>
                  </div>
                ))}
              </div>
              
              <div className="order-summary-section">
                <h4>Order Summary</h4>
                <div className="summary-row">
                  <span>Original Amount:</span>
                  <span>₹{selectedOrder.originalAmount}</span>
                </div>
                <div className="summary-row discount">
                  <span>Discount (50%):</span>
                  <span>-₹{selectedOrder.discount}</span>
                </div>
                <div className="summary-row total">
                  <span>Total Amount:</span>
                  <span>₹{selectedOrder.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyOrders;