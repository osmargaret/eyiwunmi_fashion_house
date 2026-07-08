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
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'Eyiwunmi2026';

let sanityClient = null;

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

// Initial load
loadPersistedConfig();
initSanity();

// Admin Authentication endpoint
app.post('/api/login', (req, res) => {
    const { passcode } = req.body;
    if (passcode === ADMIN_PASSCODE) {
        res.json({ success: true, token: 'eyiwunmi_admin_authenticated_session_' + Date.now() });
    } else {
        res.status(401).json({ error: 'Invalid passcode entered.' });
    }
});

// Endpoint for admin dashboard to update config dynamically
app.post('/api/config', (req, res) => {
    const { projectId, dataset, token } = req.body;

    if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
    }

    try {
        fs.writeFileSync(configPath, JSON.stringify({ projectId, dataset, token }, null, 2), 'utf8');
        
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

// Enquiries endpoint
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

// Measurements submission endpoint
app.post('/api/measurements', async (req, res) => {
    const { name, email, phone, shoulder, chest, waist, hips, sleeve, length, height, notes } = req.body;

    if (!name || !email || !phone) {
        return res.status(400).json({ error: 'Name, email, and phone number are required.' });
    }

    if (sanityClient) {
        try {
            const doc = {
                _type: 'measurement',
                name,
                email,
                phone,
                shoulder,
                chest,
                waist,
                hips,
                sleeve,
                length,
                height,
                notes,
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

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', sanityActive: !!sanityClient });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
