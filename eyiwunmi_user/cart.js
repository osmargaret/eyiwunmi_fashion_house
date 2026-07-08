// ============================================================
// EWYWUNMI SHOPPING CART & CRM SYSTEM
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    injectCartAndModalHTML();
    initCartNavigation();
    updateCartBadge();
});

// 1. Dynamic Markup Injection
function injectCartAndModalHTML() {
    // Inject Cart Drawer & Overlay
    const cartContainer = document.createElement('div');
    cartContainer.innerHTML = `
        <div id="cartOverlay" class="cart-overlay" onclick="toggleCartDrawer(event)"></div>
        <div id="cartDrawer" class="cart-drawer">
            <div class="cart-header">
                <h3>Your Cart</h3>
                <button class="btn-close-cart" onclick="toggleCartDrawer(event)">✕</button>
            </div>
            <div class="cart-items" id="cartItemsList"></div>
            <div class="cart-footer">
                <div class="cart-total">
                    <span>Total:</span>
                    <span id="cart-grand-total">₦0</span>
                </div>
                <div style="margin: 16px 0; display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" id="cart-attach-measurements" onchange="handleMeasurementCheckbox(this)" style="cursor: pointer; width: 16px; height: 16px;" />
                    <label for="cart-attach-measurements" style="font-size: 0.85rem; color: #D4AF37; font-weight: 600; cursor: pointer; user-select: none;">📐 Attach Bespoke Fit Measurements</label>
                </div>
                <button class="btn-checkout" onclick="proceedToCartCheckout()">Checkout via WhatsApp →</button>
            </div>
        </div>
    `;
    document.body.appendChild(cartContainer);

    // Inject Measurement Modal
    const measurementContainer = document.createElement('div');
    measurementContainer.innerHTML = `
        <div id="measurementModal" class="modal-overlay" style="z-index: 100002;">
            <div class="modal" style="max-width: 500px; padding: 28px; background: #1C1026; color: white; border: 1px solid rgba(255,255,255,0.15);">
                <button class="close-modal" onclick="toggleMeasurementModal()" style="color: white; width: 32px; height: 32px;">✕</button>
                <h2 style="font-family: 'Playfair Display', serif; color: #D4AF37; margin-bottom: 8px; font-size: 1.6rem;">📐 Bespoke Tailoring Sheet</h2>
                <p style="color: rgba(255,255,255,0.6); font-size: 0.85rem; margin-bottom: 20px;">Enter your custom measurements. These will be securely stored and linked to your order.</p>
                <form id="measurementForm" onsubmit="submitMeasurementSheet(event)">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                        <div style="display:flex; flex-direction:column; gap:4px;">
                            <label style="font-size: 0.8rem; font-weight:600; color: #D4AF37;">Name</label>
                            <input type="text" id="m-name" required placeholder="John Doe" style="padding: 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: white;" />
                        </div>
                        <div style="display:flex; flex-direction:column; gap:4px;">
                            <label style="font-size: 0.8rem; font-weight:600; color: #D4AF37;">Phone</label>
                            <input type="text" id="m-phone" required placeholder="+234..." style="padding: 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: white;" />
                        </div>
                        <div style="display:flex; flex-direction:column; gap:4px; grid-column: 1 / -1;">
                            <label style="font-size: 0.8rem; font-weight:600; color: #D4AF37;">Email</label>
                            <input type="email" id="m-email" required placeholder="john@example.com" style="padding: 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2); background: rgba(0,0,0,0.3); color: white;" />
                        </div>
                        <div style="display:flex; flex-direction:column; gap:4px;">
                            <label style="font-size: 0.8rem; color: rgba(255,255,255,0.8);">Shoulder (inches)</label>
                            <input type="number" id="m-shoulder" step="0.1" placeholder="18" style="padding: 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: white;" />
                        </div>
                        <div style="display:flex; flex-direction:column; gap:4px;">
                            <label style="font-size: 0.8rem; color: rgba(255,255,255,0.8);">Chest (inches)</label>
                            <input type="number" id="m-chest" step="0.1" placeholder="40" style="padding: 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: white;" />
                        </div>
                        <div style="display:flex; flex-direction:column; gap:4px;">
                            <label style="font-size: 0.8rem; color: rgba(255,255,255,0.8);">Waist (inches)</label>
                            <input type="number" id="m-waist" step="0.1" placeholder="34" style="padding: 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: white;" />
                        </div>
                        <div style="display:flex; flex-direction:column; gap:4px;">
                            <label style="font-size: 0.8rem; color: rgba(255,255,255,0.8);">Hips (inches)</label>
                            <input type="number" id="m-hips" step="0.1" placeholder="42" style="padding: 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: white;" />
                        </div>
                        <div style="display:flex; flex-direction:column; gap:4px;">
                            <label style="font-size: 0.8rem; color: rgba(255,255,255,0.8);">Sleeve (inches)</label>
                            <input type="number" id="m-sleeve" step="0.1" placeholder="25" style="padding: 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: white;" />
                        </div>
                        <div style="display:flex; flex-direction:column; gap:4px;">
                            <label style="font-size: 0.8rem; color: rgba(255,255,255,0.8);">Length (inches)</label>
                            <input type="number" id="m-length" step="0.1" placeholder="41" style="padding: 6px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: white;" />
                        </div>
                        <div style="display:flex; flex-direction:column; gap:4px; grid-column: 1 / -1;">
                            <label style="font-size: 0.8rem; color: rgba(255,255,255,0.8);">Height (ft/inches)</label>
                            <input type="text" id="m-height" placeholder="e.g. 5ft 9in" style="padding: 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: white;" />
                        </div>
                        <div style="display:flex; flex-direction:column; gap:4px; grid-column: 1 / -1;">
                            <label style="font-size: 0.8rem; color: rgba(255,255,255,0.8);">Requests / Notes</label>
                            <textarea id="m-notes" placeholder="Any specific fit guidelines..." style="padding: 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: white; resize: vertical; min-height: 50px;"></textarea>
                        </div>
                    </div>
                    <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
                        <button type="button" class="btn-secondary" onclick="toggleMeasurementModal()" style="padding: 8px 16px; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: white; border-radius: 4px; cursor: pointer;">Cancel</button>
                        <button type="submit" style="padding: 8px 16px; background: #D4AF37; border: none; color: #1C1026; font-weight: 700; border-radius: 4px; cursor: pointer;">Save Tailoring Sheet</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(measurementContainer);
}

// 2. Cart Navigation Link Injection
function initCartNavigation() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks && !document.querySelector('.cart-nav-btn')) {
        const cartLi = document.createElement('li');
        cartLi.innerHTML = `<a href="#" onclick="toggleCartDrawer(event)" class="cart-nav-btn">🛒 Cart (<span id="cart-badge-count">0</span>)</a>`;
        navLinks.appendChild(cartLi);
    }
}

// 3. Cart State Methods
function getCart() {
    return JSON.parse(localStorage.getItem('eyiwunmi_cart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('eyiwunmi_cart', JSON.stringify(cart));
    updateCartBadge();
    renderCart();
}

function updateCartBadge() {
    const cart = getCart();
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const badge = document.getElementById('cart-badge-count');
    if (badge) {
        badge.textContent = count;
    }
}

// 4. Cart Drawer View Controls
function toggleCartDrawer(e) {
    if (e) e.preventDefault();
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    if (drawer && overlay) {
        drawer.classList.toggle('open');
        overlay.classList.toggle('open');
        if (drawer.classList.contains('open')) {
            renderCart();
        }
    }
}

function renderCart() {
    const list = document.getElementById('cartItemsList');
    const grandTotalSpan = document.getElementById('cart-grand-total');
    if (!list || !grandTotalSpan) return;

    const cart = getCart();
    if (cart.length === 0) {
        list.innerHTML = `<div style="text-align: center; color: rgba(255,255,255,0.4); margin-top: 40px;">🛒 Your cart is empty.</div>`;
        grandTotalSpan.textContent = '₦0';
        return;
    }

    let grandTotal = 0;

    list.innerHTML = cart.map((item, index) => {
        const priceNum = parseInt(item.price.replace(/[^\d]/g, '')) || 0;
        const subtotal = priceNum * item.quantity;
        grandTotal += subtotal;

        const imgUrl = item.image.startsWith('http') ? item.image : '../' + item.image;

        return `
            <div class="cart-item">
                <img src="${imgUrl}" class="cart-item-img" onerror="this.src='../eyiwunmi_images/logo.png'" alt="${item.name}" />
                <div class="cart-item-details">
                    <div>
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-meta">Size: ${item.size} | Color: <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${item.color}; border:1px solid rgba(255,255,255,0.3); vertical-align:middle;"></span></div>
                    </div>
                    <div>
                        <div class="cart-item-price">${item.price}</div>
                        <div class="cart-item-qty">
                            <button class="cart-qty-btn" onclick="updateQty(${index}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="cart-qty-btn" onclick="updateQty(${index}, 1)">+</button>
                            <button class="cart-item-remove" onclick="removeCartItem(${index})" style="margin-left:auto;">🗑️ Remove</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    grandTotalSpan.textContent = '₦' + grandTotal.toLocaleString();
}

