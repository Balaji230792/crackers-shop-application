import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [timeLeft, setTimeLeft] = useState({});
  const [currentCrackerIndex, setCurrentCrackerIndex] = useState(0);
  const [currentBrandIndex, setCurrentBrandIndex] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  // Enhanced cracker images with more variety
  const crackerImages = [
    { emoji: '🎆', name: 'Sparklers', color: '#FFD700', bg: 'linear-gradient(45deg, #FFD700, #FFA500)' },
    { emoji: '🎇', name: 'Fountains', color: '#FF6B35', bg: 'linear-gradient(45deg, #FF6B35, #FF4500)' },
    { emoji: '🧨', name: 'Sound Crackers', color: '#E74C3C', bg: 'linear-gradient(45deg, #E74C3C, #C0392B)' },
    { emoji: '🎊', name: 'Multi Shots', color: '#9B59B6', bg: 'linear-gradient(45deg, #9B59B6, #8E44AD)' },
    { emoji: '✨', name: 'Fancy Items', color: '#3498DB', bg: 'linear-gradient(45deg, #3498DB, #2980B9)' },
    { emoji: '🎁', name: 'Gift Sets', color: '#2ECC71', bg: 'linear-gradient(45deg, #2ECC71, #27AE60)' },
    { emoji: '🌟', name: 'Ground Chakkar', color: '#F39C12', bg: 'linear-gradient(45deg, #F39C12, #E67E22)' },
    { emoji: '🎯', name: 'Rockets', color: '#E91E63', bg: 'linear-gradient(45deg, #E91E63, #C2185B)' }
  ];

  // Enhanced brand details with more information
  const brandDetails = [
    {
      title: "Premium Quality Since 2020",
      description: "Sivakasi's finest crackers with authentic pricing and traditional craftsmanship",
      icon: "🏆",
      highlight: "5+ Years Experience"
    },
    {
      title: "100% Safe & Certified",
      description: "All products meet international safety standards with proper certifications",
      icon: "🛡️",
      highlight: "ISO Certified"
    },
    {
      title: "Lightning Fast Delivery",
      description: "Same day delivery in Sivakasi, 2-3 days across Tamil Nadu",
      icon: "🚚",
      highlight: "Same Day Delivery"
    },
    {
      title: "24/7 Customer Support",
      description: "Round the clock support via WhatsApp and phone calls",
      icon: "📞",
      highlight: "Always Available"
    },
    {
      title: "Best Price Guarantee",
      description: "Competitive pricing with 50% Diwali discount on all products",
      icon: "💰",
      highlight: "50% OFF"
    },
    {
      title: "Eco-Friendly Options",
      description: "Green crackers available for environmentally conscious celebrations",
      icon: "🌱",
      highlight: "Green Crackers"
    }
  ];

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const diwaliDate = new Date('2025-10-20T00:00:00'); // Diwali 2025
    
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

  // Auto-scroll for cracker images
  useEffect(() => {
    const crackerTimer = setInterval(() => {
      setCurrentCrackerIndex((prev) => (prev + 1) % crackerImages.length);
    }, 2000);

    return () => clearInterval(crackerTimer);
  }, [crackerImages.length]);

  // Auto-scroll for brand details
  useEffect(() => {
    const brandTimer = setInterval(() => {
      setCurrentBrandIndex((prev) => (prev + 1) % brandDetails.length);
    }, 3000);

    return () => clearInterval(brandTimer);
  }, [brandDetails.length]);

  return (
    <div className="home">
      {/* Hero Section with Parallax Effect */}
      <div className="hero-section" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="brand-name">Mahin Crackers</span>
              <span className="brand-tagline">Premium Sivakasi Fireworks</span>
            </h1>
            <p className="hero-description">
              Experience the joy of Diwali with our premium quality crackers.
              Authentic Sivakasi craftsmanship with modern safety standards.
            </p>
            <div className="hero-buttons">
              <Link to="/products" className="cta-primary">Shop Now</Link>
              <a href="https://wa.me/919566946632" className="cta-secondary">
                <span>📱</span> WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Diwali Countdown Banner */}
      <div className="countdown-banner">
        <div className="banner-content">
          <div className="banner-text">
            <h2>🎉 MEGA DIWALI SALE - 50% OFF ON ALL PRODUCTS! 🎉</h2>
            <p>Limited Time Offer - Celebrate with Premium Quality Crackers</p>
          </div>
          
          <div className="countdown-timer">
            <h3>🪔 Diwali Countdown 🪔</h3>
            {timeLeft.expired ? (
              <div className="countdown-expired">
                <span>🎆 Happy Diwali! 🎆</span>
                <p>Wishing you a bright and prosperous Diwali!</p>
              </div>
            ) : (
              <div className="timer-display">
                <div className="time-unit">
                  <span className="time-number">{timeLeft.days || 0}</span>
                  <span className="time-label">Days</span>
                </div>
                <div className="time-separator">:</div>
                <div className="time-unit">
                  <span className="time-number">{timeLeft.hours || 0}</span>
                  <span className="time-label">Hours</span>
                </div>
                <div className="time-separator">:</div>
                <div className="time-unit">
                  <span className="time-number">{timeLeft.minutes || 0}</span>
                  <span className="time-label">Minutes</span>
                </div>
                <div className="time-separator">:</div>
                <div className="time-unit">
                  <span className="time-number">{timeLeft.seconds || 0}</span>
                  <span className="time-label">Seconds</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="whatsapp-contact">
        <a href="https://wa.me/919566946632" target="_blank" rel="noopener noreferrer" className="whatsapp-btn">
          <span className="whatsapp-icon">📱</span>
          <span>WhatsApp: 9566946632</span>
        </a>
      </div>
      {/* Scrolling Cracker Images Section */}
      <section className="cracker-showcase">
        <div className="section-header">
          <h2>🎆 Our Premium Cracker Collection 🎆</h2>
          <p>Discover our wide range of high-quality fireworks for every celebration</p>
        </div>
        
        <div className="cracker-carousel">
          <div className="cracker-track">
            {crackerImages.map((cracker, index) => (
              <div 
                key={index}
                className={`cracker-card ${index === currentCrackerIndex ? 'active' : ''}`}
                style={{ background: cracker.bg }}
              >
                <div className="cracker-icon">{cracker.emoji}</div>
                <h4 className="cracker-title">{cracker.name}</h4>
                <div className="cracker-overlay">
                  <p>Premium Quality</p>
                  <Link to="/products" className="view-products">View Products</Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="carousel-indicators">
            {crackerImages.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentCrackerIndex ? 'active' : ''}`}
                onClick={() => setCurrentCrackerIndex(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Brand Features Section */}
      <section className="brand-showcase">
        <div className="section-header">
          <h2>🏢 Why Choose Mahin Crackers?</h2>
          <p>Your trusted partner for safe and spectacular celebrations</p>
        </div>
        
        <div className="brand-features">
          <div className="feature-spotlight">
            <div className="spotlight-content">
              <div className="spotlight-icon">{brandDetails[currentBrandIndex].icon}</div>
              <div className="spotlight-text">
                <h3>{brandDetails[currentBrandIndex].title}</h3>
                <p>{brandDetails[currentBrandIndex].description}</p>
                <span className="highlight-badge">{brandDetails[currentBrandIndex].highlight}</span>
              </div>
            </div>
          </div>
          
          <div className="features-grid">
            {brandDetails.map((feature, index) => (
              <div 
                key={index}
                className={`feature-card ${index === currentBrandIndex ? 'active' : ''}`}
                onClick={() => setCurrentBrandIndex(index)}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h4>{feature.title}</h4>
                <span className="feature-highlight">{feature.highlight}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">5000+</div>
            <div className="stat-label">Happy Customers</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">140+</div>
            <div className="stat-label">Product Varieties</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">100%</div>
            <div className="stat-label">Quality Assured</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Customer Support</div>
          </div>
        </div>
      </section>
      
      <section className="featured">
        <h3>Featured Categories</h3>
        <div className="categories">
          <div className="category">
            <h4>Sparklers</h4>
            <p>7cm to 50cm electric & colour sparklers</p>
          </div>
          <div className="category">
            <h4>Multi Shots</h4>
            <p>30 to 240 shot spectacular displays</p>
          </div>
          <div className="category">
            <h4>Fountains</h4>
            <p>Peacock, Rainbow & themed fountains</p>
          </div>
          <div className="category">
            <h4>Gift Sets</h4>
            <p>Complete cracker packages 21-51 items</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;