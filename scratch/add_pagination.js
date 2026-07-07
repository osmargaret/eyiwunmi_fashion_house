const fs = require('fs');
const path = require('path');

const repoDir = 'C:\\Users\\cleme\\Desktop\\eyiwunmifashionproject.html';
const cssPath = path.join(repoDir, 'eyiwunmi_user', 'index.css');
const wardrobePath = path.join(repoDir, 'eyiwunmi_user', 'wardrobe.html');

// 1. Pagination CSS to append to index.css
const paginationCss = `
/* ===== PAGINATION ===== */
.pagination-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 40px;
}

.pagination-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 2px solid rgba(107, 59, 140, 0.15);
    background: var(--white);
    color: var(--purple-700);
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: var(--transition);
}

.pagination-btn:hover:not(:disabled) {
    background: var(--purple-100);
    border-color: var(--purple-500);
    transform: translateY(-2px);
}

.pagination-btn.active {
    background: linear-gradient(135deg, var(--purple-700), var(--purple-500));
    color: var(--white);
    border-color: transparent;
    box-shadow: 0 4px 15px rgba(107, 59, 140, 0.25);
}

.pagination-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}
`;

try {
    // Append CSS
    let cssContent = fs.readFileSync(cssPath, 'utf8');
    if (!cssContent.includes('/* ===== PAGINATION ===== */')) {
        fs.writeFileSync(cssPath, cssContent + '\n' + paginationCss, 'utf8');
        console.log('Appended pagination CSS to index.css');
    }
} catch (err) {
    console.error('Error updating index.css:', err);
}

try {
    // Modify wardrobe.html
    let html = fs.readFileSync(wardrobePath, 'utf8');
    
    // Inject HTML container right below galleryGrid
    const gridDiv = '<div class="gallery-grid" id="galleryGrid"></div>';
    const gridDivReplacement = `<div class="gallery-grid" id="galleryGrid"></div>\n            <div class="pagination-container" id="paginationControls"></div>`;
    html = html.replace(gridDiv, gridDivReplacement);

    // Update wardrobe.html JavaScript variables
    const varsTarget = "let currentCategory = 'all';";
    const varsReplacement = "let currentCategory = 'all';\n        let currentGalleryPage = 1;\n        const itemsPerPage = 6;";
    html = html.replace(varsTarget, varsReplacement);

    // Update filter tabs listener to reset current page
    const tabsTarget = `galleryTabs.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                galleryTabs.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCategory = btn.dataset.category;
                renderGallery();
            });
        });`;
    
    const tabsReplacement = `galleryTabs.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                galleryTabs.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCategory = btn.dataset.category;
                currentGalleryPage = 1; // Reset to page 1 on filter click
                renderGallery();
            });
        });`;
    html = html.replace(tabsTarget, tabsReplacement);

    // Update renderGallery() and pagination controls logic
    const renderTarget = `        function renderGallery() {
            renderCards(galleryGrid, getFilteredOutfits());
        }`;

    const renderReplacement = `        function renderGallery() {
            const filtered = getFilteredOutfits();
            const totalItems = filtered.length;
            const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
            
            // Adjust current page if out of bounds
            if (currentGalleryPage > totalPages) {
                currentGalleryPage = totalPages;
            }
            if (currentGalleryPage < 1) {
                currentGalleryPage = 1;
            }

            const startIndex = (currentGalleryPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const pageItems = filtered.slice(startIndex, endIndex);

            renderCards(galleryGrid, pageItems);
            renderPaginationControls(totalPages);
        }

        function renderPaginationControls(totalPages) {
            const controls = document.getElementById('paginationControls');
            if (!controls) return;

            if (totalPages <= 1) {
                controls.innerHTML = '';
                return;
            }

            let html = '';
            
            // Prev button
            html += \`<button class="pagination-btn" \${currentGalleryPage === 1 ? 'disabled' : ''} onclick="changeGalleryPage(\${currentGalleryPage - 1})">‹</button>\`;
            
            // Page buttons
            for (let i = 1; i <= totalPages; i++) {
                html += \`<button class="pagination-btn \${currentGalleryPage === i ? 'active' : ''}" onclick="changeGalleryPage(\${i})">\${i}</button>\`;
            }

            // Next button
            html += \`<button class="pagination-btn" \${currentGalleryPage === totalPages ? 'disabled' : ''} onclick="changeGalleryPage(\${currentGalleryPage + 1})">›</button>\`;

            controls.innerHTML = html;
        }

        window.changeGalleryPage = function(pageNumber) {
            currentGalleryPage = pageNumber;
            renderGallery();
            // Smooth scroll back to wardrobe section top
            document.getElementById('galleryTabs').scrollIntoView({ behavior: 'smooth' });
        }`;
    
    html = html.replace(renderTarget, renderReplacement);

    fs.writeFileSync(wardrobePath, html, 'utf8');
    console.log('Successfully added pagination logic to wardrobe.html');

} catch (err) {
    console.error('Error updating wardrobe.html:', err);
}