function updateQty(index, diff) {
    const cart = getCart();
    cart[index].quantity += diff;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    saveCart(cart);
}

function removeCartItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
}

// 5. Add to Cart Logic
function addToCart(item, size, color) {
    const cart = getCart();
    const existing = cart.find(x => x.id === item.id && x.size === size && x.color === color);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            size: size,
            color: color,
            quantity: 1
        });
    }

    saveCart(cart);
    
    // Open cart drawer immediately for premium feedback
    toggleCartDrawer();
}

// 6. Bespoke Sizing Logic
function handleMeasurementCheckbox(checkbox) {
    if (checkbox.checked) {
        toggleMeasurementModal();
    } else {
        localStorage.removeItem('eyiwunmi_temp_measurements');
    }
}

function toggleMeasurementModal() {
    const modal = document.getElementById('measurementModal');
    if (modal) {
        modal.classList.toggle('open');
        if (!modal.classList.contains('open') && !localStorage.getItem('eyiwunmi_temp_measurements')) {
            const checkbox = document.getElementById('cart-attach-measurements');
            if (checkbox) checkbox.checked = false;
        }
    }
}

async function submitMeasurementSheet(e) {
    e.preventDefault();
    const name = document.getElementById('m-name').value.trim();
    const phone = document.getElementById('m-phone').value.trim();
    const email = document.getElementById('m-email').value.trim();
    const shoulder = document.getElementById('m-shoulder').value;
    const chest = document.getElementById('m-chest').value;
    const waist = document.getElementById('m-waist').value;
    const hips = document.getElementById('m-hips').value;
    const sleeve = document.getElementById('m-sleeve').value;
    const length = document.getElementById('m-length').value;
    const height = document.getElementById('m-height').value.trim();
    const notes = document.getElementById('m-notes').value.trim();

    const data = { name, phone, email, shoulder, chest, waist, hips, sleeve, length, height, notes };

    // Submit sheet to backend server (saving in Sanity.io)
    try {
        const response = await fetch('http://localhost:5000/api/measurements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            console.log('✅ Measurement card saved to Sanity CMS');
        }
    } catch (err) {
        console.warn('Backend server offline during measurement submission:', err);
    }

    // Save locally to attach to WhatsApp message
    localStorage.setItem('eyiwunmi_temp_measurements', JSON.stringify(data));
    toggleMeasurementModal();
    alert('Tailoring sheet saved successfully and attached to your order!');
}

