import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [timeLeft, setTimeLeft] = useState({});
  const [showCountdown, setShowCountdown] = useState(true);

  useEffect(() => {
    const diwaliDate = new Date('2025-10-20T00:00:00');
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = diwaliDate.getTime() - now;
      
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ expired: true });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="home">
      {/* Countdown Popup */}
      {showCountdown && (
        <div className="countdown-popup-overlay">
          <div className="countdown-popup">
            <button 
              className="close-popup" 
              onClick={() => setShowCountdown(false)}
            >
              ×
            </button>
            <div className="popup-content">
              <h2>🎉 MEGA DIWALI SALE 🎉</h2>
              <p className="sale-text">50% OFF on All Premium Crackers!</p>
              <p className="popup-description">
                Experience the joy of Diwali with our premium quality crackers.
                Authentic Sivakasi craftsmanship with modern safety standards.
              </p>
              
              <div className="countdown-timer">
                <h3>🪔 Diwali Countdown 🪔</h3>
                {timeLeft.expired ? (
                  <div className="countdown-expired">
                    <span>🎆 Happy Diwali! 🎆</span>
                  </div>
                ) : (
                  <div className="timer-display">
                    <div className="time-unit">
                      <span className="time-number">{timeLeft.days || 0}</span>
                      <span className="time-label">Days</span>
                    </div>
                    <div className="time-unit">
                      <span className="time-number">{timeLeft.hours || 0}</span>
                      <span className="time-label">Hours</span>
                    </div>
                    <div className="time-unit">
                      <span className="time-number">{timeLeft.minutes || 0}</span>
                      <span className="time-label">Minutes</span>
                    </div>
                    <div className="time-unit">
                      <span className="time-number">{timeLeft.seconds || 0}</span>
                      <span className="time-label">Seconds</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="popup-buttons">
                <Link to="/products" className="shop-now-btn" onClick={() => setShowCountdown(false)}>Shop Now</Link>
                <a href="https://wa.me/919566946632" className="whatsapp-popup-btn">
                  📱 WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="hero-section">
        <div className="floating-particles"></div>
        <div className="hero-glow"></div>
        <div className="hero-content">
          <div className="brand-logo">
            <span className="logo-icon">🎆</span>
          </div>
          <h1 className="brand-name">Mahin Crackers</h1>
          <p className="tagline">Premium Sivakasi Fireworks</p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">5000+</span>
              <span className="stat-label">Happy Customers</span>
            </div>
            <div className="stat">
              <span className="stat-number">140+</span>
              <span className="stat-label">Products</span>
            </div>
            <div className="stat">
              <span className="stat-number">50%</span>
              <span className="stat-label">Diwali Discount</span>
            </div>
          </div>
          <div className="hero-buttons">
            <Link to="/products" className="cta-primary">
              <span>🛒</span> Explore Products
            </Link>
            <a href="https://wa.me/919566946632" className="cta-secondary">
              <span>💬</span> Contact Us
            </a>
          </div>
        </div>
        <div className="scroll-indicator">
          <div className="scroll-arrow"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="feature-card premium">
          <div className="feature-icon">🏆</div>
          <h3>Premium Quality</h3>
          <p>Authentic Sivakasi craftsmanship</p>
        </div>
        <div className="feature-card safe">
          <div className="feature-icon">🛡️</div>
          <h3>100% Safe</h3>
          <p>Certified & tested products</p>
        </div>
        <div className="feature-card delivery">
          <div className="feature-icon">🚚</div>
          <h3>Fast Delivery</h3>
          <p>Same day in Sivakasi</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="action-card sale" onClick={() => setShowCountdown(true)}>
          <span className="action-icon">🎉</span>
          <span>50% OFF</span>
        </button>
        <a href="https://wa.me/919566946632" className="action-card whatsapp">
          <span className="action-icon">📱</span>
          <span>WhatsApp</span>
        </a>
      </div>
    </div>
  );
}

export default Home;