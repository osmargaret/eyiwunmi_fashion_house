import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import MeasurementModal from './components/MeasurementModal';

// Pages
import Home from './pages/Home';
import Wardrobe from './pages/Wardrobe';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';

function GlobalLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      <Navbar />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/wardrobe" element={<Wardrobe />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>

      <Footer />
      <CartDrawer />
      <MeasurementModal />

      {/* Floating Pulsing WhatsApp Widget */}
      {!isAdmin && (
        <a
          href="https://wa.me/2348027016178?text=Hi%20Eyiwunmi%20Fashion!%20I'm%20visiting%20your%20website%20and%20would%20love%20to%20make%20an%20enquiry."
          className="whatsapp-floating-widget"
          target="_blank"
          rel="noreferrer"
          aria-label="Chat on WhatsApp"
        >
          <span className="wa-icon">💬</span>
          <span className="wa-number">+234 802 701 6178</span>
        </a>
      )}
    </>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Router>
        <GlobalLayout />
      </Router>
    </CartProvider>
  );
}
