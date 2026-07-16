import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Footer() {
  const location = useLocation();

  // Hide default footer inside the admin panel
  const isAdmin = location.pathname.startsWith('/admin');
  if (isAdmin) return null;

  return (
    <footer className="footer">
      <div className="container">
        <div className="brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <img
              src="/eyiwunmi_images/logo.png"
              alt="Eyiwunmi Logo"
              style={{ width: '48px', height: '48px', objectFit: 'contain' }}
            />
            <h3 style={{ marginBottom: 0, fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--white)' }}>
              Eyiwunmi
            </h3>
          </div>
          <p>Bespoke fashion for the modern individual — where tradition meets trend.</p>
          <p style={{ marginTop: '8px', opacity: 0.5, fontSize: '0.85rem' }}>Lagos · London</p>
        </div>

        <div className="links">
          <h4>Navigation</h4>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/wardrobe">Wardrobe</Link>
            </li>
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/contact">Contact Us</Link>
            </li>
          </ul>
        </div>

        <div className="contact-footer">
          <h4>Reach Us</h4>
          <p>2, Olokunola Street, Sholebo Estate, Lagos</p>
          <p className="email" style={{ color: 'var(--gold)' }}>eyiwunmifashion@gmail.com</p>
          <p style={{ marginTop: '4px' }}>+234 802 701 6178</p>
        </div>

        <div className="bottom">
          &copy; {new Date().getFullYear()} Eyiwunmi Fashion. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