// 7. Checkout Logic
function proceedToCartCheckout() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    let messageText = 'Hi Eyiwunmi Fashion! ✦\nI would like to place an order for the following bespoke pieces:\n\n';
    let grandTotal = 0;

    cart.forEach((item, index) => {
        const priceNum = parseInt(item.price.replace(/[^\d]/g, '')) || 0;
        const subtotal = priceNum * item.quantity;
        grandTotal += subtotal;

        messageText += `${index + 1}. *${item.name}*\n   - Size: ${item.size}\n   - Color: ${item.color}\n   - Qty: ${item.quantity}\n   - Price: ${item.price}\n\n`;
    });

    messageText += `*Grand Total: ₦${grandTotal.toLocaleString()}*\n\n`;

    // Append bespoke measurements if present
    const savedMeasurements = localStorage.getItem('eyiwunmi_temp_measurements');
    const checkbox = document.getElementById('cart-attach-measurements');
    
    if (checkbox && checkbox.checked && savedMeasurements) {
        const m = JSON.parse(savedMeasurements);
        messageText += `*📐 Attached Tailoring Sheet:*\n`;
        messageText += `- Client Name: ${m.name}\n`;
        messageText += `- Height: ${m.height || '-'}\n`;
        if (m.shoulder) messageText += `- Shoulder: ${m.shoulder}"\n`;
        if (m.chest) messageText += `- Chest: ${m.chest}"\n`;
        if (m.waist) messageText += `- Waist: ${m.waist}"\n`;
        if (m.hips) messageText += `- Hips: ${m.hips}"\n`;
        if (m.sleeve) messageText += `- Sleeve: ${m.sleeve}"\n`;
        if (m.length) messageText += `- Length: ${m.length}"\n`;
        if (m.notes) messageText += `- Special Requests: ${m.notes}\n`;
    }

    const encodedText = encodeURIComponent(messageText);
    window.open(`https://wa.me/2348027016178?text=${encodedText}`, '_blank');
}
