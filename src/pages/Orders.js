
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Orders() {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serverAvailable, setServerAvailable] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If not logged in or not admin, redirect to home
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    setOrders(null);
    
    try {
      const sessionId = localStorage.getItem('crackerShopSession');
      if (!sessionId) {
        throw new Error('No session found');
      }

      const response = await fetch('/api/orders', {
        headers: {
          'x-session-id': sessionId
        }
      });
      
      if (response.status === 401) {
        localStorage.removeItem('crackerShopSession');
        localStorage.removeItem('crackerShopUser');
        navigate('/login');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.error('Server returned non-array data:', data);
        setError('Server returned invalid data format');
        return;
      }

      setOrders(data);
      setServerAvailable(true);
    } catch (error) {
      console.error('Error fetching orders:', error);
      try {
        const { default: localOrders } = await import('../data/orders.json');
        
        if (!Array.isArray(localOrders)) {
          console.error('Local data is not an array:', localOrders);
          setError('Failed to load orders: Invalid data format');
          return;
        }

        setOrders(localOrders);
      } catch (importError) {
        console.error('Failed to load local orders data:', importError);
        setError('Failed to load orders. Please try again.');
        return;
      }
      setServerAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    if (!orders || !orders.length) {
      setError('Cannot update order: No orders available');
      return;
    }

    if (serverAvailable) {
      try {
        const sessionId = localStorage.getItem('crackerShopSession');
        const response = await fetch(`/api/orders/${orderId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-session-id': sessionId
          },
          body: JSON.stringify({ status: newStatus }),
        });
        
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        
        if (response.ok) {
          setOrders(prevOrders => 
            prevOrders.map(order => 
              order.id === orderId ? { ...order, status: newStatus } : order
            )
          );
        }
      } catch (error) {
        console.error('Error updating order:', error);
      }
    } else {
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    }
  };

  if (loading) {
    return <div className="admin-container"><h2>Loading orders...</h2></div>;
  }

  if (error) {
    return <div className="admin-container">
      <h2>Error loading orders</h2>
      <p className="error-message">{error}</p>
    </div>;
  }

  if (!orders) {
    return <div className="admin-container"><h2>No orders found</h2></div>;
  }

  // Ensure orders is an array and compute stats
  const safeOrders = orders || [];
  const pendingOrders = safeOrders.filter(o => o && o.status === 'pending');
  const completedOrders = safeOrders.filter(o => o && o.status === 'completed');
  const totalRevenue = safeOrders.reduce((total, order) => total + (Number(order?.totalAmount) || 0), 0);

  return (
    <div className="admin-container">
      <h2>Orders Management</h2>
      {serverAvailable ? (
        <p className="server-note">✅ Server connected - Changes will be saved</p>
      ) : (
        <p className="server-warning">⚠️ Server not available - Changes are local only</p>
      )}
      
      <div className="orders-stats">
        <div className="stat-card">
          <h3>{safeOrders.length}</h3>
          <p>Total Orders</p>
        </div>
        <div className="stat-card">
          <h3>{pendingOrders.length}</h3>
          <p>Pending</p>
        </div>
        <div className="stat-card">
          <h3>{completedOrders.length}</h3>
          <p>Completed</p>
        </div>
        <div className="stat-card">
          <h3>₹{totalRevenue.toFixed(2)}</h3>
          <p>Total Revenue</p>
        </div>
      </div>

      <div className="orders-list">
        {safeOrders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <h3>Order #{order.id}</h3>
                <p className="order-date">{new Date(order.orderDate).toLocaleDateString()}</p>
              </div>
              <div className="order-status">
                <select 
                  value={order.status} 
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  className={`status-select ${order.status}`}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div className="customer-info">
              <h4>Customer Details</h4>
              <p><strong>Name:</strong> {order.customerName}</p>
              <p><strong>Email:</strong> {order.customerEmail}</p>
              <p><strong>Phone:</strong> {order.customerPhone}</p>
              <p><strong>Address:</strong> {order.customerAddress}</p>
            </div>
            
            <div className="order-items">
              <h4>Items Ordered</h4>
              {Array.isArray(order.items) && order.items.map(item => (
                <div key={item.id} className="order-item">
                  <span className="item-name">{item.name}</span>
                  <span className="item-category">{item.category}</span>
                  <span className="item-quantity">Qty: {item.quantity}</span>
                  <span className="item-price">₹{Math.round(item.price * 0.5)} / {item.unit}</span>
                </div>
              ))}
            </div>
            
            <div className="order-total">
              <div className="total-row">
                <span>Original Amount:</span>
                <span>₹{order.originalAmount}</span>
              </div>
              <div className="total-row discount">
                <span>Discount (50%):</span>
                <span>-₹{order.discount}</span>
              </div>
              <div className="total-row final">
                <span>Total Amount:</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;