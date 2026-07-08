// ============================================================
// SANITY.IO CLIENT CONFIGURATION
// ============================================================
// Input your credentials below once you sign up on sanity.io.
// Leave projectId blank to continue using the local localStorage database.
const SANITY_CONFIG = {
    projectId: '', // E.g. 'ab34ef79'
    dataset: 'production',
    apiVersion: '2026-07-07',
    useCdn: false // Disable CDN to ensure fresh reads during editing/mutations
};

// Dynamically load config overrides from localStorage if present
try {
    const savedConfig = localStorage.getItem('eyiwunmi_sanity_config');
    if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        if (parsed.projectId) SANITY_CONFIG.projectId = parsed.projectId.trim();
        if (parsed.dataset) SANITY_CONFIG.dataset = parsed.dataset.trim();
        if (parsed.token) SANITY_CONFIG.token = parsed.token.trim();
    }
} catch (e) {
    console.warn('Could not load Sanity dynamic config:', e);
}
