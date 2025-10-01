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
    // Create WhatsApp message
    const message = `Hi! I'm ${formData.name}%0AEmail: ${formData.email}%0APhone: ${formData.phone}%0AMessage: ${formData.message}`;
    const whatsappUrl = `https://wa.me/919566946632?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    // Reset form
    setFormData({ name: '', email: '', phone: '', message: '' });
    alert('Redirecting to WhatsApp...');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="contact-container">
      <div className="contact-header">
        <h2>Contact Us</h2>
        <p>Get in touch with Mahin Crackers for all your Diwali needs!</p>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <h3>📍 Store Information</h3>
          <div className="info-item">
            <strong>📍 Address:</strong>
            <p>Mahin Crackers<br/>Sivakasi, Tamil Nadu</p>
          </div>
          
          <div className="info-item">
            <strong>📞 Phone:</strong>
            <p>+91 9566946632</p>
          </div>
          
          <div className="info-item">
            <strong>📧 Email:</strong>
            <p>admin@mahin.com</p>
          </div>
          
          <div className="info-item">
            <strong>🕒 Business Hours:</strong>
            <p>Monday - Sunday: 9:00 AM - 9:00 PM</p>
          </div>

          <div className="whatsapp-direct">
            <h4>💬 Quick Contact</h4>
            <a href="https://wa.me/919566946632" target="_blank" rel="noopener noreferrer" className="whatsapp-btn-large">
              <span className="whatsapp-icon">📱</span>
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>

        <div className="contact-form">
          <h3>📝 Send us a Message</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <input
                type="tel"
                name="phone"
                placeholder="Your Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <textarea
                name="message"
                placeholder="Your Message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            
            <button type="submit" className="submit-btn">
              Send via WhatsApp 📱
            </button>
          </form>
        </div>
      </div>

      <div className="safety-info">
        <h3>🛡️ Safety Guidelines</h3>
        <div className="safety-tips">
          <p>• Always supervise children when using crackers</p>
          <p>• Keep water/sand nearby while bursting crackers</p>
          <p>• Follow local guidelines and timings</p>
          <p>• Store crackers in cool, dry places</p>
        </div>
      </div>
    </div>
  );
}

export default Contact;