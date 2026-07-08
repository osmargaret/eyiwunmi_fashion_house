const fs = require('fs');
const path = require('path');

const repoDir = 'C:\\Users\\cleme\\Desktop\\eyiwunmifashionproject.html';
const indexPath = path.join(repoDir, 'eyiwunmi_user', 'index.html');
const wardrobePath = path.join(repoDir, 'eyiwunmi_user', 'wardrobe.html');

const injectionScripts = `
    <!-- Sanity Headless CMS Client & Configuration -->
    <script src="https://unpkg.com/@sanity/client/umd/sanityClient.js"></script>
    <script src="sanity-config.js"></script>
`;

const jsInitializer = `
        // ============================================================
        // SANITY INTEGRATION INITIALIZER
        // ============================================================
        let isUsingSanity = false;
        let sanityClientInstance = null;

        if (typeof SANITY_CONFIG !== 'undefined' && SANITY_CONFIG.projectId) {
            try {
                sanityClientInstance = SanityClient.createClient(SANITY_CONFIG);
                isUsingSanity = true;
                console.log('🔌 Connected to Sanity.io Headless CMS');
            } catch (err) {
                console.error('Failed to initialize Sanity Client:', err);
            }
        }
`;

try {
    // ------------------------------------------------------------
    // INDEX.HTML
    // ------------------------------------------------------------
    let indexHtml = fs.readFileSync(indexPath, 'utf8');
    
    // Inject scripts in head
    indexHtml = indexHtml.replace('</head>', injectionScripts + '</head>');

    // Inject JS initializer after outfits variable
    const indexLsTarget = "let outfits = JSON.parse(localStorage.getItem('eyiwunmi_outfits') || '[]');";
    indexHtml = indexHtml.replace(indexLsTarget, indexLsTarget + jsInitializer);

    // Update renderCards image resolving path
    const cardTemplateIndexOld = `<img src="../\${item.image}" alt="\${item.name}" class="outfit-img" onerror="this.src='../eyiwunmi_images/logo.png'" />`;
    const cardTemplateIndexNew = `<img src="\${item.image.startsWith('http') ? item.image : '../' + item.image}" alt="\${item.name}" class="outfit-img" onerror="this.src='../eyiwunmi_images/logo.png'" />`;
    indexHtml = indexHtml.replace(cardTemplateIndexOld, cardTemplateIndexNew);

    // Update renderHome logic
    const renderHomeOld = `        function renderHome() {
            renderCards(homeGrid, outfits, 6);
        }`;
    const renderHomeNew = `        function renderHome() {
            if (isUsingSanity && sanityClientInstance) {
                sanityClientInstance.fetch(\`*[_type == "outfit"] | order(id asc) {
                    id, name, category, "image": image.asset->url, price, oldPrice, description, colours, sizes, fabric, availability, badge, badgeText
                }\`).then(sanityOutfits => {
                    if (sanityOutfits && sanityOutfits.length > 0) {
                        outfits = sanityOutfits;
                        localStorage.setItem('eyiwunmi_outfits', JSON.stringify(outfits));
                    }
                    renderCards(homeGrid, outfits, 6);
                }).catch(err => {
                    console.error('Sanity fetch failed, falling back to local database:', err);
                    renderCards(homeGrid, outfits, 6);
                });
            } else {
                renderCards(homeGrid, outfits, 6);
            }
        }`;
    indexHtml = indexHtml.replace(renderHomeOld, renderHomeNew);

    fs.writeFileSync(indexPath, indexHtml, 'utf8');
    console.log('Integrated Sanity client in index.html');

} catch (err) {
    console.error('Error integrating index.html:', err);
}

try {
    // ------------------------------------------------------------
    // WARDROBE.HTML
    // ------------------------------------------------------------
    let wardrobeHtml = fs.readFileSync(wardrobePath, 'utf8');

    // Inject scripts in head
    wardrobeHtml = wardrobeHtml.replace('</head>', injectionScripts + '</head>');

    // Inject JS initializer after outfits variable
    const wardrobeLsTarget = "let outfits = JSON.parse(localStorage.getItem('eyiwunmi_outfits') || '[]');";
    wardrobeHtml = wardrobeHtml.replace(wardrobeLsTarget, wardrobeLsTarget + jsInitializer);

    // Update renderCards image resolving path
    const cardTemplateWardrobeOld = `<img src="../\${item.image}" alt="\${item.name}" class="outfit-img" onerror="this.src='../eyiwunmi_images/logo.png'" />`;
    const cardTemplateWardrobeNew = `<img src="\${item.image.startsWith('http') ? item.image : '../' + item.image}" alt="\${item.name}" class="outfit-img" onerror="this.src='../eyiwunmi_images/logo.png'" />`;
    wardrobeHtml = wardrobeHtml.replace(cardTemplateWardrobeOld, cardTemplateWardrobeNew);

    // Update openModal image resolving path
    const modalImgOld = "document.getElementById('modalImg').src = '../' + item.image;";
    const modalImgNew = "document.getElementById('modalImg').src = item.image.startsWith('http') ? item.image : '../' + item.image;";
    wardrobeHtml = wardrobeHtml.replace(modalImgOld, modalImgNew);

    // Update renderGallery logic
    const renderGalleryOld = `        function renderGallery() {
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
        }`;
    
    const renderGalleryNew = `        function renderGallery() {
            if (isUsingSanity && sanityClientInstance) {
                sanityClientInstance.fetch(\`*[_type == "outfit"] | order(id asc) {
                    id, name, category, "image": image.asset->url, price, oldPrice, description, colours, sizes, fabric, availability, badge, badgeText
                }\`).then(sanityOutfits => {
                    if (sanityOutfits && sanityOutfits.length > 0) {
                        outfits = sanityOutfits;
                        localStorage.setItem('eyiwunmi_outfits', JSON.stringify(outfits));
                    }
                    renderGalleryFallback();
                }).catch(err => {
                    console.error('Sanity fetch failed, falling back to local database:', err);
                    renderGalleryFallback();
                });
            } else {
                renderGalleryFallback();
            }
        }

        function renderGalleryFallback() {
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
        }`;

    wardrobeHtml = wardrobeHtml.replace(renderGalleryOld, renderGalleryNew);

    fs.writeFileSync(wardrobePath, wardrobeHtml, 'utf8');
    console.log('Integrated Sanity client in wardrobe.html');

} catch (err) {
    console.error('Error integrating wardrobe.html:', err);
}
