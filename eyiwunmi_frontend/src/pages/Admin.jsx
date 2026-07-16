import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Dashboard state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [outfits, setOutfits] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalPageViews: 0,
    totalCartAdds: 0,
    totalCheckouts: 0,
    dailyViews: [],
    topOutfits: [],
    recentEvents: []
  });

  // Modal forms
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOutfit, setEditingOutfit] = useState(null);
  const [outfitForm, setOutfitForm] = useState({
    name: '',
    category: 'men',
    price: '',
    oldPrice: '',
    image: '',
    badge: '',
    badgeText: '',
    fabric: '',
    sizes: 'S, M, L, XL, 2XL',
    colours: '#D4AF37, #1F2937',
    description: '',
    availability: 'In Stock'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Sizing notes viewer modal
  const [viewingNotes, setViewingNotes] = useState(null);

  // Settings
  const [settingsForm, setSettingsForm] = useState({
    currentPasscode: '',
    newPasscode: ''
  });
  const [settingsMsg, setSettingsMsg] = useState({ type: '', text: '' });

  // Initial Auth Check
  useEffect(() => {
    const token = sessionStorage.getItem('eyiwunmi_admin_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch admin dashboard details
  useEffect(() => {
    let intervalId;
    if (isAuthenticated) {
      fetchDashboardData();
      // Enable real-time updates without socket.io via short polling
      intervalId = setInterval(() => {
        fetchDashboardData();
      }, 5000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAuthenticated, activeTab]);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Outfits
      const outfitsRes = await fetch(`${API_URL}/api/outfits`);
      if (outfitsRes.ok) {
        const data = await outfitsRes.json();
        setOutfits(data);
      }

      // 2. Fetch Enquiries
      const enquiriesRes = await fetch(`${API_URL}/api/enquiries`);
      if (enquiriesRes.ok) {
        const data = await enquiriesRes.json();
        setEnquiries(data);
      }

      // 3. Fetch Measurements
      const measurementsRes = await fetch(`${API_URL}/api/measurements`);
      if (measurementsRes.ok) {
        const data = await measurementsRes.json();
        setMeasurements(data);
      }

      // 4. Fetch Analytics
      const analyticsRes = await fetch(`${API_URL}/api/analytics`);
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }
    } catch (e) {
      console.error('Failed to load admin dashboard statistics:', e);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode })
      });
      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('eyiwunmi_admin_token', data.token);
        setIsAuthenticated(true);
      } else {
        const err = await response.json();
        setLoginError(err.error || 'Authentication failed.');
      }
    } catch (err) {
      setLoginError('Error connecting to backend API.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('eyiwunmi_admin_token');
    setIsAuthenticated(false);
    setPasscode('');
  };

  // Outfit CRUD
  const openAddOutfit = () => {
    setEditingOutfit(null);
    setOutfitForm({
      name: '',
      category: 'men',
      price: '',
      oldPrice: '',
      image: '',
      badge: '',
      badgeText: '',
      fabric: '',
      sizes: 'S, M, L, XL, 2XL',
      colours: '#D4AF37, #1F2937',
      description: '',
      availability: 'In Stock'
    });
    setImageFile(null);
    setImagePreview('');
    setIsModalOpen(true);
  };

  const openEditOutfit = (item) => {
    setEditingOutfit(item);
    setOutfitForm({
      name: item.name,
      category: item.category,
      price: item.price,
      oldPrice: item.oldPrice || '',
      image: item.image,
      badge: item.badge || '',
      badgeText: item.badgeText || '',
      fabric: item.fabric || '',
      sizes: item.sizes || 'S, M, L, XL, 2XL',
      colours: (item.colours || []).join(', '),
      description: item.description || '',
      availability: item.availability || 'In Stock'
    });
    setImageFile(null);
    setImagePreview(item.image.startsWith('http') || item.image.startsWith('data:') ? item.image : `/${item.image}`);
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveOutfit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', outfitForm.name);
    formData.append('category', outfitForm.category);
    formData.append('price', outfitForm.price);
    formData.append('oldPrice', outfitForm.oldPrice);
    formData.append('description', outfitForm.description);
    formData.append('fabric', outfitForm.fabric);
    formData.append('sizes', outfitForm.sizes);
    formData.append('colours', outfitForm.colours);
    formData.append('availability', outfitForm.availability);
    formData.append('badge', outfitForm.badge);
    formData.append('badgeText', outfitForm.badgeText);
    
    if (imageFile) {
      formData.append('imageFile', imageFile);
    } else {
      formData.append('image', outfitForm.image);
    }

    try {
      const url = editingOutfit
        ? `${API_URL}/api/outfits/${editingOutfit.id}`
        : `${API_URL}/api/outfits`;
      const method = editingOutfit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formData
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchDashboardData();
        alert(editingOutfit ? 'Outfit updated successfully.' : 'Outfit created successfully.');
      } else {
        alert('Failed to save outfit.');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving outfit record.');
    }
  };

  const deleteOutfit = async (id) => {
    if (window.confirm('Are you sure you want to delete this outfit?')) {
      try {
        const response = await fetch(`${API_URL}/api/outfits/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchDashboardData();
        } else {
          alert('Failed to delete outfit.');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Inbox Enquiries
  const deleteEnquiry = async (id) => {
    if (window.confirm('Delete this message?')) {
      try {
        const response = await fetch(`${API_URL}/api/enquiries/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchDashboardData();
        }
      } catch (e) {}
    }
  };

  const clearAllEnquiries = async () => {
    if (window.confirm('Are you sure you want to clear ALL enquiries?')) {
      try {
        const response = await fetch(`${API_URL}/api/enquiries`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchDashboardData();
        }
      } catch (e) {}
    }
  };

  // Measurements CRM
  const deleteMeasurement = async (id) => {
    if (window.confirm('Delete this measurement sheet?')) {
      try {
        const response = await fetch(`${API_URL}/api/measurements/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchDashboardData();
        }
      } catch (e) {}
    }
  };

  // Settings updating
  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setSettingsMsg({ type: '', text: '' });
    try {
      const response = await fetch(`${API_URL}/api/change-passcode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm)
      });
      const data = await response.json();
      if (response.ok) {
        setSettingsMsg({ type: 'success', text: 'Passcode updated! Re-login required.' });
        setSettingsForm({ currentPasscode: '', newPasscode: '' });
        setTimeout(() => handleLogout(), 2000);
      } else {
        setSettingsMsg({ type: 'error', text: data.error || 'Failed to update passcode.' });
      }
    } catch (err) {
      setSettingsMsg({ type: 'error', text: 'Failed to connect to API.' });
    }
  };

  // Render Login state if not authenticated
  if (!isAuthenticated) {
    return (
      <div style={{
        background: 'var(--purple-950)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          background: 'var(--purple-900)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '400px',
          padding: '36px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          color: 'white',
          textAlign: 'center'
        }}>
          <img src="/eyiwunmi_images/logo.png" alt="Logo" style={{ width: '80px', margin: '0 auto 16px', border: '2px solid var(--gold)', borderRadius: '50%' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', marginBottom: '8px' }}>Eyiwunmi Admin</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '24px' }}>Please authenticate using the admin passcode</p>
          
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Enter admin passcode"
              required
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '2px solid rgba(255,255,255,0.1)',
                background: 'rgba(0,0,0,0.2)',
                color: 'white',
                fontSize: '1rem',
                marginBottom: '16px',
                textAlign: 'center',
                outline: 'none'
              }}
            />
            {loginError && <p style={{ color: 'var(--red-500)', fontSize: '0.85rem', marginBottom: '16px' }}>⚠️ {loginError}</p>}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
                color: 'var(--purple-950)',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(212,175,55,0.3)'
              }}
            >
              Sign In ✦
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard calculations
  const totalOutfits = outfits.length;
  const traditionalCount = outfits.filter(o => o.category === 'asoebi' || o.category === 'kids').length;
  const suitCount = outfits.filter(o => o.category === 'men' && (o.image && o.image.includes('suit')) || o.name.toLowerCase().includes('suit')).length;
  const inboxCount = enquiries.length;

  return (
    <div className="admin-body">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-brand-header">
          <img src="/eyiwunmi_images/logo.png" alt="Logo" className="admin-brand-logo" />
          <span className="admin-brand-name">Eyiwunmi <span>✦</span></span>
        </div>
        <ul className="admin-menu-list">
          <li className={`admin-menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('dashboard')}>
              <span className="icon">📊</span>
              <span>Dashboard</span>
            </button>
          </li>
          <li className={`admin-menu-item ${activeTab === 'outfits' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('outfits')}>
              <span className="icon">👗</span>
              <span>Outfits Manager</span>
            </button>
          </li>
          <li className={`admin-menu-item ${activeTab === 'inbox' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('inbox')}>
              <span className="icon">📬</span>
              <span>Inbox ({inboxCount})</span>
            </button>
          </li>
          <li className={`admin-menu-item ${activeTab === 'measurements' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('measurements')}>
              <span className="icon">📐</span>
              <span>Measurements</span>
            </button>
          </li>
          <li className={`admin-menu-item ${activeTab === 'analytics' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('analytics')}>
              <span className="icon">📈</span>
              <span>Analytics</span>
            </button>
          </li>
          <li className={`admin-menu-item ${activeTab === 'settings' ? 'active' : ''}`}>
            <button onClick={() => setActiveTab('settings')}>
              <span className="icon">⚙️</span>
              <span>Settings</span>
            </button>
          </li>
        </ul>
        <div style={{ marginTop: 'auto', padding: '10px 0', textAlign: 'center' }}>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.6)',
              padding: '6px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              transition: 'var(--transition)'
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="admin-main-content">
        <header className="admin-content-header">
          <h1 style={{ textTransform: 'capitalize' }}>
            {activeTab === 'dashboard' ? 'Overview' : activeTab === 'outfits' ? 'Inventory' : activeTab}
          </h1>
          {activeTab === 'outfits' && (
            <button className="btn-admin-primary" onClick={openAddOutfit}>
              ➕ Add Outfit
            </button>
          )}
        </header>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="info">
                  <h3>Total Outfits</h3>
                  <div className="number">{totalOutfits}</div>
                </div>
                <div className="icon-box">🧥</div>
              </div>
              <div className="admin-stat-card">
                <div className="info">
                  <h3>Traditional</h3>
                  <div className="number">{traditionalCount}</div>
                </div>
                <div className="icon-box">👘</div>
              </div>
              <div className="admin-stat-card">
                <div className="info">
                  <h3>English Suits</h3>
                  <div className="number">{suitCount}</div>
                </div>
                <div className="icon-box">👔</div>
              </div>
              <div className="admin-stat-card">
                <div className="info">
                  <h3>Customer Enquiries</h3>
                  <div className="number">{inboxCount}</div>
                </div>
                <div className="icon-box">✉️</div>
              </div>
            </div>

            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-light)', marginBottom: '16px' }}>
              Recent Customer Messages
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {enquiries.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--purple-900)',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderLeft: '4px solid var(--gold)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
                    <strong style={{ color: 'var(--gold-light)', fontSize: '1rem' }}>{item.name}</strong>
                    <span>{item.date}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--purple-500)', marginBottom: '10px' }}>📧 {item.email}</div>
                  <p style={{ color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.15)', padding: '12px', borderRadius: '8px', fontSize: '0.95rem' }}>
                    {item.message}
                  </p>
                </div>
              ))}
              {enquiries.length === 0 && (
                <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '40px' }}>No unread enquiries.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: OUTFITS MANAGER */}
        {activeTab === 'outfits' && (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Img</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Fabric</th>
                  <th>Badge</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {outfits.map((item) => {
                  const imgUrl = item.image.startsWith('http') || item.image.startsWith('data:')
                    ? item.image
                    : `/${item.image}`;
                  return (
                    <tr key={item.id}>
                      <td>
                        <img
                          src={imgUrl}
                          className="admin-img-cell"
                          alt={item.name}
                          onError={(e) => {
                            e.target.src = '/eyiwunmi_images/logo.png';
                          }}
                        />
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--gold-light)' }}>{item.name}</td>
                      <td style={{ textTransform: 'capitalize' }}>{item.category}</td>
                      <td style={{ fontWeight: 700 }}>{item.price}</td>
                      <td>{item.fabric || '-'}</td>
                      <td>
                        <span className={`admin-badge-span ${item.badge || 'none'}`}>
                          {item.badgeText || 'None'}
                        </span>
                      </td>
                      <td>
                        <button className="admin-btn-action edit" onClick={() => openEditOutfit(item)}>
                          ✏️ Edit
                        </button>
                        <button className="admin-btn-action delete" onClick={() => deleteOutfit(item.id)}>
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {outfits.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>
                      No outfits in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: INBOX */}
        {activeTab === 'inbox' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
              <button
                className="admin-btn-action delete"
                style={{ padding: '10px 20px', borderRadius: '8px' }}
                onClick={clearAllEnquiries}
                disabled={enquiries.length === 0}
              >
                🧹 Clear All Messages
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {enquiries.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--purple-900)',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    position: 'relative'
                  }}
                >
                  <button
                    onClick={() => deleteEnquiry(item.id)}
                    style={{
                      position: 'absolute',
                      top: '20px',
                      right: '20px',
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.3)',
                      fontSize: '1.2rem',
                      cursor: 'pointer'
                    }}
                  >
                    ✕
                  </button>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h3 style={{ color: 'var(--gold-light)' }}>{item.name}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>{item.date}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--purple-500)', fontWeight: 500, marginBottom: '12px' }}>
                    📧 {item.email}
                  </div>
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: 1.6,
                    background: 'rgba(0, 0, 0, 0.15)',
                    padding: '16px',
                    borderRadius: '10px',
                    borderLeft: '3px solid var(--gold)'
                  }}>
                    {item.message}
                  </p>
                </div>
              ))}
              {enquiries.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.4)' }}>
                  📬 Your inbox is clean. No enquiries yet!
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: MEASUREMENTS */}
        {activeTab === 'measurements' && (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Contact</th>
                  <th>Shoulder/Chest</th>
                  <th>Waist/Hips</th>
                  <th>Sleeve/Length</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600, color: 'var(--gold-light)' }}>{item.name}</td>
                    <td>
                      <div>📧 {item.email}</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>📞 {item.phone}</div>
                    </td>
                    <td>
                      <div>Sh: {item.shoulder || '-'} "</div>
                      <div>Ch: {item.chest || '-'} "</div>
                    </td>
                    <td>
                      <div>Waist: {item.waist || '-'} "</div>
                      <div>Hips: {item.hips || '-'} "</div>
                    </td>
                    <td>
                      <div>Sl: {item.sleeve || '-'} "</div>
                      <div>Ln: {item.length || '-'} "</div>
                    </td>
                    <td style={{ fontSize: '0.8rem', opacity: 0.75 }}>
                      {new Date(item.submittedAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="admin-btn-action edit"
                        style={{ background: 'rgba(167, 139, 250, 0.15)', color: 'var(--purple-500)', borderColor: 'rgba(167, 139, 250, 0.3)' }}
                        onClick={() => setViewingNotes(item)}
                      >
                        👁 View Notes
                      </button>
                      <button className="admin-btn-action delete" onClick={() => deleteMeasurement(item.id)}>
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {measurements.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>
                      No client measurement sheets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div>
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="info">
                  <h3>Page Views</h3>
                  <div className="number">{analytics.totalPageViews}</div>
                </div>
                <div className="icon-box">👁</div>
              </div>
              <div className="admin-stat-card">
                <div className="info">
                  <h3>Top Outfit Views</h3>
                  <div className="number">
                    {analytics.topOutfits.reduce((a, b) => a + b.views, 0)}
                  </div>
                </div>
                <div className="icon-box">👗</div>
              </div>
              <div className="admin-stat-card">
                <div className="info">
                  <h3>Cart Additions</h3>
                  <div className="number">{analytics.totalCartAdds}</div>
                </div>
                <div className="icon-box">🛒</div>
              </div>
              <div className="admin-stat-card">
                <div className="info">
                  <h3>WhatsApp Checkouts</h3>
                  <div className="number">{analytics.totalCheckouts}</div>
                </div>
                <div className="icon-box">💬</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              {/* Top outfits views */}
              <div style={{ background: 'var(--purple-900)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ color: 'var(--gold)', marginBottom: '16px', fontFamily: 'var(--font-display)' }}>
                  🔥 Most Viewed Outfits
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {analytics.topOutfits.map((item, idx) => (
                    <div key={item.id} style={{ display: 'flex', justify: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                      <span>{idx + 1}. {item.name}</span>
                      <strong style={{ color: 'var(--gold)' }}>{item.views} views</strong>
                    </div>
                  ))}
                  {analytics.topOutfits.length === 0 && <p style={{ color: 'rgba(255,255,255,0.4)' }}>No views logged yet.</p>}
                </div>
              </div>

              {/* Daily traffic */}
              <div style={{ background: 'var(--purple-900)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ color: 'var(--gold)', marginBottom: '16px', fontFamily: 'var(--font-display)' }}>
                  📅 Daily Traffic
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {analytics.dailyViews.slice(-7).map((item) => (
                    <div key={item.date} style={{ display: 'flex', justify: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                      <span>{item.date}</span>
                      <strong>{item.views} visits</strong>
                    </div>
                  ))}
                  {analytics.dailyViews.length === 0 && <p style={{ color: 'rgba(255,255,255,0.4)' }}>No visitors logged yet.</p>}
                </div>
              </div>
            </div>

            {/* Event logs */}
            <div style={{ background: 'var(--purple-900)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ color: 'var(--gold)', marginBottom: '16px', fontFamily: 'var(--font-display)' }}>
                📜 Recent Activity Feed
              </h3>
              <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {analytics.recentEvents.map((evt, idx) => (
                  <div key={idx} style={{ fontSize: '0.85rem', padding: '6px 12px', borderLeft: '3px solid var(--purple-500)', background: 'rgba(0,0,0,0.1)' }}>
                    <span style={{ color: 'var(--gold-light)' }}>[{new Date(evt.timestamp).toLocaleTimeString()}]</span>{' '}
                    <strong>{evt.type.replace('_', ' ').toUpperCase()}</strong>:{' '}
                    <span style={{ opacity: 0.85 }}>{JSON.stringify(evt.data)}</span>
                  </div>
                ))}
                {analytics.recentEvents.length === 0 && <p style={{ color: 'rgba(255,255,255,0.4)' }}>No events logged.</p>}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="admin-table-container" style={{ padding: '28px', background: 'var(--purple-900)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--gold-light)', marginBottom: '8px' }}>
              🔒 Admin Passcode Settings
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Modify the authentication passcode required to access this dashboard.
            </p>
            <form onSubmit={handleSettingsSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Current Passcode</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter current passcode"
                    value={settingsForm.currentPasscode}
                    onChange={(e) => setSettingsForm({ ...settingsForm, currentPasscode: e.target.value })}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>New Passcode (min 6 characters)</label>
                  <input
                    type="password"
                    required
                    minlength="6"
                    placeholder="Enter new passcode"
                    value={settingsForm.newPasscode}
                    onChange={(e) => setSettingsForm({ ...settingsForm, newPasscode: e.target.value })}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                  />
                </div>
              </div>
              
              {settingsMsg.text && (
                <div style={{
                  marginBottom: '20px',
                  color: settingsMsg.type === 'success' ? 'var(--teal-500)' : 'var(--red-500)',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}>
                  {settingsMsg.text}
                </div>
              )}

              <button type="submit" className="btn-admin-primary" style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', color: 'white' }}>
                🔐 Update Passcode
              </button>
            </form>
          </div>
        )}
      </main>

      {/* CRUD OUTFIT MODAL */}
      {isModalOpen && (
        <div className="modal-overlay open" style={{ display: 'flex' }} onClick={() => setIsModalOpen(false)}>
          <div className="modal" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <header className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>
                {editingOutfit ? 'Edit Outfit Details' : 'Add Outfit'}
              </h2>
              <button className="close-modal" onClick={() => setIsModalOpen(false)}>✕</button>
            </header>

            <form onSubmit={saveOutfit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Outfit Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Royal Agbada"
                    value={outfitForm.name}
                    onChange={(e) => setOutfitForm({ ...outfitForm, name: e.target.value })}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Category</label>
                  <select
                    value={outfitForm.category}
                    onChange={(e) => setOutfitForm({ ...outfitForm, category: e.target.value })}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                  >
                    <option value="men" style={{ background: '#1C1026' }}>Men</option>
                    <option value="women" style={{ background: '#1C1026' }}>Women</option>
                    <option value="kids" style={{ background: '#1C1026' }}>Kids</option>
                    <option value="asoebi" style={{ background: '#1C1026' }}>Asoebi</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Price</label>
                  <input
                    type="text"
                    required
                    placeholder="₦80,000"
                    value={outfitForm.price}
                    onChange={(e) => setOutfitForm({ ...outfitForm, price: e.target.value })}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Old Price (Optional)</label>
                  <input
                    type="text"
                    placeholder="₦100,000"
                    value={outfitForm.oldPrice}
                    onChange={(e) => setOutfitForm({ ...outfitForm, oldPrice: e.target.value })}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Fabric Material</label>
                  <input
                    type="text"
                    required
                    placeholder="Premium Brocade Lace"
                    value={outfitForm.fabric}
                    onChange={(e) => setOutfitForm({ ...outfitForm, fabric: e.target.value })}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Available Sizes</label>
                  <input
                    type="text"
                    required
                    placeholder="S, M, L, XL, 2XL"
                    value={outfitForm.sizes}
                    onChange={(e) => setOutfitForm({ ...outfitForm, sizes: e.target.value })}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Colours (Comma-separated Hex, e.g. #D4AF37, #000)</label>
                  <input
                    type="text"
                    required
                    placeholder="#D4AF37, #1F2937"
                    value={outfitForm.colours}
                    onChange={(e) => setOutfitForm({ ...outfitForm, colours: e.target.value })}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Badge (Optional)</label>
                  <select
                    value={outfitForm.badge}
                    onChange={(e) => setOutfitForm({ ...outfitForm, badge: e.target.value })}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                  >
                    <option value="" style={{ background: '#1C1026' }}>None</option>
                    <option value="new" style={{ background: '#1C1026' }}>New</option>
                    <option value="sale" style={{ background: '#1C1026' }}>Sale</option>
                    <option value="luxury" style={{ background: '#1C1026' }}>Luxury</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Badge Text</label>
                  <input
                    type="text"
                    placeholder="New / Sale / Hot"
                    value={outfitForm.badgeText}
                    onChange={(e) => setOutfitForm({ ...outfitForm, badgeText: e.target.value })}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Image File Upload (Converts to Base64 in Database)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                  />
                  {imagePreview && (
                    <div style={{ marginTop: '10px' }}>
                      <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Image Preview:</p>
                      <img src={imagePreview} alt="Preview" style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }} />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Description</label>
                  <textarea
                    required
                    placeholder="Describe the dress/suit detailing..."
                    value={outfitForm.description}
                    onChange={(e) => setOutfitForm({ ...outfitForm, description: e.target.value })}
                    style={{ padding: '10px 14px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', resize: 'vertical', minHeight: '80px' }}
                  ></textarea>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-admin-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEWING CRM NOTES MODAL */}
      {viewingNotes && (
        <div className="modal-overlay open" style={{ display: 'flex' }} onClick={() => setViewingNotes(null)}>
          <div className="modal" style={{ maxWidth: '450px', background: '#1C1026' }} onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setViewingNotes(null)}>✕</button>
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', marginBottom: '16px' }}>
              📐 Custom Sizing Notes
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.95rem' }}>
              <div>
                <strong>Client:</strong> {viewingNotes.name}
              </div>
              <div>
                <strong>Height:</strong> {viewingNotes.height || '-'}
              </div>
              <div style={{
                marginTop: '10px',
                background: 'rgba(0,0,0,0.25)',
                padding: '16px',
                borderRadius: '8px',
                borderLeft: '3px solid var(--purple-500)'
              }}>
                <strong style={{ color: 'var(--gold-light)', display: 'block', marginBottom: '6px' }}>Special Request Guidelines:</strong>
                <p style={{ lineHeight: 1.5, color: 'rgba(255,255,255,0.9)' }}>
                  {viewingNotes.notes || 'No custom notes provided.'}
                </p>
              </div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn-admin-primary"
                onClick={() => setViewingNotes(null)}
              >
                Close Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
