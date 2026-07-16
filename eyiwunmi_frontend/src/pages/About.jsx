import React, { useEffect } from 'react';
import { API_URL } from '../config';

export default function About() {
  useEffect(() => {
    // Track about page view
    try {
      fetch(`${API_URL}/api/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'page_view', data: { page: 'About' } })
      }).catch(() => {});
    } catch (e) {}
  }, []);

  return (
    <>
      <div className="page-hero" style={{ backgroundImage: "url('/eyiwunmi_images/luxury_materials.png')" }}>
        <div className="page-hero-content">
          <h1 className="page-hero-title"><span className="icon" role="img" aria-label="sparkles">✨</span> Our Story</h1>
          <p className="page-hero-sub">Celebrating identity and elegance through every thread and fabric.</p>
        </div>
      </div>
      <section className="page-section" style={{ marginTop: '0', paddingTop: '20px' }}>
        <div className="container">
          <div className="about-grid">
          <div className="about-text">
            <h2>About Eyiwunmi Fashion</h2>
            <p>
              At Eyiwunmi Fashion, we believe that style is a celebration of identity.
              Our boutique brings together the finest fabrics, bold designs, and cultural
              richness to create pieces that make you feel extraordinary.
            </p>
            <p>
              From bespoke suits to flowing gowns, every outfit is crafted with care,
              ensuring you look and feel your best for every moment that matters.
            </p>

            <div className="address-block">
              <h4>📍 Nigeria</h4>
              <p>2, Olokunola Street, Sholebo Estate,</p>
              <p>Lagos, Nigeria.</p>
            </div>
            <div className="address-block" style={{ marginTop: '12px', borderLeftColor: 'var(--gold)' }}>
              <h4>🇬🇧 United Kingdom</h4>
              <p>London, UK (by appointment)</p>
            </div>
            <div style={{ marginTop: '16px' }}>
              <p style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1rem', color: 'var(--purple-700)' }}>
                <span style={{ fontSize: '1.3rem' }}>✉</span>
                <a href="mailto:eyiwunmifashion@gmail.com" style={{ fontWeight: 500 }}>
                  eyiwunmifashion@gmail.com
                </a>
              </p>
            </div>
          </div>
          <div className="about-image">
            <img
              src="/eyiwunmi_images/CEO_OF_EYIWUNMI_FASHION.jpg"
              alt="Enifonme Ephraim - CEO of Eyiwunmi Fashion"
              className="ceo-profile-img"
              onError={(e) => {
                e.target.src = '/eyiwunmi_images/logo.png';
              }}
            />
            <h3 style={{ marginTop: '20px' }}>Enifonme Ephraim</h3>
            <p
              style={{
                color: 'var(--purple-500)',
                fontSize: '0.82rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginTop: '4px'
              }}
            >
              Founder &amp; Creative Director
            </p>
            <p style={{ color: 'var(--gray-600)', marginTop: '12px', maxWidth: '360px', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Every piece begins as an untold story. With a unique mastery of her craft, Enifonme handpicks raw,
              untouched fabrics—luxury lace, shimmering silk, and rich Aso-oke—and breathes life into them. She weaves
              character and culture into every thread, turning simple bare materials into bespoke, elegant masterpieces
              that celebrate identity and elegance.
            </p>
          </div>
        </div>
      </div>
      </section>
    </>
  );
}
