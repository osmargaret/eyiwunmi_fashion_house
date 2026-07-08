// ============================================================
// SANITY.IO OUTFIT SCHEMA CONFIGURATION
// ============================================================
// Copy the contents below and save it as "outfit.js" in your Sanity Studio
// schema folder (e.g. schemas/outfit.js or schemaTypes/outfit.js)

export default {
    name: 'outfit',
    title: 'Outfit',
    type: 'document',
    fields: [
        {
            name: 'id',
            title: 'ID',
            type: 'number',
            description: 'Unique numeric identifier for the outfit (e.g., 1, 2, 3...)',
            validation: Rule => Rule.required()
        },
        {
            name: 'name',
            title: 'Outfit Name',
            type: 'string',
            description: 'E.g., Elegant Navy Blue Senator Style',
            validation: Rule => Rule.required()
        },
        {
            name: 'category',
            title: 'Category',
            type: 'string',
            options: {
                list: [
                    { title: 'Men', value: 'men' },
                    { title: 'Women', value: 'women' },
                    { title: 'Kids', value: 'kids' },
                    { title: 'Asoebi', value: 'asoebi' }
                ]
            },
            validation: Rule => Rule.required()
        },
        {
            name: 'image',
            title: 'Outfit Image (Full-Length)',
            type: 'image',
            options: {
                hotspot: true // Enables manual cropping and focal point settings
            },
            validation: Rule => Rule.required()
        },
        {
            name: 'price',
            title: 'Current Price',
            type: 'string',
            description: 'Include currency symbol, e.g. ₦75,000',
            validation: Rule => Rule.required()
        },
        {
            name: 'oldPrice',
            title: 'Old Price (Optional)',
            type: 'string',
            description: 'For displaying discounts, e.g. ₦90,000'
        },
        {
            name: 'description',
            title: 'Description Text',
            type: 'text',
            description: 'Detailed description of fabric, design, and styling options.',
            validation: Rule => Rule.required()
        },
        {
            name: 'colours',
            title: 'Available Colours',
            type: 'array',
            of: [{ type: 'string' }],
            description: 'HEX codes or names of colours (e.g., "#000000", "Navy Blue")'
        },
        {
            name: 'sizes',
            title: 'Available Sizes',
            type: 'string',
            description: 'Comma separated list, e.g. S, M, L, XL'
        },
        {
            name: 'fabric',
            title: 'Fabric Material',
            type: 'string',
            description: 'E.g. Premium Cashmere, Polish Cotton'
        },
        {
            name: 'availability',
            title: 'Stock Availability Status',
            type: 'string',
            options: {
                list: [
                    { title: 'In Stock', value: 'In Stock' },
                    { title: 'Made to Order', value: 'Made to Order' },
                    { title: 'Out of Stock', value: 'Out of Stock' }
                ]
            },
            validation: Rule => Rule.required()
        },
        {
            name: 'badge',
            title: 'Badge Style (Optional)',
            type: 'string',
            options: {
                list: [
                    { title: 'New (Purple)', value: 'new' },
                    { title: 'Sale (Teal)', value: 'sale' }
                ]
            }
        },
        {
            name: 'badgeText',
            title: 'Badge Label (Optional)',
            type: 'string',
            description: 'E.g., New, Sale, Trending, Hot'
        }
    ]
};
