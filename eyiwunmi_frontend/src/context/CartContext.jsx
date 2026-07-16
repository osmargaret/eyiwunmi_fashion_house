import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [attachMeasurements, setAttachMeasurements] = useState(false);
  const [savedMeasurements, setSavedMeasurements] = useState(null);

  // Load initial cart and measurements on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('eyiwunmi_cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        setCart([]);
      }
    }

    const storedMeasurements = localStorage.getItem('eyiwunmi_temp_measurements');
    if (storedMeasurements) {
      try {
        const parsed = JSON.parse(storedMeasurements);
        setSavedMeasurements(parsed);
        setAttachMeasurements(true);
      } catch (e) {
        setSavedMeasurements(null);
      }
    }
  }, []);

  // Sync cart to localStorage whenever it changes
  const saveCartState = (newCart) => {
    setCart(newCart);
    localStorage.setItem('eyiwunmi_cart', JSON.stringify(newCart));
  };

  const addToCart = (item, size, color) => {
    const existing = cart.find(
      (x) => x.id === item.id && x.size === size && x.color === color
    );

    let newCart = [];
    if (existing) {
      newCart = cart.map((x) =>
        x.id === item.id && x.size === size && x.color === color
          ? { ...x, quantity: x.quantity + 1 }
          : x
      );
    } else {
      newCart = [
        ...cart,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          size,
          color,
          quantity: 1
        }
      ];
    }

    saveCartState(newCart);

    // Track cart addition
    try {
      fetch(`${API_URL}/api/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'cart_add',
          data: { outfitId: item.id, outfitName: item.name, size, color }
        })
      }).catch(() => {});
    } catch (e) {}

    // Open drawer automatically
    setIsCartOpen(true);
  };

  const updateQuantity = (index, diff) => {
    const newCart = [...cart];
    newCart[index].quantity += diff;
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }
    saveCartState(newCart);
  };

  const removeCartItem = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    saveCartState(newCart);
  };

  const clearCart = () => {
    saveCartState([]);
  };

  const handleAttachMeasurementsCheckbox = (checked) => {
    setAttachMeasurements(checked);
    if (checked) {
      setIsMeasurementModalOpen(true);
    } else {
      localStorage.removeItem('eyiwunmi_temp_measurements');
      setSavedMeasurements(null);
    }
  };

  const saveMeasurementsSheet = (data) => {
    setSavedMeasurements(data);
    localStorage.setItem('eyiwunmi_temp_measurements', JSON.stringify(data));
    setAttachMeasurements(true);
  };

  const proceedToCheckout = () => {
    if (cart.length === 0) return;

    let messageText = 'Hi Eyiwunmi Fashion! ✦\nI would like to place an order for the following bespoke pieces:\n\n';
    let grandTotal = 0;

    cart.forEach((item, index) => {
      const priceNum = parseInt(item.price.replace(/[^\d]/g, '')) || 0;
      const subtotal = priceNum * item.quantity;
      grandTotal += subtotal;

      messageText += `${index + 1}. *${item.name}*\n   - Size: ${item.size}\n   - Color: ${item.color}\n   - Qty: ${item.quantity}\n   - Price: ${item.price}\n\n`;
    });

    messageText += `*Grand Total: ₦${grandTotal.toLocaleString()}*\n\n`;

    if (attachMeasurements && savedMeasurements) {
      const m = savedMeasurements;
      messageText += `*📐 Attached Tailoring Sheet:*\n`;
      messageText += `- Client Name: ${m.name}\n`;
      messageText += `- Phone: ${m.phone}\n`;
      messageText += `- Height: ${m.height || '-'}\n`;
      if (m.shoulder) messageText += `- Shoulder: ${m.shoulder}"\n`;
      if (m.chest) messageText += `- Chest: ${m.chest}"\n`;
      if (m.waist) messageText += `- Waist: ${m.waist}"\n`;
      if (m.hips) messageText += `- Hips: ${m.hips}"\n`;
      if (m.sleeve) messageText += `- Sleeve: ${m.sleeve}"\n`;
      if (m.length) messageText += `- Length: ${m.length}"\n`;
      if (m.notes) messageText += `- Special Requests: ${m.notes}\n`;
    }

    // Track checkout analytics
    try {
      fetch(`${API_URL}/api/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'checkout',
          data: { items: cart.length, total: grandTotal }
        })
      }).catch(() => {});
    } catch (e) {}

    const encodedText = encodeURIComponent(messageText);
    window.open(`https://wa.me/2348027016178?text=${encodedText}`, '_blank');
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartTotalValue = cart.reduce((total, item) => {
    const priceNum = parseInt(item.price.replace(/[^\d]/g, '')) || 0;
    return total + priceNum * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotalValue,
        isCartOpen,
        setIsCartOpen,
        isMeasurementModalOpen,
        setIsMeasurementModalOpen,
        attachMeasurements,
        setAttachMeasurements,
        savedMeasurements,
        addToCart,
        updateQuantity,
        removeCartItem,
        clearCart,
        handleAttachMeasurementsCheckbox,
        saveMeasurementsSheet,
        proceedToCheckout
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
