import React, { useState, useEffect } from 'react';
import productsData from '../data/products.json';

function Admin() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [serverAvailable, setServerAvailable] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    unit: ''
  });

  const categories = ['Sparklers', 'Sound Crackers', 'Bijili Crackers', 'Ground Chakkar', 'Twinkling Stars', 'Flower Pots', 'Pencils', 'Rockets', 'Bombs', 'Fountains', 'Fancy Items', 'Multi Shots', 'Miscellaneous', 'Matches', 'Gift Sets'];
  const units = ['Box', 'Pkt', 'Bag', 'Dozen'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const sessionId = localStorage.getItem('crackerShopSession');
      const response = await fetch('/api/products', {
        headers: sessionId ? { 'x-session-id': sessionId } : {}
      });
      
      if (response.status === 401) {
        localStorage.removeItem('crackerShopSession');
        window.location.href = '/login';
        return;
      }
      
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
        const sessionId = localStorage.getItem('crackerShopSession');
        
        // Handle offline mode
        if (sessionId === 'offline-admin-session') {
          const updatedProducts = products.map(p => p.id === editingProduct ? formData : p);
          setProducts(updatedProducts);
          setEditingProduct(null);
          setFormData({});
          alert('Product updated locally (offline mode)');
          return;
        }
        
        const response = await fetch(`/api/products/${editingProduct}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-session-id': sessionId
          },
          body: JSON.stringify(formData),
        });
        
        if (response.status === 401) {
          localStorage.removeItem('crackerShopSession');
          window.location.href = '/login';
          return;
        }
        
        if (response.ok) {
          const updatedProducts = products.map(p => p.id === editingProduct ? formData : p);
          setProducts(updatedProducts);
          setEditingProduct(null);
          setFormData({});
          alert('Product updated successfully!');
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

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    if (!serverAvailable) {
      alert('Server not available - Cannot delete products');
      return;
    }

    try {
      console.log('Deleting product ID:', productId);
      
      const sessionId = localStorage.getItem('crackerShopSession');
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId
        }
      });
      
      if (response.status === 401) {
        localStorage.removeItem('crackerShopSession');
        window.location.href = '/login';
        return;
      }
      
      const result = await response.json();
      console.log('Delete response:', result);
      
      if (response.ok) {
        await fetchProducts();
        alert('Product deleted successfully!');
      } else {
        alert(`Failed to delete product: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(`Error deleting product: ${error.message}`);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    if (!serverAvailable) {
      alert('Server not available - Cannot add products');
      return;
    }

    // Validate required fields
    if (!newProduct.name.trim() || !newProduct.price || !newProduct.category || !newProduct.unit) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const productData = {
        name: newProduct.name.trim(),
        price: Number(newProduct.price),
        category: newProduct.category,
        description: newProduct.description.trim() || '',
        unit: newProduct.unit
      };

      // Validate price is a valid number
      if (isNaN(productData.price) || productData.price <= 0) {
        alert('Please enter a valid price');
        return;
      }

      console.log('Sending product data:', productData);

      const sessionId = localStorage.getItem('crackerShopSession');
      
      // Handle offline mode
      if (sessionId === 'offline-admin-session') {
        const newId = Math.max(...products.map(p => p.id)) + 1;
        const newProductWithId = { ...productData, id: newId };
        setProducts([...products, newProductWithId]);
        setNewProduct({ name: '', price: '', category: '', description: '', unit: '' });
        setShowAddForm(false);
        alert('Product added locally (offline mode)');
        return;
      }
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId
        },
        body: JSON.stringify(productData)
      });
      
      if (response.status === 401) {
        localStorage.removeItem('crackerShopSession');
        window.location.href = '/login';
        return;
      }
      
      const result = await response.json();
      console.log('Server response:', result);
      
      if (response.ok) {
        await fetchProducts();
        setNewProduct({ name: '', price: '', category: '', description: '', unit: '' });
        setShowAddForm(false);
        alert('Product added successfully!');
      } else {
        alert(`Failed to add product: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert(`Error adding product: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="admin-container"><h2>Loading...</h2></div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Admin Panel - Product Management</h2>
        <button 
          className="add-product-btn"
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={!serverAvailable}
        >
          {showAddForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>
      {serverAvailable ? (
        <p className="server-note">✅ Server connected - Changes will be saved to JSON file</p>
      ) : (
        <p className="server-warning">⚠️ Server not available - Changes are local only. Start server with: cd server && npm start</p>
      )}
      
      {showAddForm && (
        <form className="add-product-form" onSubmit={handleAddProduct}>
          <h3>Add New Product</h3>
          <div className="form-grid">
            <div className="form-field">
              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                required
              />
            </div>
            <div className="form-field">
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Price"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                required
              />
            </div>
            <div className="form-field">
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <select
                value={newProduct.unit}
                onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
                required
              >
                <option value="">Select Unit</option>
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            <div className="form-field full-width">
              <textarea
                placeholder="Description (optional)"
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
              />
            </div>
          </div>
          <button type="submit" className="submit-btn">Add Product</button>
        </form>
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
                    <div>
                      <button onClick={() => handleEdit(product)} className="edit-btn">Edit</button>
                      <button onClick={() => handleDelete(product.id)} className="delete-btn">Delete</button>
                    </div>
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