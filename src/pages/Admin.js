import React, { useState, useEffect } from 'react';
import productsData from '../data/products.json';

function Admin() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [serverAvailable, setServerAvailable] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3002/api/products');
      const data = await response.json();
      setProducts(data);
      setServerAvailable(true);
      setLoading(false);
    } catch (error) {
      console.error('Server not available, using local data:', error);
      setProducts(productsData);
      setServerAvailable(false);
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product.id);
    setFormData(product);
  };

  const handleSave = async () => {
    if (serverAvailable) {
      try {
        const response = await fetch(`http://localhost:3002/api/products/${editingProduct}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        if (response.ok) {
          const updatedProducts = products.map(p => p.id === editingProduct ? formData : p);
          setProducts(updatedProducts);
          setEditingProduct(null);
          setFormData({});
          alert('Product updated successfully in JSON file!');
        } else {
          alert('Failed to update product');
        }
      } catch (error) {
        console.error('Error updating product:', error);
        alert('Error updating product');
      }
    } else {
      const updatedProducts = products.map(p => p.id === editingProduct ? formData : p);
      setProducts(updatedProducts);
      setEditingProduct(null);
      setFormData({});
      alert('Product updated locally (server not available)');
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setFormData({});
  };

  if (loading) {
    return <div className="admin-container"><h2>Loading...</h2></div>;
  }

  return (
    <div className="admin-container">
      <h2>Admin Panel - Product Management</h2>
      {serverAvailable ? (
        <p className="server-note">✅ Server connected - Changes will be saved to JSON file</p>
      ) : (
        <p className="server-warning">⚠️ Server not available - Changes are local only. Start server with: cd server && npm start</p>
      )}
      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Unit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>
                  {editingProduct === product.id ? (
                    <input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  ) : product.name}
                </td>
                <td>
                  {editingProduct === product.id ? (
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    />
                  ) : `₹${product.price}`}
                </td>
                <td>
                  {editingProduct === product.id ? (
                    <input
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    />
                  ) : product.category}
                </td>
                <td>{product.unit}</td>
                <td>
                  {editingProduct === product.id ? (
                    <div>
                      <button onClick={handleSave} className="save-btn">Save</button>
                      <button onClick={handleCancel} className="cancel-btn">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => handleEdit(product)} className="edit-btn">Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Admin;