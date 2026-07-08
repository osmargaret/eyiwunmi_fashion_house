const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@sanity/client');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const configPath = path.join(__dirname, 'config.json');
const analyticsPath = path.join(__dirname, 'analytics.json');

let sanityClient = null;

// ============================================================
// CONFIG & SANITY INIT
// ============================================================
function loadPersistedConfig() {
    if (fs.existsSync(configPath)) {
        try {
            const data = fs.readFileSync(configPath, 'utf8');
            const parsed = JSON.parse(data);
            process.env.SANITY_PROJECT_ID = parsed.projectId || '';
            process.env.SANITY_DATASET = parsed.dataset || 'production';
            process.env.SANITY_WRITE_TOKEN = parsed.token || '';
            console.log('📦 Loaded persisted CMS credentials from config.json');
        } catch (e) {
            console.error('Failed to parse config.json:', e);
        }
    }
}

function getAdminPasscode() {
    if (fs.existsSync(configPath)) {
        try {
            const parsed = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            if (parsed.adminPasscode) return parsed.adminPasscode;
        } catch (e) { /* fall through */ }
    }
    return process.env.ADMIN_PASSCODE || 'Eyiwunmi2026';
}

function initSanity() {
    const projectId = process.env.SANITY_PROJECT_ID;
    const dataset = process.env.SANITY_DATASET || 'production';
    const token = process.env.SANITY_WRITE_TOKEN;

    if (projectId && token) {
        try {
            sanityClient = createClient({
                projectId,
                dataset,
                token,
                apiVersion: '2026-07-07',
                useCdn: false
            });
            console.log('🔌 Connected to Sanity.io CMS');
        } catch (e) {
            console.error('Failed to initialize Sanity Client:', e);
            sanityClient = null;
        }
    } else {
        console.warn('⚠️ Sanity Project ID or Write Token is missing');
        sanityClient = null;
    }
}

loadPersistedConfig();
initSanity();

// ============================================================
// ANALYTICS HELPERS
// ============================================================
function loadAnalytics() {
    if (fs.existsSync(analyticsPath)) {
        try {
            return JSON.parse(fs.readFileSync(analyticsPath, 'utf8'));
        } catch (e) { /* fall through */ }
    }
    return { pageViews: {}, outfitViews: {}, cartAdds: 0, checkouts: 0, events: [] };
}

function saveAnalytics(data) {
    fs.writeFileSync(analyticsPath, JSON.stringify(data, null, 2), 'utf8');
}

// ============================================================
// AUTH ENDPOINTS
// ============================================================
app.post('/api/login', (req, res) => {
    const { passcode } = req.body;
    if (passcode === getAdminPasscode()) {
        res.json({ success: true, token: 'eyiwunmi_admin_authenticated_session_' + Date.now() });
    } else {
        res.status(401).json({ error: 'Invalid passcode entered.' });
    }
});

app.post('/api/change-passcode', (req, res) => {
    const { currentPasscode, newPasscode } = req.body;

    if (!currentPasscode || !newPasscode) {
        return res.status(400).json({ error: 'Current and new passcodes are required.' });
    }

    if (newPasscode.length < 6) {
        return res.status(400).json({ error: 'New passcode must be at least 6 characters.' });
    }

    if (currentPasscode !== getAdminPasscode()) {
        return res.status(401).json({ error: 'Current passcode is incorrect.' });
    }

    try {
        let config = {};
        if (fs.existsSync(configPath)) {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
        config.adminPasscode = newPasscode;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
        res.json({ success: true, message: 'Passcode updated successfully.' });
    } catch (e) {
        console.error('Failed to update passcode:', e);
        res.status(500).json({ error: 'Failed to save new passcode.' });
    }
});

// ============================================================
// CONFIG ENDPOINT
// ============================================================
app.post('/api/config', (req, res) => {
    const { projectId, dataset, token } = req.body;

    if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
    }

    try {
        let config = {};
        if (fs.existsSync(configPath)) {
            config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
        config.projectId = projectId;
        config.dataset = dataset || 'production';
        config.token = token || '';
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

        process.env.SANITY_PROJECT_ID = projectId;
        process.env.SANITY_DATASET = dataset || 'production';
        process.env.SANITY_WRITE_TOKEN = token || '';

        initSanity();
        res.json({ success: true, message: 'Server configured successfully', sanityActive: !!sanityClient });
    } catch (e) {
        console.error('Failed to save config:', e);
        res.status(500).json({ error: 'Failed to write config file.' });
    }
});

// ============================================================
// ENQUIRIES ENDPOINT
// ============================================================
app.post('/api/enquiries', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    if (sanityClient) {
        try {
            const doc = {
                _type: 'enquiry',
                name,
                email,
                message,
                submittedAt: new Date().toISOString()
            };
            const result = await sanityClient.create(doc);
            res.status(201).json({ success: true, docId: result._id });
        } catch (e) {
            console.error('Failed to write to Sanity:', e);
            res.status(500).json({ error: 'Failed to submit enquiry to CMS.' });
        }
    } else {
        res.status(503).json({ error: 'CMS connection not configured on server.' });
    }
});

