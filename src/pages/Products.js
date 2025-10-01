import React, { useState, useEffect } from 'react';
import productsData from '../data/products.json';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [quantities, setQuantities] = useState({});
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleQuantityChange = (productId, quantity) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: parseInt(quantity)
    }));
  };

  const handleAddToCart = (product) => {
    const quantity = quantities[product.id] || 1;
    addToCart(product, quantity);
    // Reset quantity after adding
    setQuantities(prev => ({
      ...prev,
      [product.id]: 1
    }));
  };

  const toggleCategory = (category) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error('Server not available, using local data:', error);
      setProducts(productsData);
      setLoading(false);
    }
  };
  
  const categories = ['All', ...new Set(products.map(product => product.category))];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {});

  if (loading) {
    return (
      <div>
        <div className="discount-banner">
          <h2>🎉 MEGA DIWALI SALE - 50% OFF ON ALL PRODUCTS! 🎉</h2>
          <p>Limited Time Offer - Grab Your Favorite Crackers Now!</p>
        </div>
        <div className="loading">Loading products...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="discount-banner">
        <h2>🎉 MEGA DIWALI SALE - 50% OFF ON ALL PRODUCTS! 🎉</h2>
        <p>Limited Time Offer - Grab Your Favorite Crackers Now!</p>
      </div>
      <div className="products-layout">
        <aside className="sidebar">
        <h3>Categories</h3>
        <ul className="category-list">
          {categories.map(category => (
            <li key={category}>
              <button
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      </aside>
      
      <main className="products-main">
        <div className="products-header">
          <h2>Our Products</h2>
          <button 
            className="minimize-all-btn"
            onClick={() => {
              const categories = Object.keys(groupedProducts);
              const allCollapsed = categories.every(cat => collapsedCategories[cat]);
              setCollapsedCategories(allCollapsed ? {} : categories.reduce((acc, cat) => ({ ...acc, [cat]: true }), {}));
            }}
          >
            {Object.keys(groupedProducts).every(cat => collapsedCategories[cat]) ? 'Expand All' : 'Minimize All'}
          </button>
        </div>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search products or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        {Object.entries(groupedProducts).map(([category, products]) => (
          <div key={category} className="category-section">
            <div className="category-header" onClick={() => toggleCategory(category)}>
              <h3 className="category-title">{category}</h3>
              <span className="toggle-icon">
                {collapsedCategories[category] ? '▶' : '▼'}
              </span>
            </div>
            {!collapsedCategories[category] && (
              <div className="product-grid">
                {products.map(product => (
                  <div key={product.id} className="product-card">
                    <h4>{product.name}</h4>
                    <p className="description">{product.description}</p>
                    <div className="price-section">
                      <p className="original-price">₹{product.price}</p>
                      <p className="discounted-price">₹{Math.round(product.price * 0.5)} / {product.unit}</p>
                      <span className="discount-badge">50% OFF</span>
                    </div>
                    {user ? (
                      <div className="product-actions">
                        <div className="quantity-selector">
                          <label>Qty:</label>
                          <select 
                            value={quantities[product.id] || 1}
                            onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                            className="quantity-dropdown"
                          >
                            {Array.from({length: 50}, (_, i) => i + 1).map(num => (
                              <option key={num} value={num}>{num}</option>
                            ))}
                          </select>
                        </div>
                        {user.role === 'customer' && (
                          <button className="add-to-cart" onClick={() => handleAddToCart(product)}>
                            Add to Cart
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="login-prompt">
                        <p>Please <a href="/login">login</a> to add items to cart</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        </main>
      </div>
    </div>
  );
}

export default Products;