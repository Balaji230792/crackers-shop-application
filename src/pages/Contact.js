import React, { useState } from 'react';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = `Hi! I'm ${formData.name}%0AEmail: ${formData.email}%0APhone: ${formData.phone}%0AMessage: ${formData.message}`;
    const whatsappUrl = `https://wa.me/919566946632?text=${message}`;
    window.open(whatsappUrl, '_blank');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="hero-particles"></div>
        <h1>Get in Touch</h1>
        <p>We're here to make your Diwali celebrations spectacular</p>
      </div>

      <div className="contact-grid">
        <div className="contact-card info-card">
          <div className="card-header">
            <h3>📍 Visit Our Store</h3>
          </div>
          <div className="contact-details">
            <div className="detail-item">
              <span className="icon">📍</span>
              <div>
                <strong>Address</strong>
                <p>Sivakasi, Tamil Nadu</p>
              </div>
            </div>
            <div className="detail-item">
              <span className="icon">📞</span>
              <div>
                <strong>Phone</strong>
                <p>+91 9566946632</p>
              </div>
            </div>
            <div className="detail-item">
              <span className="icon">🕒</span>
              <div>
                <strong>Hours</strong>
                <p>9:00 AM - 9:00 PM</p>
              </div>
            </div>
          </div>
          <a href="https://wa.me/919566946632" className="whatsapp-cta">
            <span>💬</span> Chat on WhatsApp
          </a>
        </div>

        <div className="contact-card form-card">
          <div className="card-header">
            <h3>📝 Send Message</h3>
          </div>
          <form onSubmit={handleSubmit} className="elegant-form">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Your Phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <textarea
              name="message"
              placeholder="Your Message"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
            <button type="submit">
              Send via WhatsApp 📱
            </button>
          </form>
        </div>
      </div>

      <div className="safety-section">
        <h3>🛡️ Safety First</h3>
        <div className="safety-grid">
          <div className="safety-tip">👶 Supervise children</div>
          <div className="safety-tip">💧 Keep water nearby</div>
          <div className="safety-tip">📋 Follow guidelines</div>
          <div className="safety-tip">🏠 Store safely</div>
        </div>
      </div>
    </div>
  );
}

export default Contact;