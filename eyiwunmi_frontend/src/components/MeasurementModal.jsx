import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { API_URL } from '../config';

export default function MeasurementModal() {
  const {
    isMeasurementModalOpen,
    setIsMeasurementModalOpen,
    saveMeasurementsSheet,
    savedMeasurements,
    setAttachMeasurements
  } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    shoulder: '',
    chest: '',
    waist: '',
    hips: '',
    sleeve: '',
    length: '',
    height: '',
    notes: ''
  });

  // Populate form if saved measurements exist
  useEffect(() => {
    if (savedMeasurements) {
      setFormData({
        name: savedMeasurements.name || '',
        phone: savedMeasurements.phone || '',
        email: savedMeasurements.email || '',
        shoulder: savedMeasurements.shoulder || '',
        chest: savedMeasurements.chest || '',
        waist: savedMeasurements.waist || '',
        hips: savedMeasurements.hips || '',
        sleeve: savedMeasurements.sleeve || '',
        length: savedMeasurements.length || '',
        height: savedMeasurements.height || '',
        notes: savedMeasurements.notes || ''
      });
    }
  }, [savedMeasurements]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleClose = () => {
    setIsMeasurementModalOpen(false);
    // If closing without saved measurements, untick checkbox
    if (!savedMeasurements) {
      setAttachMeasurements(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Post to local SQL backend
    try {
      const response = await fetch(`${API_URL}/api/measurements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        console.log('✅ Measurement card saved to SQL backend');
      }
    } catch (err) {
      console.warn('Backend server offline or unreachable during measurement submission:', err);
    }

    // Save state globally (attaches to checkout details)
    saveMeasurementsSheet(formData);
    setIsMeasurementModalOpen(false);
    alert('Tailoring sheet saved successfully and attached to your order!');
  };

  return (
    <div className={`modal-overlay ${isMeasurementModalOpen ? 'open' : ''}`} style={{ zIndex: 10002 }}>
      <div className="modal" style={{ maxWidth: '500px', padding: '28px', background: '#1C1026', border: '1px solid rgba(255,255,255,0.15)' }}>
        <button className="close-modal" onClick={handleClose} style={{ color: 'white', width: '32px', height: '32px' }}>
          ✕
        </button>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#D4AF37', marginBottom: '8px', fontSize: '1.6rem' }}>
          📐 Bespoke Tailoring Sheet
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginBottom: '20px' }}>
          Enter your custom measurements. These will be securely stored and linked to your order.
        </p>
        <form id="measurementForm" onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#D4AF37' }}>Name</label>
              <input
                type="text"
                id="name"
                required
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: 'white' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#D4AF37' }}>Phone</label>
              <input
                type="text"
                id="phone"
                required
                placeholder="+234..."
                value={formData.phone}
                onChange={handleChange}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: 'white' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#D4AF37' }}>Email</label>
              <input
                type="email"
                id="email"
                required
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.3)', color: 'white' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>Shoulder (inches)</label>
              <input
                type="number"
                id="shoulder"
                step="0.1"
                placeholder="18"
                value={formData.shoulder}
                onChange={handleChange}
                style={{ padding: '6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>Chest (inches)</label>
              <input
                type="number"
                id="chest"
                step="0.1"
                placeholder="40"
                value={formData.chest}
                onChange={handleChange}
                style={{ padding: '6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>Waist (inches)</label>
              <input
                type="number"
                id="waist"
                step="0.1"
                placeholder="34"
                value={formData.waist}
                onChange={handleChange}
                style={{ padding: '6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>Hips (inches)</label>
              <input
                type="number"
                id="hips"
                step="0.1"
                placeholder="42"
                value={formData.hips}
                onChange={handleChange}
                style={{ padding: '6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>Sleeve (inches)</label>
              <input
                type="number"
                id="sleeve"
                step="0.1"
                placeholder="25"
                value={formData.sleeve}
                onChange={handleChange}
                style={{ padding: '6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>Length (inches)</label>
              <input
                type="number"
                id="length"
                step="0.1"
                placeholder="41"
                value={formData.length}
                onChange={handleChange}
                style={{ padding: '6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>Height (ft/inches)</label>
              <input
                type="text"
                id="height"
                placeholder="e.g. 5ft 9in"
                value={formData.height}
                onChange={handleChange}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>Requests / Notes</label>
              <textarea
                id="notes"
                placeholder="Any specific fit guidelines..."
                value={formData.notes}
                onChange={handleChange}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white', resize: 'vertical', minHeight: '50px' }}
              ></textarea>
            </div>
          </div>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
              style={{ padding: '8px 16px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', borderRadius: '4px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: '8px 16px', background: '#D4AF37', border: 'none', color: '#1C1026', fontWeight: 700, borderRadius: '4px', cursor: 'pointer' }}
            >
              Save Tailoring Sheet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