// ============================================================
// MEASUREMENTS ENDPOINT
// ============================================================
app.post('/api/measurements', async (req, res) => {
    const { name, email, phone, shoulder, chest, waist, hips, sleeve, length, height, notes } = req.body;

    if (!name || !email || !phone) {
        return res.status(400).json({ error: 'Name, email, and phone number are required.' });
    }

    if (sanityClient) {
        try {
            const doc = {
                _type: 'measurement',
                name, email, phone, shoulder, chest, waist, hips, sleeve, length, height, notes,
                submittedAt: new Date().toISOString()
            };
            const result = await sanityClient.create(doc);
            res.status(201).json({ success: true, docId: result._id });
        } catch (e) {
            console.error('Failed to write measurement to Sanity:', e);
            res.status(500).json({ error: 'Failed to save measurement card to CMS.' });
        }
    } else {
        res.status(503).json({ error: 'CMS connection not configured on server.' });
    }
});

// ============================================================
// ANALYTICS ENDPOINTS
// ============================================================
app.post('/api/analytics', (req, res) => {
    const { type, data } = req.body;
    const analytics = loadAnalytics();
    const today = new Date().toISOString().split('T')[0];

    switch (type) {
        case 'page_view': {
            const page = data?.page || 'unknown';
            if (!analytics.pageViews[today]) analytics.pageViews[today] = {};
            analytics.pageViews[today][page] = (analytics.pageViews[today][page] || 0) + 1;
            break;
        }
        case 'outfit_view': {
            const outfitId = String(data?.outfitId || 'unknown');
            const name = data?.outfitName || 'Unknown';
            if (!analytics.outfitViews[outfitId]) {
                analytics.outfitViews[outfitId] = { name, views: 0 };
            }
            analytics.outfitViews[outfitId].views += 1;
            analytics.outfitViews[outfitId].name = name;
            break;
        }
        case 'cart_add':
            analytics.cartAdds = (analytics.cartAdds || 0) + 1;
            break;
        case 'checkout':
            analytics.checkouts = (analytics.checkouts || 0) + 1;
            break;
        default:
            break;
    }

    // Keep a rolling log of recent events (last 200)
    analytics.events.push({ type, data, timestamp: new Date().toISOString() });
    if (analytics.events.length > 200) {
        analytics.events = analytics.events.slice(-200);
    }

    saveAnalytics(analytics);
    res.json({ success: true });
});

app.get('/api/analytics', (req, res) => {
    const analytics = loadAnalytics();

    // Compute summary stats
    let totalPageViews = 0;
    const dailyViews = [];
    for (const [date, pages] of Object.entries(analytics.pageViews || {})) {
        let dayTotal = 0;
        for (const count of Object.values(pages)) {
            dayTotal += count;
        }
        totalPageViews += dayTotal;
        dailyViews.push({ date, views: dayTotal });
    }
    dailyViews.sort((a, b) => a.date.localeCompare(b.date));

    // Top viewed outfits
    const topOutfits = Object.entries(analytics.outfitViews || {})
        .map(([id, info]) => ({ id, name: info.name, views: info.views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

    res.json({
        totalPageViews,
        totalCartAdds: analytics.cartAdds || 0,
        totalCheckouts: analytics.checkouts || 0,
        dailyViews,
        topOutfits,
        recentEvents: (analytics.events || []).slice(-20).reverse()
    });
});

// ============================================================
// HEALTH
// ============================================================
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', sanityActive: !!sanityClient });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
