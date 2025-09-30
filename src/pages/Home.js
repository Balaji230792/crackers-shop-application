import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home">
      <div className="discount-banner">
        <h2>🎉 MEGA DIWALI SALE - 50% OFF ON ALL PRODUCTS! 🎉</h2>
        <p>Limited Time Offer - Grab Your Favorite Crackers Now!</p>
      </div>
      <section className="hero">
        <h2>Mahin Crackers - Premium Quality Since 2025</h2>
        <p>Sivakasi's finest crackers with authentic pricing</p>
        <Link to="/products" className="cta-button">Shop Now</Link>
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