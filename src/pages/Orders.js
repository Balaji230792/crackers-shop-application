import React, { useState, useEffect } from 'react';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverAvailable, setServerAvailable] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/orders');
      const data = await response.json();
      setOrders(data);
      setServerAvailable(true);
      setLoading(false);
    } catch (error) {
      console.error('Server not available, using local data:', error);
      // Fallback to local data
      const ordersData = await import('../data/orders.json');
      setOrders(ordersData.default);
      setServerAvailable(false);
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    if (serverAvailable) {
      try {
        const response = await fetch(`http://localhost:3002/api/orders/${orderId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        });
        
        if (response.ok) {
          setOrders(orders.map(order => 
            order.id === orderId ? { ...order, status: newStatus } : order
          ));
        }
      } catch (error) {
        console.error('Error updating order:', error);
      }
    } else {
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    }
  };

  if (loading) {
    return <div className="admin-container"><h2>Loading orders...</h2></div>;
  }

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
          <h3>{orders.length}</h3>
          <p>Total Orders</p>
        </div>
        <div className="stat-card">
          <h3>{orders.filter(o => o.status === 'pending').length}</h3>
          <p>Pending</p>
        </div>
        <div className="stat-card">
          <h3>{orders.filter(o => o.status === 'completed').length}</h3>
          <p>Completed</p>
        </div>
        <div className="stat-card">
          <h3>₹{orders.reduce((total, order) => total + order.totalAmount, 0)}</h3>
          <p>Total Revenue</p>
        </div>
      </div>

      <div className="orders-list">
        {orders.map(order => (
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
              {order.items.map(item => (
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